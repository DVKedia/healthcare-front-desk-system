import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export default async function handler(req, res) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const result = await pool.query('SELECT * FROM doctors ORDER BY name');
    
    const doctors = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      specialization: row.specialization,
      phone: row.phone,
      email: row.email,
      isAvailable: row.is_available,
      location: row.location,
      createdAt: row.created_at
    }));
    
    res.json(doctors);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  } finally {
    await pool.end();
  }
}
