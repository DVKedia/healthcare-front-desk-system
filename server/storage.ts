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
  type AppointmentWithDetails,
  users,
  doctors,
  patients,
  queueItems,
  appointments
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, max } from "drizzle-orm";
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

export class DatabaseStorage implements IStorage {
  private initialized = false;

  constructor() {
    // Initialize asynchronously to avoid blocking constructor
    this.initializeData().catch(console.error);
  }

  private async initializeData() {
    if (this.initialized) return;
    
    try {
      // Check if doctors already exist
      const existingDoctors = await db.select().from(doctors).limit(1);
      if (existingDoctors.length > 0) {
        this.initialized = true;
        return;
      }

      // Initialize some sample doctors
      const sampleDoctors: InsertDoctor[] = [
        { name: "Dr. Smith", specialization: "Cardiology", phone: "(555) 101-1001", email: "smith@clinic.com", isAvailable: true },
        { name: "Dr. Johnson", specialization: "Pediatrics", phone: "(555) 101-1002", email: "johnson@clinic.com", isAvailable: false },
        { name: "Dr. Williams", specialization: "General Practice", phone: "(555) 101-1003", email: "williams@clinic.com", isAvailable: true },
      ];

      for (const doctor of sampleDoctors) {
        await this.createDoctor(doctor);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Doctor operations
  async getDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors);
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db
      .insert(doctors)
      .values(insertDoctor)
      .returning();
    return doctor;
  }

  async updateDoctor(id: string, doctorUpdate: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const [doctor] = await db
      .update(doctors)
      .set(doctorUpdate)
      .where(eq(doctors.id, id))
      .returning();
    return doctor || undefined;
  }

  async deleteDoctor(id: string): Promise<boolean> {
    const result = await db.delete(doctors).where(eq(doctors.id, id));
    return result.rowCount > 0;
  }

  // Patient operations
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByPhone(phone: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.phone, phone));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatient(id: string, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set(patientUpdate)
      .where(eq(patients.id, id))
      .returning();
    return patient || undefined;
  }

  // Queue operations
  async getQueueItems(): Promise<QueueItemWithPatient[]> {
    const items = await db.query.queueItems.findMany({
      with: {
        patient: true,
      },
      orderBy: [queueItems.queueNumber],
    });
    return items;
  }

  async getQueueItem(id: string): Promise<QueueItemWithPatient | undefined> {
    const item = await db.query.queueItems.findFirst({
      where: eq(queueItems.id, id),
      with: {
        patient: true,
      },
    });
    return item || undefined;
  }

  async createQueueItem(insertQueueItem: InsertQueueItem): Promise<QueueItemWithPatient> {
    const [queueItem] = await db
      .insert(queueItems)
      .values(insertQueueItem)
      .returning();

    const patient = await this.getPatient(queueItem.patientId);
    if (!patient) throw new Error("Patient not found");

    return { ...queueItem, patient };
  }

  async updateQueueItem(id: string, queueItemUpdate: Partial<InsertQueueItem>): Promise<QueueItemWithPatient | undefined> {
    const [queueItem] = await db
      .update(queueItems)
      .set({ ...queueItemUpdate, updatedAt: new Date() })
      .where(eq(queueItems.id, id))
      .returning();

    if (!queueItem) return undefined;

    const patient = await this.getPatient(queueItem.patientId);
    if (!patient) return undefined;

    return { ...queueItem, patient };
  }

  async deleteQueueItem(id: string): Promise<boolean> {
    const result = await db.delete(queueItems).where(eq(queueItems.id, id));
    return result.rowCount > 0;
  }

  async getNextQueueNumber(): Promise<number> {
    const [result] = await db.select({ maxQueueNumber: max(queueItems.queueNumber) }).from(queueItems);
    return (result?.maxQueueNumber || 0) + 1;
  }

  // Appointment operations
  async getAppointments(): Promise<AppointmentWithDetails[]> {
    const appointmentList = await db.query.appointments.findMany({
      with: {
        patient: true,
        doctor: true,
      },
      orderBy: [appointments.appointmentDate, appointments.appointmentTime],
    });
    return appointmentList;
  }

  async getAppointment(id: string): Promise<AppointmentWithDetails | undefined> {
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        patient: true,
        doctor: true,
      },
    });
    return appointment || undefined;
  }

  async getAppointmentsByDate(date: string): Promise<AppointmentWithDetails[]> {
    const appointmentList = await db.query.appointments.findMany({
      where: eq(appointments.appointmentDate, date),
      with: {
        patient: true,
        doctor: true,
      },
      orderBy: [appointments.appointmentTime],
    });
    return appointmentList;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<AppointmentWithDetails> {
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();

    const patient = await this.getPatient(appointment.patientId);
    const doctor = await this.getDoctor(appointment.doctorId);
    if (!patient || !doctor) throw new Error("Patient or Doctor not found");

    return { ...appointment, patient, doctor };
  }

  async updateAppointment(id: string, appointmentUpdate: Partial<InsertAppointment>): Promise<AppointmentWithDetails | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...appointmentUpdate, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    if (!appointment) return undefined;

    const patient = await this.getPatient(appointment.patientId);
    const doctor = await this.getDoctor(appointment.doctorId);
    if (!patient || !doctor) return undefined;

    return { ...appointment, patient, doctor };
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
