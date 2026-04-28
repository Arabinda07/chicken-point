import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Clock, Leaf, ShieldCheck, Star, ChevronDown, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { siteData } from './data';

const IconMap = {
  Leaf,
  ShieldCheck,
  Clock,
};

export default function App() {
  const whatsappLink = `https://wa.me/${siteData.whatsapp}`;
  const callLink = `tel:${siteData.phone.replace(/\s+/g, '')}`;

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-orange-200 pb-20 sm:pb-0">
      
      {/* Offer Banner - Top Fixed */}
      {siteData.offer.isActive && (
        <div className="bg-orange-600 text-white py-2 px-4 text-center text-xs sm:text-sm font-medium tracking-wide">
          {siteData.offer.bannerText}
        </div>
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-xl font-bold tracking-tight text-orange-600 leading-tight">
              {siteData.shopName}
            </div>
            {siteData.isStoreOpen && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Open Now</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a href={callLink} className="p-2 sm:px-4 sm:py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition flex items-center gap-2">
              <Phone size={18} />
              <span className="hidden sm:inline text-sm font-medium">Call Us</span>
            </a>
            <a href={whatsappLink} className="px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-medium hover:bg-[#20bd5a] shadow-lg shadow-green-500/20 transition flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="hidden sm:inline">Order on WhatsApp</span>
              <span className="sm:hidden">Order</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full pt-8 pb-12 sm:pt-16 sm:pb-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 gap-10 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium w-fit">
              <MapPin size={14} className="text-green-500" />
              {siteData.deliveryArea}
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold leading-[1.1] tracking-tight">
              {siteData.hero.title} <br className="hidden sm:block"/>
              <span className="text-orange-600 font-serif italic block mt-1">{siteData.hero.titleHighlight}</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-medium">
              {siteData.hero.subtitle}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href={whatsappLink} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition shadow-xl shadow-orange-600/20 active:scale-95">
                <MessageCircle size={20} />
                Order via WhatsApp
              </a>
              <a href="#products" className="flex-1 sm:flex-none text-center px-8 py-4 bg-gray-50 text-gray-800 rounded-full font-semibold border border-gray-200 hover:bg-gray-100 transition active:scale-95">
                View Menu
              </a>
            </div>
            
            <div className="flex items-center gap-6 pt-4 text-sm text-gray-600 font-semibold">
              <span className="flex items-center gap-2"><div className="p-1 rounded-full bg-orange-100"><Clock size={14} className="text-orange-600"/></div> Fast Delivery</span>
              <span className="flex items-center gap-2"><div className="p-1 rounded-full bg-green-100"><ShieldCheck size={14} className="text-green-600"/></div> 100% Halal</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative order-first sm:order-last"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 relative shadow-2xl">
              <img 
                src={siteData.hero.image} 
                alt="Fresh cut chicken" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-4 sm:-bottom-6 left-4 sm:-left-6 right-4 sm:right-auto bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <Star className="fill-current text-green-500" size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg sm:text-base leading-tight">4.9/5 Rating</p>
                <p className="text-sm sm:text-xs text-gray-500 font-medium">Trusted by 500+ locals</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="bg-gray-900 text-white border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-max gap-8 px-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-300"><Check size={16} className="text-green-400" /> Antibiotic-free</span>
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-300"><Check size={16} className="text-green-400" /> Daily Fresh Stock</span>
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-300"><Check size={16} className="text-green-400" /> Premium Quality</span>
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-300"><Check size={16} className="text-green-400" /> Cleaned & Packed</span>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-gray-900">Fresh Cuts Menu</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Premium chicken cuts prepared fresh for every order.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteData.products.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition duration-300 relative">
                {product.isBestseller && (
                  <div className="absolute top-6 left-6 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Zap size={12} className="fill-current" /> Bestseller
                  </div>
                )}
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" />
                </div>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h3>
                  <span className="font-bold text-xl text-orange-600 block">{product.price}</span>
                </div>
                <p className="text-sm text-gray-500 mb-5 flex-grow font-medium">{product.description}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">{product.weight}</span>
                  <a 
                    href={`${whatsappLink}?text=Hi ${siteData.shopName}, I'd like to order:%0A%0A1x ${product.name} (${product.weight}) - ${product.price}%0A%0APlease let me know the total and delivery time.`} 
                    className="text-sm font-bold text-white bg-gray-900 px-4 py-2 rounded-xl hover:bg-orange-600 transition flex items-center gap-2 active:scale-95"
                  >
                    Add <MessageCircle size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center bg-white p-6 rounded-3xl border border-gray-200 border-dashed shadow-sm">
             <h3 className="text-lg font-bold mb-2">Planning a party or need a bulk order?</h3>
             <p className="text-gray-500 mb-4">Get custom cuts and special pricing for large orders.</p>
             <a href={`${whatsappLink}?text=Hi, I want to inquire about a bulk order.`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition shadow-lg">
                Contact for Bulk Order <Phone size={16} />
             </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 sm:gap-16 items-center">
             <div className="flex flex-col gap-10">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">The {siteData.shopName} Standard</h2>
                  <p className="text-gray-500 text-lg leading-relaxed">We refuse to compromise. Your family deserves the freshest, cleanest chicken, handled with care from farm to cutting board.</p>
                </div>
                <div className="grid gap-6 sm:gap-8">
                  {siteData.features.map((feature, i) => {
                    const Icon = IconMap[feature.icon as keyof typeof IconMap] || Star;
                    return (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                          <Icon size={28} />
                        </div>
                        <div className="pt-1">
                          <h4 className="font-bold text-xl text-gray-900 mb-1">{feature.title}</h4>
                          <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
             <div className="relative">
                <div className="aspect-square sm:aspect-[4/5] bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=1974&auto=format&fit=crop" alt="Quality process" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -translate-y-12 sm:translate-y-0 bottom-0 sm:bottom-12 sm:-left-12 bg-white px-8 py-6 rounded-3xl shadow-xl font-bold text-center border border-gray-100 mx-4 sm:mx-0">
                  <span className="block text-4xl text-orange-600 mb-1 font-serif">100%</span>
                  <span className="text-gray-600 text-sm tracking-widest uppercase">Guarantee</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif italic mb-16 text-orange-400">Order in 3 Simple Steps</h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12 relative">
            <div className="hidden sm:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-gray-800 -z-10"></div>
            {siteData.steps.map((step) => (
              <div key={step.step} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-800 border-2 border-orange-500 rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-xl shadow-orange-900/50">
                  {step.step}
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">{step.title}</h3>
                <p className="text-gray-400 max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <a href={whatsappLink} className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] text-white rounded-full font-bold text-lg hover:bg-[#20bd5a] transition shadow-lg shadow-green-900/50">
              <MessageCircle size={24} /> Start Your Order Now
            </a>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {siteData.faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-left">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between font-semibold text-lg text-gray-900 hover:bg-gray-50 transition"
                >
                  {faq.question}
                  <ChevronDown className={`transition transform ${openFaq === i ? 'rotate-180 text-orange-600' : 'text-gray-400'}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5 text-gray-600"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
             <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Loved by the Community</h2>
             <p className="text-gray-500">Read what our regular customers have to say.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {siteData.reviews.map((review, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col hover:-translate-y-1 transition duration-300">
                <div className="flex gap-1 mb-6 text-yellow-400">
                  {[...Array(review.rating)].map((_, idx) => <Star key={idx} size={20} className="fill-current" />)}
                </div>
                <p className="text-gray-700 font-medium mb-8 flex-grow leading-relaxed text-lg">"{review.text}"</p>
                <div className="font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                    {review.name.charAt(0)}
                  </div>
                  {review.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment & Location Section (Split Layout) */}
      <section id="location" className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12">
          
          {/* Location Details */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Find Us</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Visit our store to see the quality for yourself, or let us bring it to you.
              </p>
            </div>
            
            <div className="grid gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><MapPin size={24} /></div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Address</h4>
                  <p className="text-gray-600 mt-1">{siteData.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><Clock size={24} /></div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Store Timings</h4>
                  <p className="text-gray-600 mt-1">{siteData.timing}</p>
                </div>
              </div>
            </div>

            <div className="w-full h-64 bg-gray-200 rounded-3xl overflow-hidden shadow-sm border border-gray-100 shadow-inner">
              <iframe 
                src={siteData.mapEmbedUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center border border-gray-100 shadow-xl shadow-gray-200/50">
            <h2 className="text-3xl font-bold mb-3">Scan & Pay</h2>
            <p className="text-gray-500 mb-8 max-w-sm text-lg">Fast checkout via UPI. Scan the code or copy the ID below.</p>
            
            <div className="bg-white p-4 rounded-[2rem] shadow-md border border-gray-100 mb-8 relative group">
              <div className="w-56 h-56 bg-gray-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <div className="w-3/4 h-3/4 opacity-10 flex flex-wrap gap-1 items-center justify-center relative z-10">
                  <div className="w-full text-center text-xs font-mono break-all font-bold">QR CODE PLACEHOLDER. UPLOAD REAL QR HERE.</div>
                  <div className="absolute inset-0 border-[6px] border-dashed border-gray-900 rounded-2xl"></div>
                </div>
              </div>
            </div>
            
            <div className="w-full max-w-xs bg-gray-50 px-6 py-4 rounded-2xl border border-gray-200 flex flex-col items-center gap-2 hover:border-orange-200 transition">
              <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Official UPI ID</span>
              <span className="font-bold text-xl text-gray-900 break-all">{siteData.upiId}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-24 sm:pb-16 border-t-[8px] border-orange-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="text-center sm:text-left flex flex-col items-center sm:items-start gap-3">
             <div className="text-2xl font-bold text-white tracking-tight">
               {siteData.shopName}
             </div>
             <p className="text-sm max-w-xs leading-relaxed">Your trustworthy neighborhood butcher. We ensure quality in every cut.</p>
          </div>
          <div className="text-sm text-center sm:text-right flex flex-col gap-2">
            <p className="font-semibold text-gray-300">Contact: {siteData.phone}</p>
            <p>© {new Date().getFullYear()} {siteData.shopName}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50 flex gap-2 shadow-2xl rounded-full">
        <a href={callLink} className="flex-1 bg-gray-900 text-white rounded-l-full py-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-black/20 hover:bg-black active:scale-95 transition origin-bottom-left">
          <Phone size={18} />
          Call
        </a>
        <a href={whatsappLink} className="flex-[2] bg-[#25D366] text-white rounded-r-full py-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-green-600/30 hover:bg-[#20bd5a] active:scale-95 transition origin-bottom-right">
          <MessageCircle size={18} />
          Order on WhatsApp
        </a>
      </div>

    </div>
  );
}
