import { 
  type User, 
  type InsertUser,
  type Doctor,
  type InsertDoctor,
  type Patient,
  type InsertPatient,
  type QueueItem,
  type InsertQueueItem,
  type QueueItemWithPatient,
  type Appointment,
  type InsertAppointment,
  type AppointmentWithDetails
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Doctor operations
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  deleteDoctor(id: string): Promise<boolean>;

  // Patient operations
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientByPhone(phone: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;

  // Queue operations
  getQueueItems(): Promise<QueueItemWithPatient[]>;
  getQueueItem(id: string): Promise<QueueItemWithPatient | undefined>;
  createQueueItem(queueItem: InsertQueueItem): Promise<QueueItemWithPatient>;
  updateQueueItem(id: string, queueItem: Partial<InsertQueueItem>): Promise<QueueItemWithPatient | undefined>;
  deleteQueueItem(id: string): Promise<boolean>;
  getNextQueueNumber(): Promise<number>;

  // Appointment operations
  getAppointments(): Promise<AppointmentWithDetails[]>;
  getAppointment(id: string): Promise<AppointmentWithDetails | undefined>;
  getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]>;
  createAppointment(appointment: InsertAppointment): Promise<AppointmentWithDetails>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<AppointmentWithDetails | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private doctors: Map<string, Doctor> = new Map();
  private patients: Map<string, Patient> = new Map();
  private queueItems: Map<string, QueueItem> = new Map();
  private appointments: Map<string, Appointment> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize some sample doctors
    const sampleDoctors: InsertDoctor[] = [
      { name: "Dr. Smith", specialization: "Cardiology", phone: "(555) 101-1001", email: "smith@clinic.com", isAvailable: true },
      { name: "Dr. Johnson", specialization: "Pediatrics", phone: "(555) 101-1002", email: "johnson@clinic.com", isAvailable: false },
      { name: "Dr. Williams", specialization: "General Practice", phone: "(555) 101-1003", email: "williams@clinic.com", isAvailable: true },
    ];

    sampleDoctors.forEach(doctor => {
      this.createDoctor(doctor);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Doctor operations
  async getDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = randomUUID();
    const doctor: Doctor = { 
      ...insertDoctor, 
      id, 
      createdAt: new Date() 
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async updateDoctor(id: string, doctorUpdate: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const existing = this.doctors.get(id);
    if (!existing) return undefined;

    const updated: Doctor = { ...existing, ...doctorUpdate };
    this.doctors.set(id, updated);
    return updated;
  }

  async deleteDoctor(id: string): Promise<boolean> {
    return this.doctors.delete(id);
  }

  // Patient operations
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByPhone(phone: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(patient => patient.phone === phone);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = { 
      ...insertPatient, 
      id, 
      createdAt: new Date() 
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const existing = this.patients.get(id);
    if (!existing) return undefined;

    const updated: Patient = { ...existing, ...patientUpdate };
    this.patients.set(id, updated);
    return updated;
  }

  // Queue operations
  async getQueueItems(): Promise<QueueItemWithPatient[]> {
    const items: QueueItemWithPatient[] = [];
    for (const queueItem of this.queueItems.values()) {
      const patient = this.patients.get(queueItem.patientId);
      if (patient) {
        items.push({ ...queueItem, patient });
      }
    }
    return items.sort((a, b) => a.queueNumber - b.queueNumber);
  }

  async getQueueItem(id: string): Promise<QueueItemWithPatient | undefined> {
    const queueItem = this.queueItems.get(id);
    if (!queueItem) return undefined;

    const patient = this.patients.get(queueItem.patientId);
    if (!patient) return undefined;

    return { ...queueItem, patient };
  }

  async createQueueItem(insertQueueItem: InsertQueueItem): Promise<QueueItemWithPatient> {
    const id = randomUUID();
    const queueItem: QueueItem = { 
      ...insertQueueItem, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.queueItems.set(id, queueItem);

    const patient = this.patients.get(queueItem.patientId);
    if (!patient) throw new Error("Patient not found");

    return { ...queueItem, patient };
  }

  async updateQueueItem(id: string, queueItemUpdate: Partial<InsertQueueItem>): Promise<QueueItemWithPatient | undefined> {
    const existing = this.queueItems.get(id);
    if (!existing) return undefined;

    const updated: QueueItem = { 
      ...existing, 
      ...queueItemUpdate, 
      updatedAt: new Date() 
    };
    this.queueItems.set(id, updated);

    const patient = this.patients.get(updated.patientId);
    if (!patient) return undefined;

    return { ...updated, patient };
  }

  async deleteQueueItem(id: string): Promise<boolean> {
    return this.queueItems.delete(id);
  }

  async getNextQueueNumber(): Promise<number> {
    const items = Array.from(this.queueItems.values());
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.queueNumber)) + 1;
  }

  // Appointment operations
  async getAppointments(): Promise<AppointmentWithDetails[]> {
    const appointments: AppointmentWithDetails[] = [];
    for (const appointment of this.appointments.values()) {
      const patient = this.patients.get(appointment.patientId);
      const doctor = this.doctors.get(appointment.doctorId);
      if (patient && doctor) {
        appointments.push({ ...appointment, patient, doctor });
      }
    }
    return appointments.sort((a, b) => 
      new Date(`${a.appointmentDate} ${a.appointmentTime}`).getTime() - 
      new Date(`${b.appointmentDate} ${b.appointmentTime}`).getTime()
    );
  }

  async getAppointment(id: string): Promise<AppointmentWithDetails | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const patient = this.patients.get(appointment.patientId);
    const doctor = this.doctors.get(appointment.doctorId);
    if (!patient || !doctor) return undefined;

    return { ...appointment, patient, doctor };
  }

  async getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]> {
    const allAppointments = await this.getAppointments();
    return allAppointments.filter(appointment => appointment.appointmentDate === date);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<AppointmentWithDetails> {
    const id = randomUUID();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.appointments.set(id, appointment);

    const patient = this.patients.get(appointment.patientId);
    const doctor = this.doctors.get(appointment.doctorId);
    if (!patient || !doctor) throw new Error("Patient or Doctor not found");

    return { ...appointment, patient, doctor };
  }

  async updateAppointment(id: string, appointmentUpdate: Partial<InsertAppointment>): Promise<AppointmentWithDetails | undefined> {
    const existing = this.appointments.get(id);
    if (!existing) return undefined;

    const updated: Appointment = { 
      ...existing, 
      ...appointmentUpdate, 
      updatedAt: new Date() 
    };
    this.appointments.set(id, updated);

    const patient = this.patients.get(updated.patientId);
    const doctor = this.doctors.get(updated.doctorId);
    if (!patient || !doctor) return undefined;

    return { ...updated, patient, doctor };
  }

  async deleteAppointment(id: string): Promise<boolean> {
    return this.appointments.delete(id);
  }
}

export const storage = new MemStorage();
