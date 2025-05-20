import { signInAction } from "@/components/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="form-container">
      <h1 className="form-title">Sign in</h1>
      <p className="form-subtitle">
        <p>Dont have an account?</p>
        <Link className="form-link" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="form-fields">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="form-password-container">
          <Label htmlFor="password">Password</Label>
          <Link className="form-forgot-password" href="/forgot-password">
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}