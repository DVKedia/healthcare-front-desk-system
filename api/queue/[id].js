export default async function handler(req, res) {
  try {
    const { id } = req.query;
    console.log('Status update for queue item:', id, 'Method:', req.method);
    
    if (req.method === 'PUT') {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      // For demo purposes, just return success
      // In a real app, this would update the database
      const updatedItem = {
        id: id,
        status: status,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updated queue item:', updatedItem);
      res.status(200).json(updatedItem);
      
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Queue status update error:', error);
    res.status(500).json({ 
      message: 'Status update failed', 
      error: error.message 
    });
  }
}
