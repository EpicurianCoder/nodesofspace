import { createClient } from '@/utils/supabase/client';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { name, description, imagePath, userId, rest } = req.body;
  console.log("User ID: ", JSON.stringify(userId));

  const bulkData = JSON.parse(rest);
  // console.log(bulkData);

  // const name = json.Name;
  // const description = json.Description;

  const supabase = createClient();

  const { data, error } = await supabase
    .from('Items')
    .insert([
      {
        user_id: userId,
        name: name,
        description: description,
        svg_url: imagePath,
        categories: description,
        bulk_data: bulkData
      }
    ]).select();;

  console.log("Data: ", data);


  // update the entry that was just made, and enter user_id value
  // Update the row with the user_id
  console.log("imagePath: ", imagePath);

  // const { error: updateError } = await supabase
  //   .from('Items')
  //   .update('description', "new description")
  //   .eq('id', 98);

  // if (updateError) {
  //   console.error('Supabase update error:', updateError);
  //   return res.status(500).json({ status: 'error', message: 'Failed to update user_id', error: updateError });
  // }

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to insert data', error });
  }

  return res.status(200).json({
    status: 'success',
    message:
      'Node Added Successfully\n' +
      'Description: ' + description,
    insertedData: data,
  });
}
