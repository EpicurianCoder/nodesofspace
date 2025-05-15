import LandingPage from "@/components/LandingPage";
import NavbarLite from "@/components/NavbarLite";
import AuthButton from "@/components/header-auth";

export default function Home() {
  return (
    <>
      <NavbarLite />
      <main className="landing-container">
        <div className="auth-box">
          <h2>LOGIN</h2><br />
          <AuthButton />
        </div>
        <LandingPage />
      </main>
    </>
  );
}
