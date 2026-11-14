/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ShieldCheck, MessageCircle, ShoppingBag, ArrowLeft, Store } from "lucide-react";
import { startChatAction } from "@/app/buyer/messages/actions";
import { requestOrderAction } from "@/app/buyer/actions";
import FavouriteButton from "@/components/marketplace/FavouriteButton";
import ShareButton from "@/components/marketplace/ShareButton";
import ReportButton from "@/components/marketplace/ReportButton"; // <-- ADDED IMPORT

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.098-.069-.256-.081-1.416-.548-2.435-1.565-1.019-1.017-1.463-2.181-1.543-2.435-.081-.255-.063-.634.014-.933.081-.298.428-.956.783-1.108.169-.072.34-.062.482-.062.143 0 .285.011.41.011.126 0 .297-.048.465.311.169.359.576 1.409.625 1.509.049.099.081.216.011.348-.069.132-.13.213-.249.348-.119.135-.253.281-.359.389-.12.12-.248.253-.119.479.13.226.575.941 1.229 1.523.841.748 1.542.974 1.766 1.083.226.108.359.088.493-.062.134-.151.575-.669.729-.897.153-.228.307-.187.507-.118.2.068 1.262.595 1.478.704.216.108.359.163.412.254.052.091.052.523-.092.928z"></path>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.658 1.432 5.162L2 22l4.977-1.396A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.636 0-3.153-.475-4.435-1.292l-.318-.204-3.295.865.879-3.216-.22-.351A8.203 8.203 0 0 1 3.75 12c0-4.549 3.701-8.25 8.25-8.25 4.55 0 8.25 3.701 8.25 8.25 0 4.549-3.7 8.25-8.25 8.25z"></path>
  </svg>
);

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch Product
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (error || !product) {
    notFound();
  }

  // 2. Fetch Store
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", product.store_id)
    .single();

  // 3. Fetch Category
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", product.category_id)
    .single();

  // 4. Fetch Seller Profile
  const { data: sellerProfile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", store?.owner_id)
    .single();

  // 5. Fetch "More from this seller"
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("id, title, price, image_url, slug")
    .eq("store_id", product.store_id)
    .eq("status", "approved")
    .neq("id", product.id)
    .limit(4);

  const isOwner = user?.id === store?.owner_id;

  let isFavourited = false;
  if (user && !isOwner) {
    const { data: fav } = await supabase.from("favourites").select("id").eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
    isFavourited = !!fav;
  }

  // Format WhatsApp Link
  const rawPhone = store?.whatsapp || store?.phone;
  const cleanPhone = rawPhone?.replace(/\D/g, ''); 
  const whatsappLink = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=Hello%20${store?.name},%20I%20am%20interested%20in%20your%20listing%20"${product.title}"%20on%20OjaLoop.` 
    : null;

  const sellerName = sellerProfile?.display_name || store?.name || "Seller";
  const sellerAvatar = sellerProfile?.avatar_url || store?.logo_url;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-8">
      
      {/* Mobile Back Button */}
      <div className="md:hidden bg-white p-4 border-b">
        <Link href="/search" className="flex items-center text-gray-600 gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Search
        </Link>
      </div>

      <div className="max-w-7xl mx-auto md:py-8 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* Image Gallery */}
        <div className="w-full aspect-square bg-white md:rounded-3xl overflow-hidden relative border border-gray-200 shadow-sm">
          {product.image_url ? (
             <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
          
          {/* Favourite Button Overlay */}
          {!isOwner && user && (
            <div className="absolute top-4 right-4 z-10 scale-125">
              <FavouriteButton productId={product.id} initialIsFavourite={isFavourited} />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="px-4 md:px-0 flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-orange-600 text-xs font-bold uppercase tracking-wider bg-orange-50 px-2 py-1 rounded inline-block">
              {category?.name || "Uncategorized"}
            </span>
            <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded">
              {product.condition}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">{product.title}</h1>
          
          <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm">
            <MapPin size={16} className="text-orange-500" />
            <span>{product.location_city ? `${product.location_city}, ` : ''}{product.location_state || 'Nigeria'}</span>
            <span className="mx-2">•</span>
            <span>Listed {new Date(product.created_at).toLocaleDateString()}</span>
          </div>

          <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-6">
            ₦ {Number(product.price).toLocaleString()}
          </div>

          {/* SELLER PROFILE CARD */}
          <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Seller Profile</h3>
            
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                {sellerAvatar ? (
                  <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 text-xl bg-gray-50">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900 flex items-center gap-1.5">
                  {sellerName}
                  {store?.verification_status === 'verified' && (
                    <span title="Verified Seller">
                      <ShieldCheck size={18} className="text-green-500" />
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={12} /> {store?.location_state || 'Nigeria'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Link 
                href={`/stores/${store?.slug}`} 
                className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
              >
                <Store size={16} /> Visit Store
              </Link>
              
              {whatsappLink ? (
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 py-2.5 rounded-xl font-bold text-sm hover:bg-[#25D366] hover:text-white transition"
                >
                  <WhatsAppIcon /> WhatsApp
                </a>
              ) : (
                <button disabled className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-400 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed" title="Seller has not added a WhatsApp number">
                  No WhatsApp
                </button>
              )}
            </div>

            {/* MESSAGE SELLER BUTTON */}
            {!isOwner && (
              <form action={startChatAction}>
                <input type="hidden" name="seller_id" value={store?.owner_id} />
                <input type="hidden" name="product_id" value={product.id} />
                <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition">
                  <MessageCircle size={18} /> Message Seller
                </button>
              </form>
            )}

            {/* ADDED: REPORT BUTTON */}
            {!isOwner && (
              <div className="mt-4 flex justify-center border-t border-gray-100 pt-4">
                <ReportButton targetId={product.id} targetType="product" />
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-100">
              {product.description}
            </p>
          </div>

          {/* ACTION BUTTONS (Fixed at bottom on mobile) */}
          <div className="fixed bottom-0 left-0 right-0 p-3 md:p-4 bg-white border-t border-gray-200 md:static md:border-0 md:bg-transparent md:mt-auto flex gap-2 md:gap-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
            {isOwner ? (
              <Link 
                href={`/seller/dashboard`}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition"
              >
                Edit Listing
              </Link>
            ) : (
              <div className="flex gap-2 w-full">
                {/* Share Button */}
                <div className="w-[15%] sm:w-1/4">
                  <ShareButton title={product.title} />
                </div>

                {/* Request Order */}
                <form action={requestOrderAction} className="flex-1 flex">
                  <input type="hidden" name="product_id" value={product.id} />
                  <input type="hidden" name="seller_id" value={store?.owner_id} />
                  <button type="submit" className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition">
                    <ShoppingBag size={18} /> <span className="text-xs sm:text-sm">Request Order</span>
                  </button>
                </form>

                {/* Chat In-App */}
                <form action={startChatAction} className="flex-1 flex">
                  <input type="hidden" name="seller_id" value={store?.owner_id} />
                  <input type="hidden" name="product_id" value={product.id} />
                  <button type="submit" className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition">
                    <MessageCircle size={18} /> <span className="text-xs sm:text-sm">Message</span>
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MORE FROM THIS SELLER */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-12 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">More from {store?.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Link href={`/products/${p.slug}`} key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition group">
                <div className="h-40 bg-gray-100 overflow-hidden">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{p.title}</h4>
                  <p className="text-orange-600 font-bold mt-1">₦ {Number(p.price).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}