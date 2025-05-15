import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="stmp-message-box">
      <InfoIcon size={16} className="mt-0.5" />
      <div className="rate-message-box">
        <small className="rate-message">
          <strong> Note:</strong> Emails are rate limited. Enable Custom SMTP to
          increase the rate limit.
        </small>
        <div>
          <Link
            href="https://supabase.com/docs/guides/auth/auth-smtp"
            target="_blank"
            className="smtp-link-text"
          >
            Learn more <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
