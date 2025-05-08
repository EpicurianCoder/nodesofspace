'use client';

import Link from 'next/link';
import { FiHome, FiLogOut, FiCornerUpLeft } from 'react-icons/fi';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/graph" className="navbar-link navbar-left">
          <FiCornerUpLeft className="navbar-icon" /> Return to Graph
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