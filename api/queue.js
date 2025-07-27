export default async function handler(req, res) {
  try {
    console.log('Queue API called:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    if (req.method === 'GET') {
      // Return empty array for now
      res.status(200).json([]);
      
    } else if (req.method === 'POST') {
      // Extract data from the nested structure the frontend sends
      const { patientData, queueData } = req.body;
      
      if (!patientData || !queueData) {
        return res.status(400).json({ 
          message: 'Missing patientData or queueData',
          received: req.body 
        });
      }
      
      // Create a queue item that matches the expected format
      const queueItem = {
        id: `queue-${Date.now()}`,
        queueNumber: 1,
        reason: queueData.reason || 'General Visit',
        status: 'waiting',
        isUrgent: queueData.isUrgent || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patient: {
          id: `patient-${Date.now()}`,
          name: patientData.name || 'Test Patient',
          phone: patientData.phone || '000-000-0000'
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
      body: req.body
    });
  }
}
