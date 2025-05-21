import { createClient } from "@/utils/supabase/server";

// get request that makes a call to the supabase database
// to get the items for the user
// and returns them as a json object

export default async function handler(req, res) {
    // pull user id from the request
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const supabase = createClient;

   // make supabase query based on user_id
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', req.query.user_id);
    
    if (error) {
        console.error('Error fetching items:', error);
        return res.status(500).json({ error: 'Error fetching items' });
    }
    
    // Return the items as a JSON response
    return res.status(200).json({ items: data });
    }

