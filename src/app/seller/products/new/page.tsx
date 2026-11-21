import { createClient } from "@/lib/supabase/server";
import PostAdForm from "./PostAdForm";

export const metadata = { title: "Post an Ad | OjaLoop" };

export default async function PostAdPage() {
  const supabase = await createClient();

  const [{ data: { user } }, { data: categories }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("categories")
      .select("id, name, type")
      .eq("is_active", true)
      .order("name"),
  ]);

  // Check whether the user already has a store (required by createProductAction)
  let hasStore = false;
  if (user) {
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    hasStore = !!store;
  }

  return (
    <PostAdForm
      categories={categories ?? []}
      hasStore={hasStore}
      isAuthenticated={!!user}
    />
  );
}