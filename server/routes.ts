import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDoctorSchema, insertPatientSchema, insertQueueItemSchema, insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Doctor routes
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.post("/api/doctors", async (req, res) => {
    try {
      const doctorData = insertDoctorSchema.parse(req.body);
      const doctor = await storage.createDoctor(doctorData);
      res.status(201).json(doctor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid doctor data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create doctor" });
      }
    }
  });

  app.put("/api/doctors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const doctorData = insertDoctorSchema.partial().parse(req.body);
      const doctor = await storage.updateDoctor(id, doctorData);
      
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.json(doctor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid doctor data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update doctor" });
      }
    }
  });

  app.delete("/api/doctors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDoctor(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create patient" });
      }
    }
  });

  app.get("/api/patients/phone/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const patient = await storage.getPatientByPhone(phone);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  // Queue routes
  app.get("/api/queue", async (req, res) => {
    try {
      const queueItems = await storage.getQueueItems();
      res.json(queueItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch queue" });
    }
  });

  app.post("/api/queue", async (req, res) => {
    try {
      const { patientData, queueData } = req.body;
      
      // Check if patient exists by phone, if not create new patient
      let patient = await storage.getPatientByPhone(patientData.phone);
      if (!patient) {
        const validatedPatientData = insertPatientSchema.parse(patientData);
        patient = await storage.createPatient(validatedPatientData);
      }

      // Get next queue number
      const queueNumber = await storage.getNextQueueNumber();
      
      const queueItemData = {
        ...queueData,
        patientId: patient.id,
        queueNumber,
      };
      
      const validatedQueueData = insertQueueItemSchema.parse(queueItemData);
      const queueItem = await storage.createQueueItem(validatedQueueData);
      
      res.status(201).json(queueItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid queue data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add to queue" });
      }
    }
  });

  app.put("/api/queue/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const queueData = insertQueueItemSchema.partial().parse(req.body);
      const queueItem = await storage.updateQueueItem(id, queueData);
      
      if (!queueItem) {
        return res.status(404).json({ message: "Queue item not found" });
      }
      
      res.json(queueItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid queue data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update queue item" });
      }
    }
  });

  app.delete("/api/queue/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQueueItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Queue item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete queue item" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const { date } = req.query;
      let appointments;
      
      if (date && typeof date === 'string') {
        appointments = await storage.getAppointmentsByDate(date);
      } else {
        appointments = await storage.getAppointments();
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const { patientData, appointmentData } = req.body;
      
      // Check if patient exists by phone, if not create new patient
      let patient = await storage.getPatientByPhone(patientData.phone);
      if (!patient) {
        const validatedPatientData = insertPatientSchema.parse(patientData);
        patient = await storage.createPatient(validatedPatientData);
      }

      const fullAppointmentData = {
        ...appointmentData,
        patientId: patient.id,
      };
      
      const validatedAppointmentData = insertAppointmentSchema.parse(fullAppointmentData);
      const appointment = await storage.createAppointment(validatedAppointmentData);
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create appointment" });
      }
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, appointmentData);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update appointment" });
      }
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAppointment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const queue = await storage.getQueueItems();
      const today = new Date().toISOString().split('T')[0];
      const todaysAppointments = await storage.getAppointmentsByDate(today);
      const doctors = await storage.getDoctors();
      
      const stats = {
        queueTotal: queue.length,
        todaysAppointments: todaysAppointments.length,
        availableDoctors: doctors.filter(d => d.isAvailable).length,
        urgentCases: queue.filter(q => q.isUrgent).length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
