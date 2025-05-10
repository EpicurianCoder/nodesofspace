import Image from "next/image";
import styles from "./page.module.css";
import LandingPage from "@/components/LandingPage";
import NavbarLite from "@/components/NavbarLite";

export default function Home() {
  return (
    <>
      <NavbarLite />
      <main className="landing-container">
        <LandingPage />
      </main>
    </>
  );
}
