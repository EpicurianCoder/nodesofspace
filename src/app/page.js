import Image from "next/image";
import styles from "./page.module.css";
import LandingPage from "@/components/LandingPage";
import NavbarLite from "@/components/NavbarLite";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import AuthButton from "@/components/header-auth";

export default function Home() {
  return (
    <>
      <NavbarLite />
      <main className="landing-container">
        <div className="auth-box">
          <p className="auth-text">
            Welcome! Please Sign in or Sign up to proceed to the graph.
          </p>
          <AuthButton />
        </div>
        <LandingPage />
      </main>
    </>
  );
}
