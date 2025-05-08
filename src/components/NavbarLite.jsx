'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import the usePathname hook
import { FiHome, FiLogOut, FiUpload } from 'react-icons/fi';
import { FaNetworkWired } from 'react-icons/fa';

export default function Navbar() {
  const pathname = usePathname(); // Get the current route

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-title">
          <FiHome className="navbar-icon" /> Nodes Of Space
        </Link>
        {pathname !== '/upload' && pathname !== '/' && (
          <Link href="/upload" className="navbar-link navbar-left">
            <FiUpload className="navbar-icon" /> Upload Image
          </Link>
        )}
        {pathname !== '/graph' && (
          <Link href="/graph" className="navbar-link navbar-right">
            <FaNetworkWired className="navbar-icon" /> Go to Graph
          </Link>
        )}
        {pathname !== '/' && (
          <Link href="/" className="navbar-link navbar-right">
            <FiLogOut className="navbar-icon" /> Exit
          </Link>
        )}
      </div>
    </nav>
  );
}