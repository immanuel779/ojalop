/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // Removed CheckCheck
import ChatBox from "./ChatBox";
import ChatHeader from "./ChatHeader";

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch Conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, product_id")
    .eq("id", resolvedParams.id)
    .single();

  if (error || !conversation) redirect("/buyer/messages");

  const isBuyer = conversation.buyer_id === user.id;
  const otherPersonId = isBuyer ? conversation.seller_id : conversation.buyer_id;

  // 2. MARK MESSAGES AS READ (WHATSAPP BLUE TICKS LOGIC)
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversation.id)
    .neq("sender_id", user.id); 

  // 3. Fetch Real Profile
  const { data: otherPersonProfile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", otherPersonId)
    .single();

  const otherPersonName = otherPersonProfile?.display_name || "OjaLoop User";
  const otherPersonAvatar = otherPersonProfile?.avatar_url;

  const { data: product } = await supabase
    .from("products")
    .select("title")
    .eq("id", conversation.product_id)
    .single();

  // 4. Fetch Messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto p-0 md:p-6 h-screen md:h-auto">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 md:rounded-t-3xl md:border-t md:border-l md:border-r">
        <div className="flex items-center gap-3">
          <Link href="/buyer/messages" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden shrink-0">
             {otherPersonAvatar ? (
               <img src={otherPersonAvatar} alt={otherPersonName} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 font-bold">
                 {otherPersonName[0].toUpperCase()}
               </div>
             )}
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">{otherPersonName}</h1>
            <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-xs">
              {product?.title ? `Re: ${product.title}` : 'Chat'}
            </p>
          </div>
        </div>
        
        {/* FIXED: Added conversationId here */}
        <ChatHeader 
          otherPersonId={otherPersonId} 
          otherPersonName={otherPersonName} 
          conversationId={conversation.id} 
        />
      </div>

      {/* CHAT BOX */}
      <ChatBox 
        conversationId={conversation.id} 
        currentUserId={user.id} 
        initialMessages={messages || []} 
        otherPersonName={otherPersonName}
      />
    </div>
  );
}