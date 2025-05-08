import VisGraph from '@/components/VisGraph';
import NavbarLite from '@/components/NavbarLite';

export default function Home() {
  return (
    <>
      <NavbarLite />
      <main className="container-graph">
        <VisGraph />
      </main>
    </>
  );
}