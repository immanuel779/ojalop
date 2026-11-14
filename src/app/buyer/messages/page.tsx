/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Search, CheckCheck } from "lucide-react";

type Profile = { id: string; display_name: string | null; avatar_url: string | null };
type Product = { title: string; image_url: string | null };
type Message = { content: string | null; created_at: string; sender_id: string; is_read: boolean };
type Conversation = {
  id: string;
  buyer_id: string;
  seller_id: string;
  updated_at: string;
  products: Product | Product[] | null;
  messages: Message[];
};

export default async function MessagesInbox() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversationsData } = await supabase
    .from("conversations")
    .select(`
      id,
      buyer_id,
      seller_id,
      updated_at,
      products (title, image_url),
      messages (content, created_at, sender_id, is_read)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const conversations = conversationsData as Conversation[] | null;

  const userIds = new Set<string>();
  conversations?.forEach((conv) => {
    userIds.add(conv.buyer_id);
    userIds.add(conv.seller_id);
  });

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", Array.from(userIds));

  const profiles = profilesData as Profile[] | null;
  const profileMap = new Map<string, Profile>();
  profiles?.forEach((profile) => {
    profileMap.set(profile.id, profile);
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen">
      <Link href="/buyer/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Messages
          </h1>
          <p className="text-gray-500 mt-1">Chat directly with buyers and sellers.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search messages..." 
          className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition shadow-sm"
        />
      </div>

      {!conversations || conversations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-orange-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">When you contact a seller or someone contacts you, your conversation will appear here.</p>
          <Link href="/search" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {conversations.map((conv) => {
            const isBuyer = conv.buyer_id === user.id;
            const otherPersonId = isBuyer ? conv.seller_id : conv.buyer_id;
            
            const otherPerson = profileMap.get(otherPersonId);
            const otherPersonName = otherPerson?.display_name || "OjaLoop User";
            const otherPersonAvatar = otherPerson?.avatar_url;

            const product = Array.isArray(conv.products) ? conv.products[0] : conv.products;
            
            const messages = Array.isArray(conv.messages) ? conv.messages : [];
            const lastMsg = messages.length > 0 
              ? [...messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] 
              : null;

            const isUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_id !== user.id;

            const formatTime = (dateString: string) => {
              if (!dateString) return "";
              const date = new Date(dateString);
              const today = new Date();
              if (date.toDateString() === today.toDateString()) {
                return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              }
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            };

            return (
              <Link href={`/buyer/messages/${conv.id}`} key={conv.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition group">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 bg-gray-100 border border-gray-200 rounded-full overflow-hidden flex items-center justify-center font-bold text-gray-500 text-xl">
                    {otherPersonAvatar ? (
                      <img src={otherPersonAvatar} alt={otherPersonName} className="w-full h-full object-cover" />
                    ) : (
                      otherPersonName[0].toUpperCase()
                    )}
                  </div>
                  {isUnread && (
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-base truncate ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {otherPersonName}
                    </h3>
                    <span className={`text-xs ${isUnread ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                      {formatTime(lastMsg?.created_at || conv.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {lastMsg?.sender_id === user.id && (
                      lastMsg.is_read ? (
                        <CheckCheck size={16} className="text-blue-500" />
                      ) : (
                        <CheckCheck size={16} className="text-gray-400" />
                      )
                    )}
                    <p className={`text-sm truncate ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {lastMsg ? (lastMsg.content || "Sent an attachment") : `Started a chat about ${product?.title}`}
                    </p>
                  </div>
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