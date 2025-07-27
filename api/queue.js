import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    if (req.method === 'GET') {
      // Get all queue items with patient info
      const result = await pool.query(`
        SELECT q.*, p.name as patient_name, p.phone as patient_phone 
        FROM queue_items q 
        JOIN patients p ON q.patient_id = p.id 
        ORDER BY q.queue_number
      `);
      
      const queueItems = result.rows.map(row => ({
        id: row.id,
        queueNumber: row.queue_number,
        reason: row.reason,
        status: row.status,
        isUrgent: row.is_urgent,
        createdAt: row.created_at,
        patient: {
          id: row.patient_id,
          name: row.patient_name,
          phone: row.patient_phone
        }
      }));
      
      res.json(queueItems);
      
    } else if (req.method === 'POST') {
      const { name, phone, reason, isUrgent } = req.body;
      
      // First, create or find patient
      let patientResult = await pool.query(
        'SELECT id FROM patients WHERE phone = $1',
        [phone]
      );
      
      let patientId;
      if (patientResult.rows.length === 0) {
        // Create new patient
        const newPatient = await pool.query(
          'INSERT INTO patients (name, phone) VALUES ($1, $2) RETURNING id',
          [name, phone]
        );
        patientId = newPatient.rows[0].id;
      } else {
        patientId = patientResult.rows[0].id;
      }
      
      // Get next queue number
      const queueNumberResult = await pool.query(
        'SELECT COALESCE(MAX(queue_number), 0) + 1 as next_number FROM queue_items'
      );
      const queueNumber = queueNumberResult.rows[0].next_number;
      
      // Create queue item
      const queueResult = await pool.query(`
        INSERT INTO queue_items (patient_id, queue_number, reason, is_urgent) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, queue_number, reason, status, is_urgent, created_at
      `, [patientId, queueNumber, reason, isUrgent || false]);
      
      const queueItem = {
        ...queueResult.rows[0],
        queueNumber: queueResult.rows[0].queue_number,
        isUrgent: queueResult.rows[0].is_urgent,
        createdAt: queueResult.rows[0].created_at,
        patient: { id: patientId, name, phone }
      };
      
      res.status(201).json(queueItem);
      
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  } finally {
    await pool.end();
  }
}
