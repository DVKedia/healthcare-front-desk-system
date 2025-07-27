export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      res.status(200).json([]);
    } else if (req.method === 'POST') {
      res.status(201).json({ 
        id: "test-appointment-id", 
        message: "Appointment booked",
        appointment: req.body 
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Appointments API Error' });
  }
}
