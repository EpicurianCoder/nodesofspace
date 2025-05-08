'use client';

import Link from 'next/link';
import { FiHome, FiLogOut, FiUpload } from 'react-icons/fi';

export default function NavbarLite() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/upload" className="navbar-link navbar-left">
          <FiUpload className="navbar-icon" /> Upload Image
        </Link>
        <Link href="/" className="navbar-title">
          <FiHome className="navbar-icon" /> Nodes Of Space
        </Link>
        <Link href="/" className="navbar-link navbar-right">
          <FiLogOut className="navbar-icon" /> Logout
        </Link>
      </div>
    </nav>
  );
}