import EditForm from '@/components/EditForm';
import NavbarLite from '@/components/NavbarLite';

export default async function EditPage({ searchParams }) {
  const id = await searchParams
  return (
    <>
      <NavbarLite />
      <main className="container">
          <h1 className="header">Network Graph</h1>
          <EditForm id={id.id} />
      </main>
    </>
  );
}
