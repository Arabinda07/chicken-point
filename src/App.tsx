import React, { useState, useMemo } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  QrCode,
  FileText,
  ExternalLink,
  ChevronRight,
  User,
  Sparkles,
  Calendar,
  Utensils,
  LayoutDashboard,
  Store,
  Info,
  Scale
} from 'lucide-react';
import { siteData, fallbackProducts, cutStyleOptions, weightOptions, pickupOptions } from './data';
import type { Product, CutStyle } from './lib/supabase';
import { EarningsDashboard } from './components/EarningsDashboard';
import { Button } from './components/ui/Button';
import { Chip } from './components/ui/Chip';
import { Surface } from './components/ui/Surface';
import { ModalSheet } from './components/ui/ModalSheet';

import logoUrl from '../assets/logo.jpeg';
import paymentQrUrl from '../assets/QR1.png';
import googleReviewQrUrl from '../assets/Shop_GoogleQR.png';

export default function App() {
  const [activeTab, setActiveTab] = useState<'shop' | 'qr' | 'bulk' | 'admin'>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product>(fallbackProducts[0]);
  const [selectedCut, setSelectedCut] = useState<CutStyle>('curry');
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [customWeight, setCustomWeight] = useState<string>('');
  const [selectedPickup, setSelectedPickup] = useState<string>('ASAP');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [requestInvoice, setRequestInvoice] = useState<boolean>(false);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [orderConfirmed, setOrderConfirmed] = useState<{ code: string; message: string } | null>(null);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  // Shop Open / Closed Live Status based on Asia/Kolkata
  const isShopOpen = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        hour12: false,
      }).formatToParts(new Date());
      const hour = Number(parts.find(p => p.type === 'hour')?.value ?? '12');
      return hour >= siteData.openingHours.startHour && hour < siteData.openingHours.endHour;
    } catch {
      return true;
    }
  }, []);

  // Effective weight calculation
  const effectiveWeight = useMemo(() => {
    if (customWeight && !isNaN(Number(customWeight)) && Number(customWeight) > 0) {
      return Number(customWeight);
    }
    return selectedWeight;
  }, [customWeight, selectedWeight]);

  // Estimated total calculation
  const estimatedPrice = useMemo(() => {
    return Math.round(selectedProduct.price_per_kg * effectiveWeight);
  }, [selectedProduct, effectiveWeight]);

  // Open modal with light-dismiss setup
  const openPreBook = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
    }
    setOrderConfirmed(null);
    setIsSheetOpen(true);
    setAriaAnnouncement(`Pre-booking dialog opened for ${product?.name ?? selectedProduct.name}`);
  };

  const closePreBook = () => {
    setIsSheetOpen(false);
    setAriaAnnouncement('Pre-booking dialog closed');
  };

  // Handle Order Submit & WhatsApp Redirect
  const handleSubmitOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `BCP-${orderNum}`;
    const cutName = cutStyleOptions.find(c => c.value === selectedCut)?.whatsappLabel ?? selectedCut;

    const message = `Hello Bikash Chicken Point! I want to pre-book fresh chicken for walk-in pickup at Fuljhore Sabji Market:
━━━━━━━━━━━━━━━━━
📦 Order ID: #${orderCode}
🍗 Item: ${selectedProduct.name} (${selectedProduct.name_bengali})
⚖️ Quantity: ${effectiveWeight} kg
🔪 Cut: ${cutName}
⏱️ Pickup Time: ${selectedPickup}
🧾 GST/Invoice: ${requestInvoice ? 'Yes, please' : 'Not required'}
👤 Name: ${customerName}
📞 Phone: ${customerPhone}
💵 Estimated Rate: ~₹${estimatedPrice} (To be confirmed on counter scale)
━━━━━━━━━━━━━━━━━
Please confirm availability and keep it packed for pickup!`;

    const whatsappUrl = `https://wa.me/${siteData.whatsapp}?text=${encodeURIComponent(message)}`;

    setOrderConfirmed({
      code: orderCode,
      message: 'Your pre-booking summary is ready! Redirecting to WhatsApp to send confirmation...',
    });
    setAriaAnnouncement(`Order #${orderCode} created. Redirecting to WhatsApp.`);

    // Open WhatsApp in new tab
    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 850);
  };

  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen-dvh bg-[#FAF7F2]">
        <EarningsDashboard
          onBackToShop={() => setActiveTab('shop')}
          onSignOut={() => setActiveTab('shop')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen-dvh flex flex-col bg-[#FAF7F2] text-[#231917] selection:bg-[#A83A2F]/20 selection:text-[#A83A2F]">
      {/* Accessible Polite Live Region for Screen Readers */}
      <div className="visually-hidden" aria-live="polite" role="status">
        {ariaAnnouncement}
      </div>

      {/* Top Header: Reflections Frosted Glass Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E6DEC8] transition-shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={logoUrl}
                alt="Bikash Chicken Point Logo"
                className="w-11 h-11 rounded-full object-cover shadow-sm border border-[#E6DEC8] ring-2 ring-[#A83A2F]/10"
                width="44"
                height="44"
                fetchPriority="high"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  isShopOpen ? 'bg-[#15803D]' : 'bg-[#D99B26]'
                }`}
                title={isShopOpen ? 'Open now' : 'Pre-orders only'}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg tracking-tight text-[#872B22]">
                  {siteData.shopName}
                </span>
                <span className="font-bengali text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-chip)] bg-[#A83A2F]/10 text-[#A83A2F]">
                  {siteData.shopNameBengali}
                </span>
              </div>
              <p className="text-xs text-[#665852] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#A83A2F]" />
                <span>Sabji Market, Fuljhore, Durgapur-713206</span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-[var(--radius-chip)] ${
                isShopOpen
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isShopOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isShopOpen ? 'Counter Open (8 AM - 9 PM)' : 'Pre-orders Accepted'}
            </span>

            <a
              href={`tel:${siteData.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-chip)] bg-[#F3EFE6] hover:bg-[#E6DEC8] text-[#231917] transition-all hover-lift active-press"
              aria-label="Call shop owner"
            >
              <Phone className="w-3.5 h-3.5 text-[#A83A2F]" />
              <span className="hidden md:inline">Call Shop</span>
            </a>

            <button
              onClick={() => setActiveTab('admin')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-chip)] text-[#665852] hover:text-[#231917] hover:bg-[#F3EFE6] transition-colors"
              title="Owner Admin Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Admin</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs with Reflections Spring Active State */}
        <nav className="max-w-5xl mx-auto px-4 flex gap-4 border-t border-[#E6DEC8]/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('shop')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-all ease-out-expo ${
              activeTab === 'shop'
                ? 'border-[#A83A2F] text-[#872B22] font-bold'
                : 'border-transparent text-[#665852] hover:text-[#231917]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Menu & Pre-Book
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-all ease-out-expo ${
              activeTab === 'qr'
                ? 'border-[#A83A2F] text-[#872B22] font-bold'
                : 'border-transparent text-[#665852] hover:text-[#231917]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Counter QR & Location
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-all ease-out-expo ${
              activeTab === 'bulk'
                ? 'border-[#A83A2F] text-[#872B22] font-bold'
                : 'border-transparent text-[#665852] hover:text-[#231917]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Bulk & B2B Orders
          </button>
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {activeTab === 'shop' && (
          <div className="space-y-8">
            {/* Hero Section: Editorial Paper Wash & Brand Identity */}
            <section className="relative overflow-hidden rounded-[var(--radius-panel)] bg-gradient-to-br from-[#872B22] via-[#9E3329] to-[#A83A2F] text-white p-6 sm:p-8 shadow-md">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-chip)] bg-white/15 text-white/95 text-xs font-semibold backdrop-blur-sm border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
                  <span>{siteData.hero.eyebrow}</span>
                  <span className="opacity-75">· Fuljhore Sabji Market</span>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                  {siteData.hero.title}
                </h1>

                <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xl">
                  {siteData.hero.subtitle}
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Button
                    onClick={() => openPreBook()}
                    variant="primary"
                    tone="gold"
                    size="md"
                    className="shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Pre-Book for Pickup
                  </Button>

                  <a
                    href={`https://wa.me/${siteData.whatsapp}?text=Hello%20Bikash%20Da,%20what%20is%20today's%20chicken%20rate%20at%20Fuljhore%20shop?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-control)] bg-[#15803D] hover:bg-[#166534] text-white font-semibold text-sm transition-all hover-lift active-press shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ask Rate on WhatsApp
                  </a>
                </div>

                {/* 2-Min Pickup Trust Guarantee Cue */}
                <div className="pt-3 border-t border-white/20 flex items-center gap-2 text-xs text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#D99B26] flex-shrink-0" />
                  <span>{siteData.fastTrack.english} ({siteData.fastTrack.bengali})</span>
                </div>
              </div>

              {/* Watermark shop logo in background */}
              <div
                className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none bg-contain bg-no-repeat bg-right-bottom"
                style={{ backgroundImage: `url(${logoUrl})` }}
                aria-hidden="true"
              />
            </section>

            {/* Daily Counter Rate Transparency Notice */}
            <Surface variant="bezel" className="p-4 flex items-start gap-3.5 bg-[#FAF7F2]">
              <Info className="w-5 h-5 text-[#A83A2F] flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-[#231917] space-y-1">
                <p className="font-bold text-[#872B22]">
                  Live Counter Rate Transparency Notice / প্রতিদিনের দর বিজ্ঞপ্তি:
                </p>
                <p className="text-[#665852] leading-relaxed">
                  Prices update daily based on local market rates. To guarantee accuracy, please confirm the final weight and amount at the shop counter upon walk-in pickup before making your UPI/cash payment.
                </p>
              </div>
            </Surface>

            {/* Product Cards using CSS Container Query & Reflections Surface */}
            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#231917]">
                    Today's Fresh Cuts & Counter Menu
                  </h2>
                  <p className="text-xs text-[#665852]">
                    Select any cut to customize weight and reserve for counter pickup
                  </p>
                </div>
                <span className="text-xs font-mono font-medium text-[#665852] bg-[#F3EFE6] px-2.5 py-1 rounded-[var(--radius-chip)] border border-[#E6DEC8]">
                  {fallbackProducts.filter(p => p.is_available).length} cuts ready
                </span>
              </div>

              {/* Product Grid Container */}
              <div className="product-grid-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fallbackProducts.map(product => {
                  const details = siteData.menuDetails[product.id as keyof typeof siteData.menuDetails];
                  return (
                    <article
                      key={product.id}
                      className="product-card surface-paper p-5 flex flex-col justify-between transition-all duration-200 hover-lift"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display font-bold text-base text-[#231917]">
                              {product.name}
                            </h3>
                            <p className="font-bengali text-xs font-semibold text-[#872B22]">
                              {product.name_bengali}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-[var(--radius-chip)] uppercase tracking-wider ${
                              product.is_available
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            {product.is_available ? 'Available' : 'Check Counter'}
                          </span>
                        </div>

                        {details && (
                          <p className="text-xs text-[#665852] line-clamp-2 leading-relaxed">
                            {details.detail}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-3 border-t border-[#E6DEC8]/60 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-[#665852] block font-medium">Counter Rate</span>
                          <span className="text-lg font-extrabold font-mono text-[#872B22] tabular-nums">
                            ₹{product.price_per_kg}
                            <span className="text-xs font-normal text-[#665852]">/kg</span>
                          </span>
                        </div>

                        <Button
                          onClick={() => openPreBook(product)}
                          disabled={!product.is_available}
                          variant={product.is_available ? 'primary' : 'secondary'}
                          size="sm"
                        >
                          <span>Pre-Book</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* How Walk-in Pickup Works */}
            <Surface variant="paper" className="p-6 space-y-4">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#231917]">
                How Pre-Booked Walk-in Pickup Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {siteData.orderSteps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-[var(--radius-control)] bg-[#FAF7F2] border border-[#E6DEC8]/80 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#872B22] text-white text-xs font-bold flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <h3 className="font-display font-semibold text-sm text-[#231917]">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#665852] leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </Surface>

            {/* FAQs in English & Bengali */}
            <section className="space-y-4">
              <div>
                <span className="text-xs font-bold text-[#A83A2F] uppercase tracking-wider">
                  {siteData.faqSection.eyebrow}
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#231917]">
                  {siteData.faqSection.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {siteData.faqs.map(faq => (
                  <Surface key={faq.id} variant="paper" className="p-4 space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-[var(--radius-chip)] bg-[#F3EFE6] text-[#872B22] font-bold">
                      {faq.tag}
                    </span>
                    <h3 className="font-bold text-sm text-[#231917]">
                      {faq.question}
                    </h3>
                    <p className="font-bengali text-xs font-semibold text-[#872B22]">
                      {faq.questionBengali}
                    </p>
                    <p className="text-xs text-[#665852] pt-1 border-t border-[#E6DEC8]/50 leading-relaxed">
                      {faq.answer}
                    </p>
                    <p className="font-bengali text-xs text-[#665852]">
                      {faq.answerBengali}
                    </p>
                  </Surface>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Counter QR & Location */}
        {activeTab === 'qr' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#231917]">
                Shop Counter QR & Directions
              </h1>
              <p className="text-xs text-[#665852]">
                Sabji Market, Fuljhore, Durgapur-713206, West Bengal
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PhonePe UPI Standee QR */}
              <Surface variant="paper" className="p-6 text-center space-y-4">
                <div className="inline-flex p-2.5 rounded-full bg-[#15803D]/10 text-[#15803D]">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-[#231917]">
                    PhonePe / UPI Counter QR
                  </h2>
                  <p className="text-xs text-[#665852]">
                    Scan directly at the counter during pickup
                  </p>
                </div>
                <div className="max-w-[220px] mx-auto p-3 bg-[#FAF7F2] rounded-[var(--radius-control)] border border-[#E6DEC8]">
                  <img
                    src={paymentQrUrl}
                    alt="Bikash Chicken Point PhonePe Payment QR"
                    className="w-full h-auto rounded-lg"
                    width="220"
                    height="220"
                  />
                </div>
                <div className="text-xs text-[#665852] space-y-1">
                  <p className="font-mono font-medium">UPI ID: {siteData.upiId}</p>
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-[var(--radius-chip)] border border-amber-200">
                    ⚠️ Pay only after the final weight is confirmed on the shop weighing scale.
                  </p>
                </div>
              </Surface>

              {/* Google Business Profile & Reviews */}
              <Surface variant="paper" className="p-6 text-center space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex p-2.5 rounded-full bg-[#A83A2F]/10 text-[#A83A2F]">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#231917]">
                      Google Profile & Verified Reviews
                    </h2>
                    <p className="text-xs text-[#665852]">
                      Locate us in Sabji Market or leave a review
                    </p>
                  </div>
                  <div className="max-w-[220px] mx-auto p-3 bg-[#FAF7F2] rounded-[var(--radius-control)] border border-[#E6DEC8]">
                    <img
                      src={googleReviewQrUrl}
                      alt="Bikash Chicken Point Google Profile QR"
                      className="w-full h-auto rounded-lg"
                      width="220"
                      height="220"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={siteData.googleProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[#F3EFE6] hover:bg-[#E6DEC8] text-xs font-semibold text-[#231917] transition-all hover-lift active-press"
                  >
                    <span>Open on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Surface>
            </div>

            {/* Shop Details & Udyam Registration */}
            <div className="bg-[#FAF7F2] border border-[#E6DEC8] rounded-[var(--radius-control)] p-4 text-xs text-[#665852] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-[#231917]">MSME Registration:</span>{' '}
                <span className="font-mono">{siteData.udyamRegistrationNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-[#231917]">Counter Timing:</span>{' '}
                <span>{siteData.timing}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bulk & B2B Orders */}
        {activeTab === 'bulk' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-[#A83A2F] uppercase tracking-wider">
                {siteData.b2b.eyebrow}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#231917]">
                {siteData.b2b.title}
              </h1>
              <p className="text-sm text-[#665852] mt-2 leading-relaxed">
                {siteData.b2b.body}
              </p>
              <p className="font-bengali text-xs text-[#872B22] mt-1 font-semibold">
                {siteData.b2b.bodyBengali}
              </p>
            </div>

            <Surface variant="paper" className="p-6 space-y-4">
              <h2 className="font-display text-base font-bold text-[#231917]">
                Wholesale & Commercial Invoicing Benefits
              </h2>
              <ul className="text-xs text-[#665852] space-y-2.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Fresh daily dressing cut to your specific culinary requirements</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>GST-compliant business invoice generated for tax accounting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Dedicated counter pickup line so your kitchen prep isn't delayed</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-[#E6DEC8]">
                <a
                  href={`https://wa.me/${siteData.whatsapp}?text=Hello%20Bikash%20Da,%20I%20am%20inquiring%20about%20a%20bulk/commercial%20chicken%20order%20with%20GST%20invoice.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--radius-control)] bg-[#15803D] hover:bg-[#166534] text-white font-semibold text-sm transition-all hover-lift active-press shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Connect for Bulk Rates on WhatsApp
                </a>
              </div>
            </Surface>
          </div>
        )}
      </main>

      {/* Floating Mobile Action Bar (Dynamic Viewport Safe) */}
      <aside
        className="md:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E6DEC8] px-4 py-2.5 shadow-lg"
        aria-label="Quick mobile actions"
      >
        <div className="flex items-center gap-3">
          <a
            href={`tel:${siteData.phone}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[var(--radius-control)] bg-[#F3EFE6] text-[#231917] font-semibold text-xs active:scale-98 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-[#A83A2F]" />
            <span>Call Shop</span>
          </a>

          <Button
            onClick={() => openPreBook()}
            variant="primary"
            tone="crimson"
            size="md"
            className="flex-[2] text-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pre-Book Pickup</span>
          </Button>
        </div>
      </aside>

      {/* Modern Adaptive ModalSheet for Pre-Booking */}
      <ModalSheet
        isOpen={isSheetOpen}
        onClose={closePreBook}
        title={
          <div className="flex items-center gap-2">
            <span>{siteData.booking.title}</span>
            <span className="font-bengali text-xs font-semibold text-[#872B22]">
              {siteData.booking.titleBengali}
            </span>
          </div>
        }
        subtitle="Ready in 2 mins at Fuljhore counter · Pay upon weight confirmation"
      >
        {orderConfirmed ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#231917]">
                Pre-Booking #{orderConfirmed.code} Ready
              </h3>
              <p className="text-xs text-[#665852] mt-1 max-w-sm mx-auto">
                {orderConfirmed.message}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                onClick={closePreBook}
                variant="secondary"
                size="sm"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Product Selection */}
            <div className="space-y-1.5">
              <label htmlFor="product-select" className="text-xs font-bold text-[#231917]">
                Select Cut Item
              </label>
              <select
                id="product-select"
                value={selectedProduct.id}
                onChange={e => {
                  const p = fallbackProducts.find(item => item.id === e.target.value);
                  if (p) setSelectedProduct(p);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-[var(--radius-control)] border border-[#E6DEC8] bg-[#FAF7F2] focus:ring-2 focus:ring-[#A83A2F] outline-none"
              >
                {fallbackProducts.map(p => (
                  <option key={p.id} value={p.id} disabled={!p.is_available}>
                    {p.name} ({p.name_bengali}) — ₹{p.price_per_kg}/kg {!p.is_available ? '(Out of stock)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cut Style Selection using Reflections Chip Primitive */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#231917]">Cut Style (কাটের ধরন)</span>
              <div className="grid grid-cols-3 gap-2">
                {cutStyleOptions.map(cut => (
                  <Chip
                    key={cut.value}
                    active={selectedCut === cut.value}
                    onClick={() => setSelectedCut(cut.value)}
                  >
                    {cut.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Weight Selection using Reflections Chip Primitive */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#231917]">Weight / পরিমাণ</span>
              <div className="grid grid-cols-4 gap-2">
                {weightOptions.map(w => (
                  <Chip
                    key={w.value}
                    active={selectedWeight === w.value && !customWeight}
                    onClick={() => {
                      setSelectedWeight(w.value);
                      setCustomWeight('');
                    }}
                  >
                    {w.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Pickup Time Selection using Reflections Chip Primitive */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#231917]">Pickup Timing (পিকআপের সময়)</span>
              <div className="grid grid-cols-3 gap-2">
                {pickupOptions.map(p => (
                  <Chip
                    key={p.value}
                    active={selectedPickup === p.value}
                    onClick={() => setSelectedPickup(p.value)}
                  >
                    {p.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Customer Inputs with :user-invalid and :user-valid rules */}
            <div className="space-y-3 pt-2 border-t border-[#E6DEC8]">
              {/* Name Field */}
              <div className="field space-y-1">
                <label htmlFor="customer-name" className="text-xs font-bold text-[#231917] flex justify-between">
                  <span>Your Name (নাম)</span>
                  <span className="text-[11px] text-[#665852] font-normal">Required</span>
                </label>
                <span id="name-hint" className="text-[11px] text-[#665852] block">
                  Enter the name for counter pickup announcement
                </span>
                <input
                  type="text"
                  id="customer-name"
                  name="name"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Subrata / Anirban"
                  autoComplete="name"
                  aria-describedby="name-hint"
                  data-error="name-error"
                  className="w-full text-xs p-2.5 rounded-[var(--radius-control)] border border-[#E6DEC8] bg-[#FAF7F2] focus:ring-2 focus:ring-[#A83A2F] outline-none font-medium"
                />
                <div id="name-error" className="error-msg items-center gap-1 text-[11px] text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Please enter your name for counter pickup.</span>
                </div>
              </div>

              {/* Phone Field */}
              <div className="field space-y-1">
                <label htmlFor="customer-phone" className="text-xs font-bold text-[#231917] flex justify-between">
                  <span>10-Digit Mobile (ফোন নম্বর)</span>
                  <span className="text-[11px] text-[#665852] font-normal">Required</span>
                </label>
                <span id="phone-hint" className="text-[11px] text-[#665852] block">
                  Format: 10 digits without +91 (e.g. 9635021694)
                </span>
                <input
                  type="tel"
                  id="customer-phone"
                  name="phone"
                  required
                  pattern="[0-9]{10}"
                  inputMode="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="9635021694"
                  autoComplete="tel"
                  aria-describedby="phone-hint"
                  data-error="phone-error"
                  className="w-full text-xs p-2.5 rounded-[var(--radius-control)] border border-[#E6DEC8] bg-[#FAF7F2] focus:ring-2 focus:ring-[#A83A2F] outline-none font-mono font-medium"
                />
                <div id="phone-error" className="error-msg items-center gap-1 text-[11px] text-red-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Please enter a valid 10-digit mobile number.</span>
                </div>
              </div>

              {/* Invoice Request Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={requestInvoice}
                  onChange={e => setRequestInvoice(e.target.checked)}
                  className="w-4 h-4 rounded text-[#A83A2F] focus:ring-[#A83A2F]"
                />
                <span className="text-xs text-[#231917] font-medium">
                  {siteData.booking.invoiceLabel} ({siteData.booking.invoiceLabelBengali})
                </span>
              </label>
            </div>

            {/* Price Estimate Summary */}
            <div className="p-3.5 rounded-[var(--radius-control)] bg-[#FAF7F2] border border-[#E6DEC8] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#665852] block font-medium">Estimated Total ({effectiveWeight}kg)</span>
                <span className="font-extrabold font-mono text-base text-[#872B22] tabular-nums">~₹{estimatedPrice}</span>
              </div>
              <div className="text-right text-[11px] text-[#665852]">
                <span className="font-medium">Pay at Counter</span>
                <p className="text-emerald-700 font-bold">No advance payment</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                tone="whatsapp"
                size="md"
                className="w-full py-3"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Pre-Booking via WhatsApp</span>
              </Button>
            </div>
          </form>
        )}
      </ModalSheet>

      {/* Footer */}
      <footer className="mt-auto bg-[#FFFFFF] border-t border-[#E6DEC8] py-8 text-xs text-[#665852]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-[#872B22]">{siteData.shopName}</span>
            <span className="font-bengali text-xs font-semibold">{siteData.shopNameBengali}</span>
          </div>

          <p className="text-center sm:text-right">
            Fuljhore Sabji Market, Durgapur-713206 · Udyam: {siteData.udyamRegistrationNumber}
          </p>
        </div>
      </footer>
    </div>
  );
}
