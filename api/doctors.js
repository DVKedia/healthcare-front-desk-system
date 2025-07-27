export default async function handler(req, res) {
  try {
    // Simple test response
    const doctors = [
      { id: "1", name: "Dr. Smith", specialization: "Cardiology", isAvailable: true },
      { id: "2", name: "Dr. Johnson", specialization: "Pediatrics", isAvailable: false },
      { id: "3", name: "Dr. Williams", specialization: "General Practice", isAvailable: true }
    ];
    
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'API Error' });
  }
}
