import Signup from '@/components/signup';
import NavbarLite from '@/components/NavbarLite';

export default async function SignUpPage({ searchParams }) {
  const id = await searchParams?.id;
  return (
    <>
      <NavbarLite />
      <main className="container">
          <div className="login-container">
            <Signup searchParams={searchParams} />
          </div>
      </main>
    </>
  );
}
