export default function handler(req, res) {
    if (req.method === 'POST') {
      // Log the incoming JSON body for debugging
      // console.log('Received JSON:', req.body);
  
      const labels = req.body.labels;
      const location = req.body.location;
      const base64Image = req.body.base64Image;
      const description = labels.map(label => JSON.stringify(label.description));

      res.status(200).json({
        status: 'success',
        message: 'Node Added Successfully\n'
        + 'Labels Identified: '
        + description 
        + '\nLocation of item: ' 
        + location,
        processedData: req.body, // Echo back the received data
      });
    } else {
      // Handle other HTTP methods (e.g., GET, PUT, DELETE)
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  }