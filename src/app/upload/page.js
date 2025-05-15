import UploadForm from '@/components/UploadForm';
import NavbarLite from '@/components/NavbarLite';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";


export default async function UploadPage() {
  const supabase = await createClient();
    
    // get user id to pass to the graph
    // this is a server component so we can use the supabase client directly
    // and get the user id from the session
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("userID UploadPageComponent: ", user?.id)
  
    if (!user) {
        return redirect("/sign-in");
      }
  
  return (
    <>
      <NavbarLite />
      <main className="container">
        <h1 className="header">Upload Image</h1>
        <UploadForm userId = {user?.id} />
      </main>
    </>
  );
}