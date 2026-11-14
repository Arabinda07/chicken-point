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
  Scale,
  Copy
} from 'lucide-react';
import { siteData, fallbackProducts, cutStyleOptions, weightOptions, pickupOptions } from './data';
import type { Product, CutStyle } from './lib/supabase';
import { EarningsDashboard } from './components/EarningsDashboard';
import { Button } from './components/ui/Button';
import { Chip } from './components/ui/Chip';
import { Surface } from './components/ui/Surface';
import { ModalSheet } from './components/ui/ModalSheet';
import { Badge } from './components/ui/Badge';
import { FieldInput } from './components/ui/Field';
import {
  StatusDot,
  CheckboxInput,
  useToast,
} from '@astryxdesign/core';

import logoUrl from '../assets/logo.jpeg';
import paymentQrUrl from '../assets/QR1.png';
import googleReviewQrUrl from '../assets/Shop_GoogleQR.png';

export default function App() {
  const toast = useToast();
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
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  const copyUpiId = () => {
    navigator.clipboard.writeText(siteData.upiId);
    setCopiedUpi(true);
    toast({ body: `UPI ID ${siteData.upiId} copied to clipboard!` });
    setTimeout(() => setCopiedUpi(false), 2000);
  };

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

    if (!customerName.trim()) {
      toast({ body: 'Please enter your name for counter pickup.' });
      return;
    }
    if (!/^\d{10}$/.test(customerPhone.trim())) {
      toast({ body: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

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
    <div className="min-h-screen-dvh flex flex-col bg-[#FAF7F2] text-[#111314] selection:bg-[#a84222]/20 selection:text-[#6c2b11]">
      {/* Accessible Polite Live Region for Screen Readers */}
      <div className="visually-hidden" aria-live="polite" role="status">
        {ariaAnnouncement}
      </div>

      {/* Top Header: Reflections Frosted Glass Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#d8cab6] transition-shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={logoUrl}
                alt="Bikash Chicken Point Logo"
                className="w-11 h-11 rounded-full object-cover shadow-sm border border-[#d8cab6] ring-2 ring-[#a84222]/15"
                width="44"
                height="44"
                fetchPriority="high"
              />
              <span
                aria-hidden="true"
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  isShopOpen ? 'bg-[#15803D]' : 'bg-[#e0b81f]'
                }`}
                title={isShopOpen ? 'Open now' : 'Pre-orders only'}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-[#6c2b11] whitespace-nowrap">
                  {siteData.shopName}
                </span>
                <span className="font-bengali text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-chip)] bg-[#a84222]/10 text-[#a84222] whitespace-nowrap">
                  {siteData.shopNameBengali}
                </span>
              </div>
              <p className="text-xs text-[#7c4226] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#a84222] flex-shrink-0" />
                <span className="truncate">Sabji Market, Fuljhore, Durgapur-713206</span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons & Status */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:inline-flex items-center">
              <Badge
                tone={isShopOpen ? 'whatsapp' : 'ocher'}
                icon={
                  <StatusDot
                    variant={isShopOpen ? 'success' : 'warning'}
                    label={isShopOpen ? 'Counter Open' : 'Pre-orders'}
                    isPulsing={isShopOpen}
                  />
                }
                label={isShopOpen ? 'Counter Open (8 AM - 9 PM)' : 'Pre-orders Accepted'}
              />
            </div>

            <a
              href={`tel:${siteData.phone}`}
              className="inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-semibold rounded-[var(--radius-chip)] bg-[#f5ebd6] hover:bg-[#ebd3a2] text-[#111314] transition-[transform,background-color] duration-150 ease-[var(--ease-out-expo)] active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40"
              aria-label="Call shop owner"
            >
              <Phone className="w-3.5 h-3.5 text-[#a84222]" />
              <span className="hidden md:inline">Call Shop</span>
            </a>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="inline-flex items-center gap-1 px-2.5 min-h-[38px] text-xs font-medium rounded-[var(--radius-chip)] text-[#7c4226] hover:text-[#111314] hover:bg-[#f5ebd6] transition-[transform,background-color,color] duration-150 ease-[var(--ease-out-expo)] active:scale-97 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/35"
              title="Owner Admin Dashboard"
              aria-label="Owner Admin Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Admin</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Storefront sections"
          className="max-w-5xl mx-auto px-4 border-t border-[#d8cab6]/70 overflow-x-auto no-scrollbar"
        >
          <div role="tablist" className="flex items-center gap-1 sm:gap-2 min-w-max">
            {[
              { id: 'shop' as const, label: 'Menu & Pre-Book', icon: Utensils },
              { id: 'qr' as const, label: 'Counter QR & Location', icon: QrCode },
              { id: 'bulk' as const, label: 'Bulk & B2B Orders', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-xs sm:text-sm whitespace-nowrap transition-[color,background-color] duration-150 ease-[var(--ease-out-expo)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40 rounded-t-[var(--radius-chip)] ${
                    isActive
                      ? 'text-[#6c2b11] font-bold'
                      : 'text-[#7c4226] font-medium hover:text-[#111314] hover:bg-[#f5ebd6]/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#a84222]' : 'text-[#7c4226]'}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#a84222]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-6 pb-20 md:pb-8">
        {activeTab === 'shop' && (
          <div className="space-y-8">
            {/* Hero Section: Wada Sanzo Deep Brown -> Brick Red */}
            <section className="relative overflow-hidden rounded-[var(--radius-panel)] bg-gradient-to-br from-[#6c2b11] via-[#8b361a] to-[#a84222] text-white p-6 sm:p-8 shadow-md">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-1 rounded-[var(--radius-chip)] bg-white/15 text-white/95 text-xs font-semibold backdrop-blur-sm border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-[#e0b81f] flex-shrink-0" />
                  <span className="font-bengali">{siteData.hero.eyebrow}</span>
                  <span className="opacity-80">· Fuljhore Sabji Market</span>
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[var(--radius-control)] bg-[#15803D] hover:bg-[#166534] text-white font-semibold text-sm transition-[transform,background-color,box-shadow] duration-150 ease-[var(--ease-out-expo)] active:scale-97 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ask Rate on WhatsApp
                  </a>
                </div>

                {/* 2-Min Pickup Trust Guarantee Cue */}
                <div className="pt-3 border-t border-white/20 flex items-center gap-2 text-xs text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#e0b81f] flex-shrink-0" />
                  <span>{siteData.fastTrack.english} ({siteData.fastTrack.bengali})</span>
                </div>
              </div>

              {/* Soft circular logo watermark without rectangular edge */}
              <div
                className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 w-52 h-52 rounded-full opacity-12 pointer-events-none bg-cover bg-center mix-blend-luminosity"
                style={{
                  backgroundImage: `url(${logoUrl})`,
                  maskImage: 'radial-gradient(circle, black 45%, transparent 72%)',
                  WebkitMaskImage: 'radial-gradient(circle, black 45%, transparent 72%)',
                }}
                aria-hidden="true"
              />
            </section>

            {/* Daily Counter Rate Transparency Notice (Wada Warmth) */}
            <Surface
              variant="flat"
              padding="md"
              className="!bg-[#f5ebd6]/75 !border-[#e0b81f]/60 flex items-start gap-3"
            >
              <div className="p-2 rounded-[var(--radius-concentric-control)] bg-[#ebd3a2]/70 text-[#6c2b11] flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs leading-relaxed">
                <h2 className="font-display font-bold text-sm text-[#6c2b11]">
                  Live Counter Rate Transparency Notice / <span className="font-bengali">প্রতিদিনের দর বিজ্ঞপ্তি</span>
                </h2>
                <p className="text-[#7c4226]">
                  Prices update daily based on local market rates. To guarantee accuracy, please confirm the final weight and amount at the shop counter upon walk-in pickup before making your UPI/cash payment.
                </p>
              </div>
            </Surface>

            {/* Product Cards using Surface & Badge */}
            <section className="space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#111314]">
                    Today's Fresh Cuts & Counter Menu
                  </h2>
                  <p className="text-xs text-[#7c4226] mt-0.5">
                    Select any cut to customize weight and reserve for counter pickup
                  </p>
                </div>
                <Badge
                  tone="neutral"
                  label={`${fallbackProducts.filter(p => p.is_available).length} cuts ready`}
                />
              </div>

              {/* Product Grid Container */}
              <div className="product-grid-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fallbackProducts.map(product => {
                  const details = siteData.menuDetails[product.id as keyof typeof siteData.menuDetails];
                  return (
                    <Surface
                      key={product.id}
                      variant="paper"
                      padding="md"
                      className="product-card flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-base text-[#111314]">
                              {product.name}
                            </h3>
                            <p className="font-bengali text-xs font-semibold text-[#6c2b11]">
                              {product.name_bengali}
                            </p>
                          </div>
                          <Badge
                            tone={product.is_available ? 'ocher' : 'neutral'}
                            label={product.is_available ? 'Available' : 'Check Counter'}
                          />
                        </div>

                        {details && (
                          <p className="text-xs text-[#7c4226] line-clamp-2 leading-relaxed">
                            {details.detail}
                          </p>
                        )}
                      </div>

                      <div className="pt-3.5 mt-3.5 border-t border-[#d8cab6]/70 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-xs text-[#7c4226] block font-medium">Counter Rate</span>
                          <span className="text-lg font-extrabold font-mono text-[#6c2b11] tabular-nums">
                            ₹{product.price_per_kg}
                            <span className="text-xs font-normal text-[#7c4226]">/kg</span>
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
                    </Surface>
                  );
                })}
              </div>
            </section>

            {/* How Walk-in Pickup Works */}
            <Surface variant="paper" padding="md" className="space-y-4">
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#111314]">
                How Pre-Booked Walk-in Pickup Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {siteData.orderSteps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-[var(--radius-concentric-panel)] bg-[#FAF7F2] border border-[#d8cab6]/80 space-y-2">
                    <span className="w-7 h-7 rounded-full bg-[#6c2b11] text-white text-xs font-bold font-mono tabular-nums flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <h3 className="font-display font-semibold text-sm text-[#111314]">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#7c4226] leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </Surface>

            {/* FAQs in English & Bengali */}
            <section className="space-y-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#111314]">
                  {siteData.faqSection.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {siteData.faqs.map(faq => (
                  <Surface key={faq.id} variant="paper" padding="md" className="space-y-2">
                    <Badge tone="neutral" label={faq.tag} />
                    <h3 className="font-display font-bold text-sm text-[#111314]">
                      {faq.question}
                    </h3>
                    <p className="font-bengali text-xs font-semibold text-[#6c2b11]">
                      {faq.questionBengali}
                    </p>
                    <p className="text-xs text-[#7c4226] pt-2 border-t border-[#d8cab6]/60 leading-relaxed">
                      {faq.answer}
                    </p>
                    <p className="font-bengali text-xs text-[#7c4226]">
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
              <h1 className="font-display text-2xl font-bold text-[#111314]">
                Shop Counter QR & Directions
              </h1>
              <p className="text-xs text-[#7c4226] mt-0.5">
                Sabji Market, Fuljhore, Durgapur-713206, West Bengal
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PhonePe UPI Standee QR */}
              <Surface variant="paper" padding="lg" className="text-center space-y-4">
                <div className="inline-flex p-2.5 rounded-full bg-[#15803D]/10 text-[#15803D]">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-[#111314]">
                    PhonePe / UPI Counter QR
                  </h2>
                  <p className="text-xs text-[#7c4226]">
                    Scan directly at the counter during pickup
                  </p>
                </div>
                <div className="max-w-[220px] mx-auto p-2 bg-[#FAF7F2] rounded-[var(--radius-control)] border border-[#d8cab6]">
                  <img
                    src={paymentQrUrl}
                    alt="Bikash Chicken Point PhonePe Payment QR"
                    className="w-full h-auto rounded-[var(--radius-concentric-control)]"
                    width="220"
                    height="220"
                  />
                </div>
                <div className="text-xs text-[#7c4226] space-y-3">
                  <div className="flex items-center justify-between gap-2 p-3 bg-[#FAF7F2] rounded-[var(--radius-control)] border border-[#d8cab6]">
                    <div className="text-left min-w-0">
                      <span className="text-xs text-[#7c4226] block font-semibold">PhonePe UPI ID</span>
                      <code className="font-mono font-bold text-xs text-[#111314] select-all">{siteData.upiId}</code>
                    </div>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="inline-flex items-center gap-1.5 px-3 min-h-[38px] text-xs font-semibold rounded-[var(--radius-chip)] bg-[#6c2b11] text-white hover:bg-[#a84222] transition-[transform,background-color] duration-150 ease-[var(--ease-out-expo)] active:scale-97 cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40"
                      title="Copy UPI ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-[var(--radius-concentric-panel)] bg-[#f5ebd6]/80 border border-[#e0b81f]/60 text-left">
                    <AlertCircle className="w-4 h-4 text-[#6c2b11] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#6c2b11] block">Counter Weight Confirmation</span>
                      <span className="text-xs text-[#7c4226]">
                        Pay only after the final weight is confirmed on the shop weighing scale.
                      </span>
                    </div>
                  </div>
                </div>
              </Surface>

              {/* Google Business Profile & Reviews */}
              <Surface variant="paper" padding="lg" className="text-center space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex p-2.5 rounded-full bg-[#a84222]/10 text-[#a84222]">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#111314]">
                      Google Profile & Verified Reviews
                    </h2>
                    <p className="text-xs text-[#7c4226]">
                      Locate us in Sabji Market or leave a review
                    </p>
                  </div>
                  <div className="max-w-[220px] mx-auto p-2 bg-[#FAF7F2] rounded-[var(--radius-control)] border border-[#d8cab6]">
                    <img
                      src={googleReviewQrUrl}
                      alt="Bikash Chicken Point Google Profile QR"
                      className="w-full h-auto rounded-[var(--radius-concentric-control)]"
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
                    className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-[var(--radius-control)] bg-[#f5ebd6] hover:bg-[#ebd3a2] text-xs font-semibold text-[#111314] transition-[transform,background-color] duration-150 ease-[var(--ease-out-expo)] active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40"
                  >
                    <span>Open on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Surface>
            </div>

            {/* Shop Details & Udyam Registration */}
            <Surface variant="flat" padding="md" className="text-xs text-[#7c4226] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#111314]">MSME Registration:</span>
                <Badge tone="neutral" label={siteData.udyamRegistrationNumber} className="font-mono tabular-nums" />
              </div>
              <div>
                <span className="font-semibold text-[#111314]">Counter Timing:</span>{' '}
                <span>{siteData.timing}</span>
              </div>
            </Surface>
          </div>
        )}

        {/* Tab 3: Bulk & B2B Orders */}
        {activeTab === 'bulk' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111314]">
                {siteData.b2b.title}
              </h1>
              <p className="text-sm text-[#7c4226] mt-2 leading-relaxed">
                {siteData.b2b.body}
              </p>
              <p className="font-bengali text-xs text-[#6c2b11] mt-1 font-semibold">
                {siteData.b2b.bodyBengali}
              </p>
            </div>

            <Surface variant="paper" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="font-display text-base font-bold text-[#111314]">
                  Wholesale & Commercial Invoicing Benefits
                </h2>
                <Badge tone="ocher" label="B2B Wholesale" />
              </div>
              <ul className="text-xs text-[#7c4226] space-y-2.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" />
                  <span>Fresh daily dressing cut to your specific culinary requirements</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" />
                  <span>GST-compliant business invoice generated for tax accounting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" />
                  <span>Dedicated counter pickup line so your kitchen prep isn't delayed</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-[#d8cab6]">
                <a
                  href={`https://wa.me/${siteData.whatsapp}?text=Hello%20Bikash%20Da,%20I%20am%20inquiring%20about%20a%20bulk/commercial%20chicken%20order%20with%20GST%20invoice.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 min-h-[44px] py-3 rounded-[var(--radius-control)] bg-[#15803D] hover:bg-[#166534] text-white font-semibold text-sm transition-[transform,background-color,box-shadow] duration-150 ease-[var(--ease-out-expo)] active:scale-97 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D]/40"
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
        className="md:hidden sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#d8cab6] px-4 py-2.5 shadow-lg"
        aria-label="Quick mobile actions"
      >
        <div className="flex items-center gap-3">
          <a
            href={`tel:${siteData.phone}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 px-3 rounded-[var(--radius-control)] bg-[#f5ebd6] hover:bg-[#ebd3a2] text-[#111314] font-semibold text-xs transition-[transform,background-color] duration-150 ease-[var(--ease-out-expo)] active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40"
          >
            <Phone className="w-3.5 h-3.5 text-[#a84222]" />
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
          <div className="flex items-center gap-2 flex-wrap">
            <span>{siteData.booking.title}</span>
            <span className="font-bengali text-xs font-semibold text-[#6c2b11]">
              {siteData.booking.titleBengali}
            </span>
          </div>
        }
        subtitle="Ready in 2 mins at Fuljhore counter · Pay upon weight confirmation"
        footer={
          !orderConfirmed ? (
            <div className="space-y-3">
              <div className="p-3 bg-white border border-[#d8cab6] rounded-[var(--radius-control)] flex items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[#7c4226] block font-medium">Estimated Total ({effectiveWeight}kg)</span>
                  <span className="font-extrabold font-mono text-base text-[#6c2b11] tabular-nums">~₹{estimatedPrice}</span>
                </div>
                <div className="text-right space-y-1">
                  <Badge tone="whatsapp" label="No advance payment" />
                  <p className="text-xs text-[#7c4226]">Pay at counter scale</p>
                </div>
              </div>

              <Button
                type="submit"
                form="prebook-form"
                variant="primary"
                tone="whatsapp"
                size="md"
                className="w-full"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Pre-Booking via WhatsApp</span>
              </Button>
            </div>
          ) : undefined
        }
      >
        {orderConfirmed ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#15803D]/12 text-[#15803D] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#111314]">
                Pre-Booking #{orderConfirmed.code} Ready
              </h3>
              <p className="text-xs text-[#7c4226] mt-1 max-w-sm mx-auto">
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
          <form id="prebook-form" onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Product Selection */}
            <div className="space-y-1.5">
              <label htmlFor="product-select" className="block text-xs font-bold text-[#111314]">
                Select Cut Item
              </label>
              <select
                id="product-select"
                value={selectedProduct.id}
                onChange={e => {
                  const p = fallbackProducts.find(item => item.id === e.target.value);
                  if (p) setSelectedProduct(p);
                }}
                className="w-full min-h-[44px] text-base sm:text-sm font-semibold px-3 py-2.5 rounded-[var(--radius-control)] border border-[#d8cab6] bg-[#FAF7F2] focus:bg-white focus:border-[#a84222] focus:ring-2 focus:ring-[#a84222]/25 outline-none transition-[border-color,background-color] duration-150 ease-[var(--ease-out-expo)]"
              >
                {fallbackProducts.map(p => (
                  <option key={p.id} value={p.id} disabled={!p.is_available}>
                    {p.name} ({p.name_bengali}) — ₹{p.price_per_kg}/kg {!p.is_available ? '(Out of stock)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cut Style Selection using Chip Primitive */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-[#111314]">Cut Style (কাটের ধরন)</span>
              <div className="flex flex-wrap gap-2">
                {cutStyleOptions.map(cut => (
                  <Chip
                    key={cut.value}
                    active={selectedCut === cut.value}
                    onClick={() => setSelectedCut(cut.value)}
                    className="flex-1 min-w-[110px]"
                  >
                    {cut.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Weight Selection using Chip Primitive */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-[#111314]">Weight / পরিমাণ</span>
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

            {/* Pickup Time Selection using Chip Primitive */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-[#111314]">Pickup Timing (পিকআপের সময়)</span>
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

            {/* Customer Inputs */}
            <div className="space-y-3 pt-2 border-t border-[#d8cab6]">
              <FieldInput
                label="Your Name (নাম)"
                description="Enter the name for counter pickup announcement"
                isRequired
                value={customerName}
                onChange={(val) => setCustomerName(val)}
                placeholder="e.g. Subrata / Anirban"
                autoComplete="name"
              />

              <FieldInput
                type="tel"
                label="10-Digit Mobile (ফোন নম্বর)"
                description="Format: 10 digits without +91 (e.g. 9635021694)"
                isRequired
                value={customerPhone}
                onChange={(val) => {
                  const cleaned = val.replace(/\D/g, '').slice(0, 10);
                  setCustomerPhone(cleaned);
                }}
                placeholder="9635021694"
                autoComplete="tel"
              />

              <div className="pt-1">
                <CheckboxInput
                  label={`${siteData.booking.invoiceLabel} (${siteData.booking.invoiceLabelBengali})`}
                  description="GST-compliant business invoice generated for tax accounting"
                  value={requestInvoice}
                  onChange={(checked) => setRequestInvoice(checked)}
                />
              </div>
            </div>
          </form>
        )}
      </ModalSheet>

      {/* Footer */}
      <footer className="mt-auto bg-[#FFFFFF] border-t border-[#d8cab6] py-8 text-xs text-[#7c4226]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-[#6c2b11]">{siteData.shopName}</span>
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
