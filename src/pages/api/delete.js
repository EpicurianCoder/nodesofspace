import supabase from '@/lib/supabaseClient';

export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }
    const { data, error } = await supabase
        .from('Items')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Supabase delete error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to delete data', error });
    }

    return res.status(200).json({
        status: 'success',
        message: 'Node Deleted Successfully',
        deletedData: data,
    });
}