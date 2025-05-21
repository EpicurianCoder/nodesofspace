import VisGraph from '@/components/VisGraph';
import NavbarLite from '@/components/NavbarLite';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }) {
  const supabase = await createClient();
  const { choice } = await searchParams;
  const { group } = await searchParams;
  
  // get user id to pass to the graph
  // this is a server component so we can use the supabase client directly
  // and get the user id from the session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("userID: ", user?.id)

  if (!user) {
      return redirect("/sign-in");
    }

  // function to return * from the Items table where the user id is the same as the logged in user
  const { data: items } = await supabase
    .from("Items")
    .select("*")
    .eq("user_id", user?.id)
  if (items) {
    console.log("Items Successfully retrieved for node graphing");
  }

  return (
    <>
      <NavbarLite />
      <main className="container-graph">
        <VisGraph userId = {user?.id} email={user?.email} items={items || [] } choice={choice} group={group}/>
      </main>
    </>
  );
}