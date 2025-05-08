'use client';
import UploadForm from '@/components/UploadForm';
import Navbar from '@/components/Navbar';

export default function UploadPage() {
  return (
    <>
      <Navbar />
      <main className="container">
        <h1 className="header">Upload Image</h1>
        <UploadForm />
      </main>
    </>
  );
}