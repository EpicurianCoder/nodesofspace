'use client';

import Link from 'next/link';
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import { FiHome, FiLogOut, FiUpload } from 'react-icons/fi';
import { FaNetworkWired } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';
import { signOutAction } from '@/components/actions';

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-title">
          <FiHome className="navbar-icon" /> Nodes Of Space
        </Link>
        {pathname !== '/upload' && pathname !== '/' && pathname !== '/sign-in' && (
          <Link href="/upload" className="navbar-link navbar-left">
            <FiUpload className="navbar-icon" /> Upload Image
          </Link>
        )}
        {pathname !== '/graph' && pathname !== '/sign-in' && user && (
          <Link href="/graph" className="navbar-link navbar-right">
            <FaNetworkWired className="navbar-icon" /> Go to Graph
          </Link>
        )}
        {pathname !== '/' && pathname !== '/sign-in' && (
          <form action={signOutAction}>
            <button className="auth-button" type="submit">
              Sign out
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}