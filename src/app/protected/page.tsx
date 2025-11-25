import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // function to return * from the Items table where the user id is the same as the logged in user
  const { data: items } = await supabase
    .from("Items")
    .select("*")
    .eq("user_id", user?.id);
  if (items) {
    console.log("Items: ", items);
  }

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: "48px" }}>
      <div style={{ width: "100%" }}>
        <div
          style={{
            backgroundColor: "#f0f4f8", // accent color
            fontSize: "0.875rem",
            padding: "12px 20px",
            borderRadius: "8px",
            color: "#333", // foreground color
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated user
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "1.5rem", marginBottom: "16px" }}>Your user details</h2>
        <pre
          style={{
            fontSize: "0.75rem",
            fontFamily: "monospace",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            maxHeight: "128px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}></div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
        <pre
          style={{
            fontSize: "0.75rem",
            fontFamily: "monospace",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            maxHeight: "128px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(items, null, 2)}
        </pre>
      </div>
    </div>
  );
}