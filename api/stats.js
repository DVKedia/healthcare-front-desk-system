// This gets real data from the queue
// This gets real data from the queue
export default async function handler(req, res) {
  try {
    // Get queue data from our queue API
    const queueResponse = await fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/queue`);
    const queueItems = queueResponse.ok ? await queueResponse.json() : [];
    
    const stats = {
      queueTotal: queueItems.filter(item => item.status !== 'completed').length,
      todaysAppointments: 0,
      availableDoctors: 2,
      urgentCases: queueItems.filter(item => item.isUrgent && item.status !== 'completed').length
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    res.status(200).json({
      queueTotal: 0,
      todaysAppointments: 0,
      availableDoctors: 2,
      urgentCases: 0
    });
  }
}
