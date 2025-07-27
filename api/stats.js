export default async function handler(req, res) {
  try {
    // Simple test response
    res.status(200).json({
      queueTotal: 0,
      todaysAppointments: 0,
      availableDoctors: 2,
      urgentCases: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Stats API Error' });
  }
}
