import React, { useState, useMemo, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Sun,
  ShieldCheck,
  Utensils,
  Truck,
  Plus,
  Scale,
  Award,
  Flame,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import {
  siteData,
  fallbackProducts,
  productCategories,
  cutStyleOptions,
  type ProductCategory,
} from './data';
import type { Product, CutStyle } from './lib/supabase';
import { EarningsDashboard } from './components/EarningsDashboard';
import { Button } from './components/ui/Button';
import { Surface } from './components/ui/Surface';
import { Badge } from './components/ui/Badge';
import { ModalSheet } from './components/ui/ModalSheet';
import { CartDrawer, type CartItem, type WeightUnit } from './components/ui/CartDrawer';
import {
  AspectRatio,
  Badge as AstryxBadge,
  Card,
  Carousel,
  Divider,
  SegmentedControl,
  SegmentedControlItem,
  StatusDot,
  Tab,
  TabList,
  useSnapPaging,
  useToast,
} from '@astryxdesign/core';

import logoUrl from '../assets/logo.jpeg';
import qrUpiUrl from '../assets/QR1.png';
import qrGoogleUrl from '../assets/Shop_GoogleQR.png';

function renderCutPlateArt(productId: string) {
  switch (productId) {
    case 'curry-cut':
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full" aria-hidden="true">
          <rect width="320" height="240" fill="#f5ebd6" />
          <circle cx="160" cy="120" r="86" fill="#FAF7F2" stroke="#d8cab6" strokeWidth="1.5" />
          <circle cx="160" cy="120" r="72" fill="none" stroke="#ebd3a2" strokeWidth="1" strokeDasharray="4 4" />
          {/* Medium Bone-In Curry Portion Grid */}
          <rect x="112" y="76" width="42" height="38" rx="10" fill="#a84222" />
          <circle cx="124" cy="88" r="4.5" fill="#FAF7F2" />
          <rect x="164" y="76" width="44" height="38" rx="10" fill="#7c4226" />
          <rect x="112" y="124" width="44" height="40" rx="10" fill="#6c2b11" />
          <rect x="166" y="124" width="42" height="40" rx="10" fill="#a84222" />
          <circle cx="194" cy="150" r="4.5" fill="#FAF7F2" />
          <circle cx="160" cy="120" r="6" fill="#e0b81f" />
        </svg>
      );
    case 'whole-chicken':
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full" aria-hidden="true">
          <rect width="320" height="240" fill="#FAF7F2" />
          <rect x="28" y="24" width="264" height="192" rx="20" fill="#f5ebd6" stroke="#d8cab6" strokeWidth="1.5" />
          {/* Whole Bird Butcher Section Diagram */}
          <ellipse cx="160" cy="120" rx="68" ry="52" fill="#a84222" />
          <ellipse cx="160" cy="120" rx="46" ry="32" fill="#6c2b11" />
          <line x1="160" y1="56" x2="160" y2="184" stroke="#FAF7F2" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="82" y1="120" x2="238" y2="120" stroke="#FAF7F2" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="160" cy="120" r="5" fill="#e0b81f" />
        </svg>
      );
    case 'boneless-breast':
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full" aria-hidden="true">
          <rect width="320" height="240" fill="#f5ebd6" />
          <rect x="44" y="34" width="232" height="172" rx="18" fill="#FAF7F2" stroke="#d8cab6" strokeWidth="1.5" />
          {/* Precision Lean Cubes */}
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={74 + col * 46}
                y={62 + row * 42}
                width="34"
                height="30"
                rx="6"
                fill={(row + col) % 2 === 0 ? '#a84222' : '#7c4226'}
              />
            )),
          )}
        </svg>
      );
    case 'drumsticks':
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full" aria-hidden="true">
          <rect width="320" height="240" fill="#FAF7F2" />
          <circle cx="160" cy="120" r="86" fill="#f5ebd6" stroke="#d8cab6" strokeWidth="1.5" />
          {/* Paired Whole Drumsticks */}
          <g transform="translate(160 120) rotate(-24)">
            <rect x="-12" y="-58" width="24" height="72" rx="12" fill="#a84222" />
            <rect x="-5" y="10" width="10" height="38" rx="4" fill="#FAF7F2" stroke="#c2ae93" strokeWidth="1.5" />
          </g>
          <g transform="translate(160 120) rotate(24)">
            <rect x="-12" y="-58" width="24" height="72" rx="12" fill="#6c2b11" />
            <rect x="-5" y="10" width="10" height="38" rx="4" fill="#FAF7F2" stroke="#c2ae93" strokeWidth="1.5" />
          </g>
        </svg>
      );
    case 'leg-pieces':
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full" aria-hidden="true">
          <rect width="320" height="240" fill="#f5ebd6" />
          <rect x="36" y="28" width="248" height="184" rx="22" fill="#FAF7F2" stroke="#d8cab6" strokeWidth="1.5" />
          {/* Whole Leg + Thigh Biryani Cut */}
          <path
            d="M102 152 C102 98, 146 68, 198 74 C218 76, 226 98, 212 120 C196 146, 160 166, 114 166 Z"
            fill="#a84222"
          />
          <circle cx="188" cy="100" r="14" fill="#6c2b11" />
          <circle cx="188" cy="100" r="5" fill="#e0b81f" />
          <rect x="92" y="146" width="32" height="14" rx="7" fill="#ebd3a2" stroke="#c2ae93" strokeWidth="1.5" />
        </svg>
      );
    case 'keema':
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full" aria-hidden="true">
          <rect width="320" height="240" fill="#FAF7F2" />
          <circle cx="160" cy="120" r="84" fill="#f5ebd6" stroke="#d8cab6" strokeWidth="1.5" />
          <circle cx="160" cy="120" r="58" fill="#a84222" />
          {/* Hand-Minced Geometric Grain */}
          {[
            [140, 100],
            [162, 94],
            [180, 106],
            [134, 120],
            [158, 118],
            [182, 126],
            [144, 140],
            [168, 142],
          ].map(([cx, cy], i) => (
            <rect
              key={i}
              x={cx - 8}
              y={cy - 4}
              width="16"
              height="8"
              rx="4"
              fill={i % 2 === 0 ? '#FAF7F2' : '#ebd3a2'}
            />
          ))}
        </svg>
      );
    case 'liver-gizzard':
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full" aria-hidden="true">
          <rect width="320" height="240" fill="#f5ebd6" />
          <rect x="44" y="34" width="232" height="172" rx="18" fill="#FAF7F2" stroke="#d8cab6" strokeWidth="1.5" />
          <circle cx="128" cy="120" r="38" fill="#6c2b11" />
          <circle cx="192" cy="120" r="38" fill="#a84222" />
          <circle cx="128" cy="120" r="14" fill="#ebd3a2" />
          <circle cx="192" cy="120" r="14" fill="#f5ebd6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full" aria-hidden="true">
          <rect width="320" height="240" fill="#FAF7F2" />
          <rect x="36" y="28" width="248" height="184" rx="20" fill="#f5ebd6" stroke="#d8cab6" strokeWidth="1.5" />
          {/* Stacked Event / Catering Tray */}
          <rect x="76" y="64" width="168" height="32" rx="8" fill="#6c2b11" />
          <rect x="76" y="104" width="168" height="32" rx="8" fill="#a84222" />
          <rect x="76" y="144" width="168" height="32" rx="8" fill="#e0b81f" />
        </svg>
      );
  }
}

