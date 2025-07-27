// Global storage for the serverless environment
global.queueItems = global.queueItems || [];
global.nextQueueNumber = global.nextQueueNumber || 1;

export default async function handler(req, res) {
  try {
    console.log('Queue API called:', req.method, req.url);
    
    // Parse the URL to handle dynamic routes like /api/queue/some-id
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Check if this is a status update: /api/queue/{id}
    if (pathSegments.length === 3 && req.method === 'PUT') {
      const itemId = pathSegments[2]; // The ID from the URL
      const { status } = req.body;
      
      console.log('Status update for item:', itemId, 'to status:', status);
      console.log('Current queue items:', global.queueItems.length);
      
      const itemIndex = global.queueItems.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        console.log('Item not found:', itemId);
        return res.status(404).json({ 
          message: 'Queue item not found',
          itemId: itemId,
          availableIds: global.queueItems.map(item => item.id)
        });
      }
      
      // Update the status
      global.queueItems[itemIndex].status = status;
      global.queueItems[itemIndex].updatedAt = new Date().toISOString();
      
      console.log('Successfully updated item:', global.queueItems[itemIndex]);
      return res.status(200).json(global.queueItems[itemIndex]);
    }
    
    // Regular queue operations
    if (req.method === 'GET') {
      console.log('Returning queue items:', global.queueItems.length);
      res.status(200).json(global.queueItems);
      
    } else if (req.method === 'POST') {
      const { patientData, queueData } = req.body;
      
      if (!patientData || !queueData) {
        return res.status(400).json({ 
          message: 'Missing patientData or queueData'
        });
      }
      
      const queueItem = {
        id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        queueNumber: global.nextQueueNumber++,
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
      
      global.queueItems.push(queueItem);
      console.log('Added queue item:', queueItem);
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
