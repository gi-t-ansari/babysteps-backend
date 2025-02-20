import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: { type: Date, required: true },
  duration: { type: Number, required: true }, // Example: 30 or 60 minutes
  appointmentType: { type: String, required: true }, // Example: "Routine Check-Up"
  patientName: { type: String, required: true },
  notes: { type: String },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
