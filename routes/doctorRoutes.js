import express from "express";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

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

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date: {
        $gte: selectedDate,
        $lt: new Date(selectedDate.getTime() + 86400000),
      },
    });

    const timeSlots = [];
    let [startHour, startMinute] = doctor.workingHours.start
      .split(":")
      .map(Number);
    const [endHour, endMinute] = doctor.workingHours.end.split(":").map(Number);

    while (
      startHour < endHour ||
      (startHour === endHour && startMinute < endMinute)
    ) {
      const time = `${String(startHour).padStart(2, "0")}:${String(
        startMinute
      ).padStart(2, "0")}`;
      timeSlots.push(time);
      startMinute += 30;
      if (startMinute >= 60) {
        startMinute = 0;
        startHour += 1;
      }
    }

    const bookedSlots = appointments.map((a) =>
      a.date.toISOString().substring(11, 16)
    );
    const availableSlots = timeSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    res.json({ availableSlots });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
