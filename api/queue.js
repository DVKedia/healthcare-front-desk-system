// Simple in-memory storage for demo
let queueItems = [];
let nextQueueNumber = 1;

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/');
    
    console.log('Queue API called:', req.method, url.pathname);
    
    // Check if this is a status update request like /api/queue/some-id
    if (pathParts.length === 4 && pathParts[3] && req.method === 'PUT') {
      const itemId = pathParts[3];
      const { status } = req.body;
      
      console.log('Updating status for item:', itemId, 'to:', status);
      
      const itemIndex = queueItems.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Queue item not found' });
      }
      
      queueItems[itemIndex].status = status;
      queueItems[itemIndex].updatedAt = new Date().toISOString();
      
      console.log('Updated item:', queueItems[itemIndex]);
      return res.status(200).json(queueItems[itemIndex]);
    }
    
    // Regular queue operations
    if (req.method === 'GET') {
      res.status(200).json(queueItems);
      
    } else if (req.method === 'POST') {
      const { patientData, queueData } = req.body;
      
      if (!patientData || !queueData) {
        return res.status(400).json({ 
          message: 'Missing patientData or queueData'
        });
      }
      
      const queueItem = {
        id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        queueNumber: nextQueueNumber++,
        reason: queueData.reason || 'General Visit',
        status: 'waiting',
        isUrgent: queueData.isUrgent || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patient: {
          id: `patient-${Date.now()}`,
          name: patientData.name,
          phone: patientData.phone
        }
      };
      
      queueItems.push(queueItem);
      console.log('Added queue item:', queueItem);
      res.status(201).json(queueItem);
      
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Queue API error:', error);
    res.status(500).json({ 
      message: 'Queue API Error', 
      error: error.message
    });
  }
}
