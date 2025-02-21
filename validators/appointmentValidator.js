import * as yup from "yup";

export const appointmentSchema = yup.object().shape({
  doctorId: yup.string().length(24, "Invalid Doctor ID").required(),
  date: yup.date().required("Date is required"),
  duration: yup.number().min(15).max(120).required("Duration is required"),
  appointmentType: yup.string().required("Appointment type is required"),
  patientName: yup.string().required("Patient name is required"),
  notes: yup.string().optional(),
});
