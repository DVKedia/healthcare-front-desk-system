// Simple in-memory storage for demo purposes
let queueItems = [];
let nextQueueNumber = 1;

export default async function handler(req, res) {
  try {
    console.log('Queue API called:', req.method);
    
    if (req.method === 'GET') {
      // Return all queue items
      res.status(200).json(queueItems);
      
    } else if (req.method === 'POST') {
      const { patientData, queueData } = req.body;
      
      if (!patientData || !queueData) {
        return res.status(400).json({ 
          message: 'Missing patientData or queueData',
          received: req.body 
        });
      }
      
      // Create a new queue item
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
      
      // Add to our in-memory storage
      queueItems.push(queueItem);
      
      console.log('Added queue item:', queueItem);
      console.log('Total queue items:', queueItems.length);
      
      res.status(201).json(queueItem);
      
    } else if (req.method === 'PUT') {
      // Handle status updates
      const pathParts = req.url.split('/');
      const itemId = pathParts[pathParts.length - 1];
      const { status } = req.body;
      
      const itemIndex = queueItems.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Queue item not found' });
      }
      
      queueItems[itemIndex].status = status;
      queueItems[itemIndex].updatedAt = new Date().toISOString();
      
      res.status(200).json(queueItems[itemIndex]);
      
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
