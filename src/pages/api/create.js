import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { labels, location, base64Image, quantity, imagePath } = req.body;

  const name_temp = labels[0].description;
  const description = labels.map(label => label.description).join(', ');

  // ALL TEST VALUES UNTIL API FOR STRUCTURED DESCRIPTION IS WORKING
  const { data, error } = await supabase
    .from('Items')
    .insert([
      {
        name: name_temp,
        description: 'description does here...',
        svg_url: imagePath,
        quantity: quantity,
        location: location,
        categories: description,
      },
    ]);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to insert data', error });
  }

  return res.status(200).json({
    status: 'success',
    message:
      'Node Added Successfully\n' +
      'Labels Identified: ' + description +
      '\nLocation of item: ' + location,
    insertedData: data,
  });
}
