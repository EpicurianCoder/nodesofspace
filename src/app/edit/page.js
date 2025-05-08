import EditForm from '@/components/EditForm';
import Navbar from '@/components/Navbar';

export default async function EditPage({ searchParams }) {
  const id = await searchParams?.id;
  return (
    <>
      <Navbar />
      <main className="container">
          <h1 className="header">Network Graph</h1>
          <EditForm id={id} />
      </main>
    </>
  );
}