export default function App() {
  const toast = useToast();
  const snapPaging = useSnapPaging({ pages: 'item' });
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextPath: string) => {
    window.history.pushState({}, '', nextPath);
    setPathname(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category & Per-Card Weight State
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('All Cuts');
  const [cardWeights, setCardWeights] = useState<Record<string, WeightUnit>>(() => {
    const initial: Record<string, WeightUnit> = {};
    fallbackProducts.forEach((p) => {
      initial[p.id] = '1kg';
    });
    return initial;
  });

  // Cart & Drawer State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedCut, setSelectedCut] = useState<CutStyle>('curry');
  const [selectedPickup, setSelectedPickup] = useState<string>('ASAP');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [requestInvoice, setRequestInvoice] = useState<boolean>(false);
  const [orderConfirmed, setOrderConfirmed] = useState<{ code: string; message: string } | null>(null);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');
  const [activeQrPreview, setActiveQrPreview] = useState<'upi' | 'google' | null>(null);
  const [standardsTab, setStandardsTab] = useState<'process' | 'qr'>('process');
  const [swappingWeightId, setSwappingWeightId] = useState<string | null>(null);
  const [isCartBumping, setIsCartBumping] = useState<boolean>(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Live Kolkata Counter Open Status (8:00 AM - 9:00 PM Asia/Kolkata)
  const isCounterOpenNow = useMemo(() => {
    try {
      const hourStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        hour12: false,
      }).format(new Date());
      const hour = Number.parseInt(hourStr, 10);
      return hour >= siteData.openingHours.startHour && hour < siteData.openingHours.endHour;
    } catch {
      return true;
    }
  }, []);

  // Filtered products for the active category pill
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All Cuts') return fallbackProducts;
    return fallbackProducts.filter((product) => {
      const details = siteData.menuDetails[product.id as keyof typeof siteData.menuDetails];
      return details?.category === activeCategory;
    });
  }, [activeCategory]);

  // Total item count in Cart
  const cartItemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  // Toggle 500g / 1kg pill on a product card with tabular price swap micro-interaction
  const handleSelectCardWeight = (productId: string, unit: WeightUnit) => {
    if ((cardWeights[productId] ?? '1kg') === unit) return;
    setSwappingWeightId(productId);
    setCardWeights((prev) => ({ ...prev, [productId]: unit }));
    window.setTimeout(() => {
      setSwappingWeightId((curr) => (curr === productId ? null : curr));
    }, 160);
  };

  // Add product with selected weight to Cart with badge bump & button state feedback
  const handleAddToCart = (product: Product) => {
    const weightUnit: WeightUnit = cardWeights[product.id] ?? '1kg';
    const weightKg = weightUnit === '500g' ? 0.5 : 1;
    const unitPrice = Math.round(product.price_per_kg * weightKg);
    const key = `${product.id}-${weightUnit}`;

    setOrderConfirmed(null);
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === key);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          key,
          product,
          weightUnit,
          weightKg,
          unitPrice,
          quantity: 1,
        },
      ];
    });

    setIsCartBumping(true);
    setRecentlyAddedId(product.id);
    window.setTimeout(() => setIsCartBumping(false), 220);
    window.setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 900);

    const msg = `Added ${product.name} (${weightUnit}) to cart`;
    setAriaAnnouncement(msg);
    toast({ body: `${msg} · ₹${unitPrice}` });
  };

  const handleUpdateQuantity = (key: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (key: string) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSubmitOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast({ body: 'Please add at least one cut to your cart.' });
      return;
    }
    if (!customerName.trim()) {
      toast({ body: 'Please enter your name for the order.' });
      return;
    }
    if (!/^\d{10}$/.test(customerPhone.trim())) {
      toast({ body: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `BCP-${orderNum}`;
    const cutName =
      cutStyleOptions.find((c) => c.value === selectedCut)?.whatsappLabel ?? selectedCut;

    const totalWeightKg = cartItems.reduce(
      (sum, item) => sum + item.weightKg * item.quantity,
      0,
    );
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const itemLines = cartItems
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.product.name} (${item.weightUnit} × ${item.quantity}) — ~₹${
            item.unitPrice * item.quantity
          }`,
      )
      .join('\n');

    const message = `Hello Bikash Chicken Point! I would like to place a fresh chicken order:
━━━━━━━━━━━━━━━━━
📦 Order ID: #${orderCode}
${itemLines}
━━━━━━━━━━━━━━━━━
⚖️ Total Weight: ${totalWeightKg.toFixed(1)} kg
🔪 Prep Style: ${cutName}
⏱️ Ready Time: ${selectedPickup}
🧾 GST Invoice: ${requestInvoice ? 'Yes, please' : 'Not required'}
👤 Name: ${customerName}
📞 Phone: ${customerPhone}
💵 Estimated Total: ~₹${totalAmount} (Final weight confirmed live)
━━━━━━━━━━━━━━━━━
Please confirm availability!`;

    const whatsappUrl = `https://wa.me/${siteData.whatsapp}?text=${encodeURIComponent(message)}`;

    setOrderConfirmed({
      code: orderCode,
      message: "Opening WhatsApp with your order list. Send the message to confirm today's rate and pickup time.",
    });
    setCartItems([]);
    setAriaAnnouncement(`Order #${orderCode} created. Redirecting to WhatsApp.`);

    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 800);
  };

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen-dvh bg-[#FAF7F2]">
        <EarningsDashboard
          onBackToShop={() => navigateTo('/')}
          onSignOut={() => navigateTo('/')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen-dvh flex flex-col bg-[#FAF7F2] text-[#111314] overflow-x-hidden">
      {/* Screen Reader Live Region */}
      <div className="visually-hidden" aria-live="polite" role="status">
        {ariaAnnouncement}
      </div>

      {/* Sticky Navbar: Brand Name, 3 Links, Delivery Area Indicator, Single Cart Trigger Button */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#d8cab6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Name & Logo */}
          <a href="#" className="flex items-center gap-3 min-w-0">
            <img
              src={logoUrl}
              alt="Bikash Chicken Point Logo"
              className="w-10 h-10 rounded-full object-cover border border-[#d8cab6] flex-shrink-0"
              width="40"
              height="40"
              fetchPriority="high"
            />
            <div className="min-w-0">
              <span className="font-display font-bold text-base sm:text-lg tracking-tight text-[#6c2b11] block truncate">
                {siteData.shopName}
              </span>
              <span className="text-xs text-[#7c4226] flex items-center gap-1 sm:hidden">
                <MapPin className="w-3 h-3 text-[#a84222] flex-shrink-0" />
                <span className="truncate">{siteData.deliveryArea}</span>
              </span>
            </div>
          </a>

          {/* 3 Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#7c4226]"
          >
            <a href="#cuts" className="hover:text-[#111314] transition-colors">
              Cuts
            </a>
            <a href="#standards" className="hover:text-[#111314] transition-colors">
              Our Standards
            </a>
            <a href="#visit-us" className="hover:text-[#111314] transition-colors">
              Visit Us
            </a>
          </nav>

          {/* Delivery Area Indicator & Single Cart Trigger Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5ebd6] border border-[#d8cab6] text-xs font-medium text-[#6c2b11]">
              <MapPin className="w-3.5 h-3.5 text-[#a84222] flex-shrink-0" />
              <span>{siteData.deliveryArea}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setOrderConfirmed(null);
                setIsCartOpen(true);
              }}
              aria-label={`Open cart with ${cartItemCount} items`}
              className="press-scale hover-lift inline-flex items-center gap-2 px-4 min-h-[42px] rounded-[var(--radius-control)] bg-[#a84222] hover:bg-[#6c2b11] text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40"
            >
              <ShoppingBag className="w-4 h-4 flex-shrink-0" />
              <span>Cart</span>
              <span
                data-bumping={isCartBumping ? 'true' : 'false'}
                className="cart-badge-bump inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-[#FAF7F2] text-[#6c2b11] font-mono text-xs font-bold tabular-nums"
              >
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* BAND 1: Split Hero */}
        <section className="py-16 md:py-24 border-b border-[#d8cab6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Bold Headline, 2-Sentence Subheadline, 1 Primary CTA, 3 Subtle Trust Badges */}
              <div className="lg:col-span-6 space-y-6">
                <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-[#111314]">
                  {siteData.hero.title}
                </h1>

                <p className="text-base md:text-lg text-[#7c4226] leading-relaxed">
                  {siteData.hero.subtitle}
                </p>

                <div className="pt-1">
                  <a
                    href="#cuts"
                    className="press-scale hover-lift inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[50px] rounded-[var(--radius-control)] bg-[#a84222] hover:bg-[#6c2b11] text-white font-semibold text-base shadow-xs"
                  >
                    <span>Browse Fresh Cuts</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* 3 Subtle Trust Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-medium text-[#6c2b11]">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#d8cab6]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
                    <span>Fresh Morning Batch</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#d8cab6]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#a84222] flex-shrink-0" />
                    <span>100% Hygienic Dressing</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#d8cab6]">
                    <Scale className="w-3.5 h-3.5 text-[#7c4226] flex-shrink-0" />
                    <span>Never Pre-Frozen</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Visual-First 4:3 Counter Showcase */}
              <div className="lg:col-span-6">
                <Card padding={0} className="overflow-hidden">
                  <AspectRatio ratio={4 / 3}>
                    <div className="w-full h-full bg-gradient-to-br from-[#FAF7F2] via-[#f5ebd6]/75 to-[#ebd3a2]/45 p-5 sm:p-7 flex flex-col justify-between relative">
                      {/* Top Status Row with Live @astryxdesign/core StatusDot */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#d8cab6]">
                          <StatusDot
                            variant={isCounterOpenNow ? 'success' : 'warning'}
                            label={isCounterOpenNow ? 'Counter Open' : 'Opens 8 AM'}
                            isPulsing={isCounterOpenNow}
                          />
                          <span className="text-xs font-semibold text-[#111314]">
                            {isCounterOpenNow ? 'Counter Open · 8 AM – 9 PM IST' : 'Daily · 8 AM – 9 PM IST'}
                          </span>
                        </div>

                        <span className="font-mono text-xs font-semibold text-[#6c2b11] px-2.5 py-1 rounded-full bg-[#ebd3a2]/75 border border-[#e0b81f]/60">
                          Fuljhore Market
                        </span>
                      </div>

                      {/* Center Visual Counter Emblem & Brand Identity */}
                      <div className="my-auto flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                          <img
                            src={logoUrl}
                            alt="Bikash Chicken Point Counter"
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-[#a84222] shadow-md bg-[#FFFFFF]"
                            width="112"
                            height="112"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <h2 className="font-display font-bold text-lg sm:text-xl text-[#111314]">
                            {siteData.shopName}
                          </h2>
                          <p className="font-bengali text-xs sm:text-sm font-medium text-[#6c2b11]">
                            {siteData.shopNameBengali} · ফুলঝোড় সবজি মার্কেট
                          </p>
                        </div>
                      </div>

                      {/* Bottom Visual Counter Flow Summary */}
                      <div className="px-3.5 py-2.5 rounded-[var(--radius-concentric-panel)] bg-[#FFFFFF]/90 border border-[#d8cab6] flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-[#111314]">
                          Pre-Book · We Cut Fresh · Pay at Scale
                        </span>
                        <span className="font-mono font-semibold text-[#15803D] flex-shrink-0">
                          Zero Advance
                        </span>
                      </div>
                    </div>
                  </AspectRatio>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* BAND 2: Trust & Hygiene Architectural Strip (Borderless 4-Column with 1px Ecru Divider Hairlines) */}
        <section className="py-12 md:py-16 border-b border-[#d8cab6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Sun,
                  title: 'Fresh Morning Stock',
                  proof: 'Brought in daily at 7 AM',
                  accent: 'text-[#6c2b11] bg-[#ebd3a2]/60 border border-[#e0b81f]/50',
                },
                {
                  icon: ShieldCheck,
                  title: 'Cut After You Order',
                  proof: 'Zero freezer trays',
                  accent: 'text-[#a84222] bg-[#f5ebd6] border border-[#d8cab6]',
                },
                {
                  icon: Utensils,
                  title: 'Cut for Your Dish',
                  proof: 'Curry, biryani, or fry',
                  accent: 'text-[#a84222] bg-[#f5ebd6] border border-[#d8cab6]',
                },
                {
                  icon: Truck,
                  title: 'Skip the Counter Wait',
                  proof: 'Pre-book on WhatsApp',
                  accent: 'text-[#6c2b11] bg-[#ebd3a2]/60 border border-[#e0b81f]/50',
                },
              ].map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="flex flex-col sm:flex-row items-stretch">
                    {idx > 0 && (
                      <>
                        <div className="sm:hidden">
                          <Divider orientation="horizontal" />
                        </div>
                        <div
                          className={`hidden ${
                            idx === 2 ? 'lg:flex' : 'sm:flex'
                          } items-stretch`}
                        >
                          <Divider orientation="vertical" />
                        </div>
                      </>
                    )}
                    <div
                      className={`flex-1 flex items-center gap-3.5 py-4 sm:py-3 ${
                        idx === 0
                          ? 'sm:pr-6'
                          : idx === 3
                            ? 'sm:pl-6 lg:pr-0'
                            : 'sm:px-6'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${pillar.accent}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-base font-semibold text-[#111314] leading-snug">
                          {pillar.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#7c4226] leading-snug mt-0.5">
                          {pillar.proof}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BAND 3: Product Catalog Section */}
        <section id="cuts" className="py-16 md:py-24 border-b border-[#d8cab6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Section Heading & Category TabList */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[#111314]">
                  Choose Your Fresh Cut
                </h2>
              </div>

              {/* @astryxdesign/core Category Filter TabList */}
              <div className="max-w-full overflow-hidden">
                <TabList
                  value={activeCategory}
                  onChange={(val) => setActiveCategory(val as ProductCategory)}
                  role="tablist"
                  overflow="scroll"
                  aria-label="Filter cuts by category"
                >
                  {productCategories.map((cat) => (
                    <Tab key={cat} value={cat} label={cat} />
                  ))}
                </TabList>
              </div>
            </div>

            {/* @astryxdesign/core Horizontal Snap-Paging Carousel */}
            <Carousel
              gap={3}
              hasButtons
              hasEdgeFade
              hasSnap={snapPaging}
              aria-label="Fresh chicken cuts"
            >
              {filteredProducts.map((product, index) => {
                const details =
                  siteData.menuDetails[product.id as keyof typeof siteData.menuDetails];
                const selectedWeightUnit: WeightUnit = cardWeights[product.id] ?? '1kg';
                const displayPrice =
                  selectedWeightUnit === '500g'
                    ? Math.round(product.price_per_kg * 0.5)
                    : product.price_per_kg;
                const isPriceSwapping = swappingWeightId === product.id;
                const isJustAdded = recentlyAddedId === product.id;

                return (
                  <Card
                    key={`${activeCategory}-${product.id}`}
                    padding={0}
                    style={{ animationDelay: `${Math.min(index * 35, 180)}ms` }}
                    className="w-[280px] sm:w-[320px] flex-shrink-0 animate-card-enter overflow-hidden flex flex-col justify-between"
                  >
                    {/* 1. Visual Header (<AspectRatio ratio={4 / 3} fit="cover">) */}
                    <div className="border-b border-[#d8cab6]">
                      <AspectRatio ratio={4 / 3} fit="cover">
                        <div className="relative w-full h-full">
                          {renderCutPlateArt(product.id)}
                          {details?.badge && (
                            <div className="absolute top-3 right-3 z-10">
                              <AstryxBadge variant="warning" label={details.badge} />
                            </div>
                          )}
                        </div>
                      </AspectRatio>
                    </div>

                    <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        {/* 2. Single-Row Title: English + Bengali sub-label */}
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-display font-semibold text-base sm:text-lg text-[#111314] truncate">
                            {product.name}
                          </h3>
                          <span className="font-bengali text-xs font-semibold text-[#6c2b11] flex-shrink-0">
                            {product.name_bengali}
                          </span>
                        </div>

                        {/* 3. 3-Word Spec Line */}
                        <p className="text-xs font-medium text-[#7c4226] truncate">
                          {details?.spec ?? 'Skinless · Fresh Cut'}
                        </p>
                      </div>

                      {/* 4. Unified Bottom Action Row: SegmentedControl + Tabular Price + Add Button */}
                      <div className="pt-2.5 border-t border-[#d8cab6] flex items-center justify-between gap-2">
                        <SegmentedControl
                          value={selectedWeightUnit}
                          onChange={(val) => handleSelectCardWeight(product.id, val as WeightUnit)}
                          label={`Select weight for ${product.name}`}
                          size="sm"
                        >
                          <SegmentedControlItem value="500g" label="500g" />
                          <SegmentedControlItem value="1kg" label="1kg" />
                        </SegmentedControl>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            data-swapping={isPriceSwapping ? 'true' : 'false'}
                            className="price-swap text-base sm:text-lg font-bold font-mono text-[#111314] tabular-nums"
                          >
                            ₹{displayPrice}
                          </span>

                          <Button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            variant="primary"
                            tone={isJustAdded ? 'whatsapp' : 'crimson'}
                            size="sm"
                            className="px-3 min-h-[34px]"
                          >
                            {isJustAdded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </Carousel>
          </div>
        </section>

        {/* BAND 4: Shop Story / Quality Split Section */}
        <section id="standards" className="py-16 md:py-24 border-b border-[#d8cab6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: 4:3 Tabbed Card (Counter Process | Scan & Pay QR) */}
              <div className="lg:col-span-6">
                <Card padding={0} className="overflow-hidden">
                  <AspectRatio ratio={4 / 3}>
                    <div className="w-full h-full bg-[#FFFFFF] p-4 sm:p-6 flex flex-col justify-between">
                      {/* Header with @astryxdesign/core TabList */}
                      <div className="flex items-center justify-between gap-3 border-b border-[#d8cab6] pb-3">
                        <TabList
                          value={standardsTab}
                          onChange={(val) => setStandardsTab(val as 'process' | 'qr')}
                          role="tablist"
                          size="sm"
                          aria-label="Counter process and QR standees"
                        >
                          <Tab value="process" label="Counter Process" />
                          <Tab value="qr" label="Scan & Pay QR" />
                        </TabList>

                        <span className="hidden sm:inline-block text-[11px] font-mono text-[#7c4226] truncate">
                          {siteData.udyamRegistrationNumber}
                        </span>
                      </div>

                      {/* Tab Panel Content */}
                      {standardsTab === 'process' ? (
                        <div className="my-auto grid grid-cols-2 gap-3 py-2">
                          <div className="p-3.5 sm:p-4 rounded-[var(--radius-concentric-panel)] bg-[#FAF7F2] border border-[#d8cab6] space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[#15803D] font-semibold text-xs sm:text-sm">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                              <span>Fresh to Order</span>
                            </div>
                            <p className="text-xs text-[#111314] leading-relaxed">
                              Cleaned and cut after your order arrives. Zero freezer burn.
                            </p>
                          </div>

                          <div className="p-3.5 sm:p-4 rounded-[var(--radius-concentric-panel)] bg-[#FAF7F2] border border-[#d8cab6] space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[#a84222] font-semibold text-xs sm:text-sm">
                              <Flame className="w-4 h-4 flex-shrink-0" />
                              <span>Never Frozen</span>
                            </div>
                            <p className="text-xs text-[#7c4226] leading-relaxed">
                              No cold-storage trays or overnight pre-cut stock.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="my-auto grid grid-cols-2 gap-3 py-2">
                          <button
                            type="button"
                            onClick={() => setActiveQrPreview('upi')}
                            className="press-scale hover-lift p-3 rounded-[var(--radius-concentric-panel)] bg-[#FAF7F2] hover:bg-[#f5ebd6]/75 border border-[#d8cab6] hover:border-[#c2ae93] flex flex-col items-center text-center gap-2 cursor-pointer"
                          >
                            <img
                              src={qrUpiUrl}
                              alt="Google Pay / BHIM UPI QR Standee"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--radius-concentric-control)] object-cover border border-[#d8cab6] bg-[#FFFFFF] p-1"
                              width="80"
                              height="80"
                              loading="lazy"
                            />
                            <div className="min-w-0 w-full">
                              <span className="text-xs font-semibold text-[#111314] block truncate">
                                Google Pay / UPI
                              </span>
                              <span className="text-[11px] font-mono text-[#7c4226] block truncate">
                                {siteData.upiId}
                              </span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveQrPreview('google')}
                            className="press-scale hover-lift p-3 rounded-[var(--radius-concentric-panel)] bg-[#FAF7F2] hover:bg-[#f5ebd6]/75 border border-[#d8cab6] hover:border-[#c2ae93] flex flex-col items-center text-center gap-2 cursor-pointer"
                          >
                            <img
                              src={qrGoogleUrl}
                              alt="Google Business Profile Review QR Standee"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--radius-concentric-control)] object-cover border border-[#d8cab6] bg-[#FFFFFF] p-1"
                              width="80"
                              height="80"
                              loading="lazy"
                            />
                            <div className="min-w-0 w-full">
                              <span className="text-xs font-semibold text-[#111314] block truncate">
                                Google Review QR
                              </span>
                              <span className="text-[11px] text-[#a84222] font-medium inline-flex items-center justify-center gap-1">
                                <QrCode className="w-3 h-3 flex-shrink-0" />
                                <span>Tap to Enlarge</span>
                              </span>
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Footer Verification Bar */}
                      <div className="pt-2.5 border-t border-[#d8cab6] flex items-center justify-between text-xs text-[#7c4226]">
                        <span>Verified Merchant · Sabji Market, Fuljhore</span>
                        <button
                          type="button"
                          onClick={() =>
                            setStandardsTab(standardsTab === 'process' ? 'qr' : 'process')
                          }
                          className="font-semibold text-[#a84222] hover:text-[#6c2b11] cursor-pointer"
                        >
                          {standardsTab === 'process' ? 'View Counter QRs →' : '← View Process'}
                        </button>
                      </div>
                    </div>
                  </AspectRatio>
                </Card>
              </div>

              {/* Right Column: Concise 1 Heading + 2 Short Sentences */}
              <div className="lg:col-span-6 space-y-5">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[#111314]">
                  Cut fresh after you order, never kept in a freezer.
                </h2>

                <p className="text-base text-[#7c4226] leading-relaxed">
                  We clean and cut your chicken only after you book or walk in at Fuljhore Sabji Market, never from pre-cut cold-storage trays. Every pack is weighed on the counter scale in front of you before you pay by UPI or cash.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    'Cut fresh after you order',
                    'Cleaned and membrane-trimmed',
                    'Weighed on the counter scale',
                    'Pay by GPay, PhonePe, or cash after weighing',
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-2.5 text-sm text-[#111314]">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setOrderConfirmed(null);
                      setIsCartOpen(true);
                    }}
                    variant="secondary"
                    size="md"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#a84222]" />
                    <span>Review Your Order Cart ({cartItemCount})</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAND 5: Bulk / Party Order Banner */}
        <section id="visit-us" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Surface variant="paper" padding="lg" className="p-8 md:p-12 bg-gradient-to-br from-[#FFFFFF] to-[#f5ebd6]/45">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl">
                  <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[#111314]">
                    {siteData.b2b.title}
                  </h2>
                  <p className="text-sm md:text-base text-[#7c4226] leading-relaxed">
                    {siteData.b2b.body}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                  <a
                    href={`tel:${siteData.phone}`}
                    className="press-scale hover-lift inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-[var(--radius-control)] bg-[#FFFFFF] border border-[#d8cab6] hover:bg-[#f5ebd6]/70 hover:border-[#c2ae93] text-sm font-semibold text-[#111314]"
                  >
                    <Phone className="w-4 h-4 text-[#a84222]" />
                    <span>Call {siteData.phone}</span>
                  </a>

                  <a
                    href={`https://wa.me/${siteData.whatsapp}?text=Hello%20Bikash%20Da,%20I%20want%20to%20enquire%20about%20a%20bulk/party%20chicken%20order.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press-scale hover-lift inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-[var(--radius-control)] bg-[#a84222] hover:bg-[#6c2b11] text-white text-sm font-semibold shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Bulk Inquiry</span>
                  </a>
                </div>
              </div>
            </Surface>
          </div>
        </section>
      </main>

      {/* BAND 6: Clean 3-Column Footer */}
      <footer className="mt-auto bg-[#f5ebd6]/45 border-t border-[#d8cab6] py-12 text-sm text-[#7c4226]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Shop Address & Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoUrl}
                  alt="Bikash Chicken Point"
                  className="w-8 h-8 rounded-full object-cover border border-[#d8cab6]"
                  width="32"
                  height="32"
                />
                <span className="font-display font-bold text-base text-[#6c2b11]">
                  {siteData.shopName}
                </span>
              </div>
              <p className="text-sm text-[#7c4226] leading-relaxed">
                {siteData.address}
              </p>
              <p className="text-xs font-mono text-[#7c4226]">
                Udyam MSME: {siteData.udyamRegistrationNumber}
              </p>
            </div>

            {/* Column 2: Opening Hours & Contact */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#111314] block">
                Shop Hours & Contact
              </span>
              <div className="space-y-1.5 text-sm text-[#7c4226]">
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#a84222] flex-shrink-0" />
                  <span>{siteData.timing}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#a84222] flex-shrink-0" />
                  <a href={`tel:${siteData.phone}`} className="hover:text-[#111314] transition-colors">
                    {siteData.phone}
                  </a>
                </p>
                <p className="text-xs text-[#7c4226]">
                  UPI ID: <code className="font-mono text-[#111314]">{siteData.upiId}</code>
                </p>
              </div>
            </div>

            {/* Column 3: Quick Links */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#111314] block">
                Quick Links
              </span>
              <ul className="space-y-2 text-sm text-[#7c4226]">
                <li>
                  <a href="#cuts" className="hover:text-[#111314] transition-colors">
                    Fresh Cuts Catalog
                  </a>
                </li>
                <li>
                  <a href="#standards" className="hover:text-[#111314] transition-colors">
                    Our Hygiene Standards
                  </a>
                </li>
                <li>
                  <a href="#visit-us" className="hover:text-[#111314] transition-colors">
                    Bulk & Party Orders
                  </a>
                </li>
                <li>
                  <a
                    href={siteData.googleProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#111314] transition-colors"
                  >
                    Google Maps & Reviews
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#d8cab6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7c4226]">
            <p>© {new Date().getFullYear()} {siteData.shopName}. All rights reserved.</p>
            <p className="font-bengali text-[#6c2b11]">{siteData.shopNameBengali} · ফুলঝোড় সবজি মার্কেট, দুর্গাপুর</p>
          </div>
        </div>
      </footer>

      {/* Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        selectedCut={selectedCut}
        onSelectCut={setSelectedCut}
        selectedPickup={selectedPickup}
        onSelectPickup={setSelectedPickup}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        customerPhone={customerPhone}
        onCustomerPhoneChange={setCustomerPhone}
        requestInvoice={requestInvoice}
        onRequestInvoiceChange={setRequestInvoice}
        onSubmitOrder={handleSubmitOrder}
        orderConfirmed={orderConfirmed}
      />

      {/* Full-Clarity Counter QR ModalSheet (Google Pay / BHIM UPI & Google Business Profile) */}
      <ModalSheet
        isOpen={activeQrPreview !== null}
        onClose={() => setActiveQrPreview(null)}
        title={
          activeQrPreview === 'upi'
            ? 'Google Pay / BHIM UPI Counter QR'
            : 'Google Business Profile & Review QR'
        }
        subtitle={
          activeQrPreview === 'upi'
            ? `Pay only after we confirm your final scale weight at the counter · UPI ID: ${siteData.upiId}`
            : 'Scan to rate Bikash Chicken Shop on Google or open in Google Maps'
        }
      >
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-[var(--radius-concentric-panel)] bg-[#FAF7F2] border border-[#d8cab6] inline-block mx-auto">
            <img
              src={activeQrPreview === 'upi' ? qrUpiUrl : qrGoogleUrl}
              alt={
                activeQrPreview === 'upi'
                  ? 'Google Pay / BHIM UPI Counter Payment QR Standee'
                  : 'Bikash Chicken Shop Google Review QR'
              }
              className="w-64 sm:w-72 h-auto rounded-[var(--radius-concentric-control)] object-contain mx-auto bg-[#FFFFFF] p-2 border border-[#d8cab6]"
            />
          </div>

          {activeQrPreview === 'upi' ? (
            <p className="text-xs text-[#7c4226] max-w-sm mx-auto leading-relaxed">
              Verified Merchant: <strong className="text-[#111314]">Bikash Chicken Shop</strong> (
              <code className="font-mono text-[#6c2b11]">{siteData.upiId}</code> · {siteData.phone}). Works with GPay, PhonePe, Paytm, and BHIM UPI.
            </p>
          ) : (
            <div className="pt-1">
              <a
                href={siteData.googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="press-scale hover-lift inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-control)] bg-[#FFFFFF] border border-[#d8cab6] hover:bg-[#f5ebd6]/70 text-xs font-semibold text-[#111314]"
              >
                <span>Open Google Business Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#a84222]" />
              </a>
            </div>
          )}
        </div>
      </ModalSheet>
    </div>
  );
}
