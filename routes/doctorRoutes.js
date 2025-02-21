import express from "express";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import moment from "moment";

const router = express.Router();

// 📌 GET all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 GET a single doctor by ID
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 CREATE a new doctor
router.post("/", async (req, res) => {
  try {
    const { name, workingHours, specialization } = req.body;
    const doctor = new Doctor({ name, workingHours, specialization });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 UPDATE a doctor by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, workingHours, specialization } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { name, workingHours, specialization },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 DELETE a doctor by ID
router.delete("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 GET available slots for a doctor on a given date
router.get("/:id/slots", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const selectedDate = moment(date, "YYYY-MM-DD").startOf("day");

    const startTime = moment(
      `${date} ${doctor.workingHours.start}`,
      "YYYY-MM-DD HH:mm"
    );
    const endTime = moment(
      `${date} ${doctor.workingHours.end}`,
      "YYYY-MM-DD HH:mm"
    );

    // Fetch booked appointments
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date: {
        $gte: startTime.toDate(),
        $lt: endTime.toDate(),
      },
    });

    // Generate time slots
    let timeSlots = [];
    let currentTime = startTime.clone();

    while (currentTime.isBefore(endTime)) {
      timeSlots.push(currentTime.format("HH:mm"));
      currentTime.add(30, "minutes"); // 30-minute intervals
    }

    // Remove booked slots
    const bookedSlots = appointments.map((a) => moment(a.date).format("HH:mm"));
    const availableSlots = timeSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    res.json({ availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
