export default async function handler(req, res) {
  console.log('Test API called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  res.status(200).json({ 
    message: 'Test API working',
    hasDatabase: !!process.env.DATABASE_URL,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
