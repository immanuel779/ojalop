import { createClient } from "@/lib/supabase/server";
import PostAdForm from "./PostAdForm";

export default async function PostAdPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").eq("is_active", true).order("name");
  return <PostAdForm categories={categories || []} />;
}