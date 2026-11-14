/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function MessagesInbox() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch conversations where user is buyer OR seller
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      buyer:buyer_id (id, display_name),
      seller:seller_id (id, display_name),
      products (title, image_url)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500">Chat with buyers and sellers across OjaLoop.</p>
      </div>

      {conversations?.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500">When you contact a seller or someone contacts you, it will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          {conversations?.map((conv: any) => {
            const isBuyer = conv.buyer.id === user.id;
            const otherPerson = isBuyer ? conv.seller : conv.buyer;
            const product = conv.products;

            return (
              <Link 
                href={`/buyer/messages/${conv.id}`} 
                key={conv.id} 
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
              >
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                  {otherPerson.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{otherPerson.display_name || 'User'}</h3>
                    <span className="text-xs text-gray-400">{new Date(conv.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {product ? `Re: ${product.title}` : "General conversation"}
                  </p>
                </div>
                {product?.image_url && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 hidden sm:block border border-gray-200">
                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}