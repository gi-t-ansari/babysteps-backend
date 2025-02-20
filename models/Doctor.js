import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workingHours: {
    start: { type: String, required: true }, // Example: "09:00"
    end: { type: String, required: true }, // Example: "17:00"
  },
  specialization: { type: String }, // Optional
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
