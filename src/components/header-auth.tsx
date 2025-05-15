import { signOutAction } from "@/components/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <div className="auth-container">
        <div className="auth-badge">
          Please update .env.local file with anon key and url
        </div>
        <div className="auth-buttons">
          <button className="auth-button" disabled>
            <Link href="/sign-in">Sign in</Link>
          </button>
          <button className="auth-button" disabled>
            <Link href="/sign-up">Sign up</Link>
          </button>
        </div>
      </div>
    );
  }

  return user ? (
    <div className="auth-container">
      <span className="auth-welcome">Hey, {user.email}!</span>
      <form action={signOutAction}>
        <button className="auth-button" type="submit">
          Sign out
        </button>
      </form>
    </div>
  ) : (
    <div className="auth-buttons">
      <button className="auth-button">
        <Link href="/sign-in">Sign in</Link>
      </button>
      <button className="auth-button">
        <Link href="/sign-up">Sign up</Link>
      </button>
    </div>
  );
}