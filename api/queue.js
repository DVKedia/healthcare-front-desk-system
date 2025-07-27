// Simple version without complex imports
export default async function handler(req, res) {
  try {
    console.log('Queue API called:', req.method);
    
    if (req.method === 'GET') {
      // Return empty array for now
      res.status(200).json([]);
      
    } else if (req.method === 'POST') {
      console.log('POST data:', req.body);
      
      // Simulate adding to queue
      const queueItem = {
        id: `queue-${Date.now()}`,
        queueNumber: 1,
        reason: req.body.reason || 'General Visit',
        status: 'waiting',
        isUrgent: req.body.isUrgent || false,
        createdAt: new Date().toISOString(),
        patient: {
          id: `patient-${Date.now()}`,
          name: req.body.name || 'Test Patient',
          phone: req.body.phone || '000-000-0000'
        }
      };
      
      console.log('Returning queue item:', queueItem);
      res.status(201).json(queueItem);
      
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Queue API error:', error);
    res.status(500).json({ 
      message: 'Queue API Error', 
      error: error.message,
      stack: error.stack 
    });
  }
}
