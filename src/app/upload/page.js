'use client';
import UploadForm from '@/components/UploadForm';
import NavbarLite from '@/components/NavbarLite';

export default function UploadPage() {
  return (
    <>
      <NavbarLite />
      <main className="container">
        <h1 className="header">Upload Image</h1>
        <UploadForm />
      </main>
    </>
  );
}