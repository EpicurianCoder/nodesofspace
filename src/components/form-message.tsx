export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="form-success-text">
      {"success" in message && (
        <div className="success-message">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="form-error-text">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="form-message-text">{message.message}</div>
      )}
    </div>
  );
}
