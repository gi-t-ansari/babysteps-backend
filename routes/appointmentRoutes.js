import express from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

// 📌 GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("doctorId");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 GET a specific appointment
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "doctorId"
    );
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 CREATE a new appointment with validation
router.post("/", async (req, res) => {
  try {
    const { doctorId, date, duration, appointmentType, patientName, notes } =
      req.body;
    if (!doctorId || !date || !duration || !appointmentType || !patientName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Convert time to HH:MM
    const appointmentTime = appointmentDate.toISOString().substring(11, 16);
    if (
      appointmentTime < doctor.workingHours.start ||
      appointmentTime >= doctor.workingHours.end
    ) {
      return res
        .status(400)
        .json({ message: "Appointment time is outside of working hours" });
    }

    // Check for overlapping appointments
    const overlappingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $gte: appointmentDate,
        $lt: new Date(appointmentDate.getTime() + duration * 60000),
      },
    });

    if (overlappingAppointment) {
      return res.status(400).json({ message: "Time slot is already booked" });
    }

    const newAppointment = new Appointment({
      doctorId,
      date: appointmentDate,
      duration,
      appointmentType,
      patientName,
      notes,
    });
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 UPDATE an existing appointment with validation
router.put("/:id", async (req, res) => {
  try {
    const { doctorId, date, duration, appointmentType, patientName, notes } =
      req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointmentDate = new Date(date);
    if (
      appointmentTime < doctor.workingHours.start ||
      appointmentTime >= doctor.workingHours.end
    ) {
      return res
        .status(400)
        .json({ message: "Appointment time is outside of working hours" });
    }

    const overlappingAppointment = await Appointment.findOne({
      doctorId,
      date: {
        $gte: appointmentDate,
        $lt: new Date(appointmentDate.getTime() + duration * 60000),
      },
      _id: { $ne: req.params.id }, // Exclude the current appointment
    });

    if (overlappingAppointment) {
      return res.status(400).json({ message: "Time slot is already booked" });
    }

    appointment.date = appointmentDate;
    appointment.duration = duration;
    appointment.appointmentType = appointmentType;
    appointment.patientName = patientName;
    appointment.notes = notes;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// 📌 DELETE an appointment
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;
