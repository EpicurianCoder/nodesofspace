'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function EditForm({ id }) {
  const [item, setItem] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    quantity: '',
    location: '',
    categories: ''
  });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('Items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error(error);
      else {
        setItem(data);
        setForm({
          name: data.name || '',
          description: data.description || '',
          quantity: data.quantity || '',
          location: data.location || '',
          categories: data.categories || ''
        });
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('Items')
      .update(form)
      .eq('id', id);

    if (error) {
      console.error(error);
      alert('Failed to update item.');
    } else {
      Swal.fire({
        title: 'Database Notification',
        text: 'Item updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      router.push('/graph');
    }
  };

  if (!item) return <p className="loading">Loading...</p>;

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <h2>Edit Item</h2>

      <div className="form-group">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Description</label>
        <input name="description" value={form.description} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Quantity</label>
        <input name="quantity" value={form.quantity} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Location</label>
        <input name="location" value={form.location} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Categories</label>
        <input name="categories" value={form.categories} onChange={handleChange} />
      </div>

      <button type="submit">Save Changes</button>
    </form>
  );
}
