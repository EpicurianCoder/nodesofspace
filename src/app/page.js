import Image from "next/image";
import styles from "./page.module.css";
import LandingPage from "@/components/LandingPage";
import NavbarLite from "@/components/NavbarLite";
import { FiHome, FiUpload } from "react-icons/fi";
import { FaNetworkWired } from 'react-icons/fa';
import Link from "next/link";

export default function Home() {
  return (
    <>
      <NavbarLite />
      <main className="container">
        <LandingPage />
      </main>
    </>
  );
}
