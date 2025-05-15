import Login from '@/components/signin';
import NavbarLite from '@/components/NavbarLite';

export default async function SingInPage({ searchParams }) {
  const id = await searchParams?.id;
  return (
    <>
      <NavbarLite />
      <main className="container">
          <div className="login-container">
            <Login searchParams={searchParams} />
          </div>
      </main>
    </>
  );
}