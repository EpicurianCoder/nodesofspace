import VisGraph from '@/components/VisGraph';
import NavbarLite from '@/components/NavbarLite';

export default function Home() {
  return (
    <>
      <NavbarLite />
      <main className="container">
          <h1 className="header">Network Graph</h1>
        <VisGraph />
      </main>
    </>
  );
}