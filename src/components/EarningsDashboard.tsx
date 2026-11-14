import { useState, useMemo, useRef, ChangeEvent, DragEvent } from 'react';
import {
  ChevronRight,
  Copy,
  Crown,
  Flame,
  QrCode,
  Search,
  Share2,
  Star,
  Upload,
  UserCheck,
  Users,
  Wallet,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import {
  BestCustomer,
  PhonePeUpiPayment,
  WeeklyRecapMetrics,
  fallbackShopPayments,
} from '../lib/supabase';
import { parsePhonePeCsv, ParseResult } from '../lib/phonepeCsvParser';
import { Card, Divider, Tab, TabList, useToast } from '@astryxdesign/core';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { Badge } from './ui/Badge';
import { FieldInput } from './ui/Field';
import { ModalSheet } from './ui/ModalSheet';

interface EarningsDashboardProps {
  onBackToShop: () => void;
  onSignOut: () => void;
  onSwitchTab?: (tab: 'dashboard' | 'rates' | 'bookings') => void;
  activeTab?: 'dashboard' | 'rates' | 'bookings';
}

export function EarningsDashboard({
  onBackToShop,
  onSignOut,
  onSwitchTab,
  activeTab = 'dashboard',
}: EarningsDashboardProps) {
  const toast = useToast();
  const [payments, setPayments] = useState<PhonePeUpiPayment[]>(fallbackShopPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'VIP' | 'FREQUENT' | 'HIGH_SPEND'>('ALL');
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<BestCustomer | null>(null);

  // CSV Upload modal & state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [parsedCsvResult, setParsedCsvResult] = useState<ParseResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive Best Customers Leaderboard from all payments
  const bestCustomers = useMemo(() => {
    const customerMap: Record<string, BestCustomer> = {};

    payments
      .filter((p) => p.status === 'COMPLETED')
      .forEach((p) => {
        const id = p.payer_vpa || p.payer_phone || 'Walk-in UPI Customer';
        if (!customerMap[id]) {
          customerMap[id] = {
            customer_identifier: id,
            customer_name: p.payer_name || null,
            total_visits: 0,
            total_lifetime_spend: 0,
            average_order_value: 0,
            first_visit_date: p.paid_at,
            last_visit_date: p.paid_at,
            days_since_last_visit: 0,
            loyalty_tier: '🌱 Occasional',
            favorite_cuts: [],
            recent_payments: [],
          };
        }

        const cust = customerMap[id];
        cust.total_visits += 1;
        cust.total_lifetime_spend += p.amount_rupees;
        cust.recent_payments?.push(p);

        if (new Date(p.paid_at) < new Date(cust.first_visit_date)) {
          cust.first_visit_date = p.paid_at;
        }
        if (new Date(p.paid_at) > new Date(cust.last_visit_date)) {
          cust.last_visit_date = p.paid_at;
        }

        if (p.notes && !cust.favorite_cuts?.includes(p.notes)) {
          cust.favorite_cuts?.push(p.notes);
        }
      });

    return Object.values(customerMap)
      .map((c) => {
        const avg = Math.round(c.total_lifetime_spend / c.total_visits);
        const diffDays = Math.floor(
          (Date.now() - new Date(c.last_visit_date).getTime()) / (1000 * 3600 * 24),
        );
        let tier: BestCustomer['loyalty_tier'] = '🌱 Occasional';
        if (c.total_visits >= 3 || c.total_lifetime_spend >= 1500) {
          tier = '👑 VIP Regular';
        } else if (c.total_visits >= 2 || c.total_lifetime_spend >= 600) {
          tier = '⭐ Frequent';
        }

        return {
          ...c,
          average_order_value: avg,
          days_since_last_visit: diffDays,
          loyalty_tier: tier,
        };
      })
      .sort((a, b) => b.total_lifetime_spend - a.total_lifetime_spend);
  }, [payments]);

  // Filtered Best Customers based on tab selection
  const filteredCustomers = useMemo(() => {
    return bestCustomers.filter((c) => {
      if (customerFilter === 'VIP') return c.loyalty_tier === '👑 VIP Regular';
      if (customerFilter === 'FREQUENT') return c.loyalty_tier === '⭐ Frequent' || c.loyalty_tier === '👑 VIP Regular';
      if (customerFilter === 'HIGH_SPEND') return c.average_order_value >= 500;
      return true;
    });
  }, [bestCustomers, customerFilter]);

  // Weekly & Sunday recap metrics
  const recapMetrics: WeeklyRecapMetrics = useMemo(() => {
    const completed = payments.filter((p) => p.status === 'COMPLETED');
    const totalRev = completed.reduce((sum, p) => sum + p.amount_rupees, 0);
    const sundayCompleted = completed.filter(
      (p) => new Date(p.paid_at).getDay() === 0, // 0 = Sunday
    );
    const sundayRev = sundayCompleted.reduce((sum, p) => sum + p.amount_rupees, 0);
    const repeatCount = bestCustomers.filter((c) => c.total_visits > 1).length;
    const repeatRate =
      bestCustomers.length > 0 ? Math.round((repeatCount / bestCustomers.length) * 100) : 0;

    return {
      total_revenue: totalRev,
      total_orders: completed.length,
      weekly_aov: completed.length > 0 ? Math.round(totalRev / completed.length) : 0,
      sunday_revenue: sundayRev,
      sunday_orders: sundayCompleted.length,
      unique_customers: bestCustomers.length,
      repeat_customer_rate: repeatRate,
    };
  }, [payments, bestCustomers]);

  // Filtered payments by search query (UTR, VPA, Customer Name)
  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return payments;

    return payments.filter(
      (p) =>
        p.provider_reference_id.toLowerCase().includes(q) ||
        (p.payer_vpa && p.payer_vpa.toLowerCase().includes(q)) ||
        (p.payer_name && p.payer_name.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q)),
    );
  }, [payments, searchQuery]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    toast({ body: `Bank UTR copied: ${text}` });
    setTimeout(() => setCopiedUtr(null), 2000);
  }

  // Handle CSV file selection or drop
  function handleFileRead(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const parsed = parsePhonePeCsv(text);
      setParsedCsvResult(parsed);
    };
    reader.readAsText(file);
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileRead(file);
  }

  function confirmImport() {
    if (!parsedCsvResult || parsedCsvResult.transactions.length === 0) return;

    // Deduplicate against existing payments using provider_reference_id (Bank UTR)
    const existingUtrs = new Set(payments.map((p) => p.provider_reference_id));
    const newItems: PhonePeUpiPayment[] = [];

    parsedCsvResult.transactions.forEach((item) => {
      if (!existingUtrs.has(item.provider_reference_id)) {
        newItems.push({
          id: `csv-${item.provider_reference_id}`,
          provider_reference_id: item.provider_reference_id,
          merchant_transaction_id: item.merchant_transaction_id,
          phonepe_transaction_id: item.phonepe_transaction_id,
          amount_paise: item.amount_paise,
          amount_rupees: item.amount_rupees,
          payment_mode: 'UPI',
          status: item.status,
          payer_vpa: item.payer_vpa,
          payer_name: item.payer_name,
          paid_at: item.paid_at,
        });
        existingUtrs.add(item.provider_reference_id);
      }
    });

    setPayments((prev) => [...newItems, ...prev]);
    setIsUploadModalOpen(false);
    setParsedCsvResult(null);
    toast({
      body: `Imported ${newItems.length} new PhonePe UPI transactions (${parsedCsvResult.transactions.length - newItems.length} duplicates skipped)`,
    });
  }

  function shareWhatsAppRecap() {
    const top3 = bestCustomers.slice(0, 3);
    const topList = top3
      .map(
        (c, idx) =>
          `${idx + 1}. ${c.customer_name || c.customer_identifier}: ₹${c.total_lifetime_spend.toLocaleString('en-IN')} (${c.total_visits} orders)`,
      )
      .join('\n');

    const summaryText =
      `*Bikash Chicken Point - PhonePe Weekly Recap*\n` +
      `📅 Report Date: ${new Date().toLocaleDateString('en-IN')}\n\n` +
      `💰 *Total PhonePe UPI Collected:* ₹${recapMetrics.total_revenue.toLocaleString('en-IN')}\n` +
      `🛍️ *Total Orders:* ${recapMetrics.total_orders}\n` +
      `👥 *Regular Customer Rate:* ${recapMetrics.repeat_customer_rate}%\n` +
      `☀️ *Sunday Peak Rush Volume:* ₹${recapMetrics.sunday_revenue.toLocaleString('en-IN')} (${recapMetrics.sunday_orders} orders)\n` +
      `📊 *Average Order:* ₹${recapMetrics.weekly_aov}\n\n` +
      `👑 *Top 3 Regular Buyers (সেরা খরিদ্দার):*\n${topList}\n\n` +
      `🏦 *Bank Status:* PhonePe auto-deposits direct to registered Bank A/C.\n` +
      `_Generated for Bikash Chicken Point_`;

    const url = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="min-h-screen-dvh flex flex-col bg-[#FAF7F2] text-[#111314] overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#d8cab6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-lg sm:text-xl text-[#6c2b11] tracking-tight">
                Bikash Chicken Point
              </h1>
              <span className="font-bengali text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-chip)] bg-[#f5ebd6] border border-[#d8cab6] text-[#6c2b11]">
                বিকাশ চিকেন পয়েন্ট
              </span>
              <Badge
                tone="ocher"
                icon={<QrCode className="w-3.5 h-3.5" />}
                label="PhonePe Ledger"
              />
            </div>
            <p className="text-xs text-[#7c4226] mt-1">
              Counter Recap & Customer Ledger · Fuljhore Sabji Market, Durgapur
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="primary"
              tone="crimson"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              title="Upload downloaded statement CSV from PhonePe Business portal"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              tone="whatsapp"
              size="sm"
              onClick={shareWhatsAppRecap}
              title="Send formatted weekly summary via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Recap</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onBackToShop}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Shop</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Dashboard sections"
          className="max-w-6xl mx-auto px-4 sm:px-6 border-t border-[#d8cab6]/80"
        >
          <TabList
            aria-label="Admin views"
            overflow="scroll"
            value={activeTab}
            onChange={(val) => {
              if (val === 'dashboard' || val === 'rates' || val === 'bookings') {
                onSwitchTab?.(val);
              }
            }}
          >
            <Tab value="dashboard" label="Recap & Best Customers" />
            {onSwitchTab && (
              <>
                <Tab value="rates" label="Counter Rates" />
                <Tab value="bookings" label="Pending Orders" />
              </>
            )}
          </TabList>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 min-w-0">
        {/* Executive KPI Architectural Strip */}
        <section aria-label="Key metrics" className="min-w-0">
          <Card padding={0} elevation="low" className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#d8cab6] bg-[#FFFFFF]">
              {/* KPI 1: Total UPI Revenue */}
              <div className="p-4 sm:p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm text-[#111314]">
                    Total UPI Sales · মোট বিক্রি
                  </span>
                  <QrCode className="w-4 h-4 text-[#a84222] flex-shrink-0" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#6c2b11] tabular-nums">
                  ₹{recapMetrics.total_revenue.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-[#7c4226] pt-2 border-t border-[#d8cab6]/70">
                  <span className="tabular-nums">{recapMetrics.total_orders} verified payments</span>
                  <Badge tone="whatsapp" label="Direct Bank" />
                </div>
              </div>

              {/* KPI 2: Regular Customer Retention */}
              <div className="p-4 sm:p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm text-[#111314]">
                    Repeat Buyers · নিয়মিত হার
                  </span>
                  <Users className="w-4 h-4 text-[#6c2b11] flex-shrink-0" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#111314] tabular-nums">
                  {recapMetrics.repeat_customer_rate}%
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-[#7c4226] pt-2 border-t border-[#d8cab6]/70">
                  <span className="tabular-nums">
                    {bestCustomers.filter((c) => c.total_visits > 1).length} repeat buyers
                  </span>
                  <Badge tone="ocher" label="Weekly Retention" />
                </div>
              </div>

              {/* KPI 3: Sunday Peak Rush */}
              <div className="p-4 sm:p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm text-[#111314]">
                    Sunday Rush · রবিবারের বিক্রি
                  </span>
                  <Flame className="w-4 h-4 text-[#a84222] flex-shrink-0" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#6c2b11] tabular-nums">
                  ₹{recapMetrics.sunday_revenue.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-[#7c4226] pt-2 border-t border-[#d8cab6]/70">
                  <span className="tabular-nums">{recapMetrics.sunday_orders} Sunday orders</span>
                  <Badge tone="crimson" label="Peak Day" />
                </div>
              </div>

              {/* KPI 4: Avg Order Ticket */}
              <div className="p-4 sm:p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm text-[#111314]">
                    Avg Ticket · গড় কেনাকাটা
                  </span>
                  <Wallet className="w-4 h-4 text-[#7c4226] flex-shrink-0" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#111314] tabular-nums">
                  ₹{recapMetrics.weekly_aov.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-[#7c4226] pt-2 border-t border-[#d8cab6]/70">
                  <span>Per counter sale</span>
                  <Badge tone="neutral" label="~1.5–2 kg" className="font-mono tabular-nums" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SECTION 1: Best Customers Leaderboard (সেরা খরিদ্দার তালিকা) */}
        <section className="min-w-0">
          <Card padding={0} elevation="low" className="overflow-hidden">
            <div className="p-4 sm:p-6 space-y-5 bg-[#FFFFFF]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-lg sm:text-xl text-[#111314] tracking-tight">
                    Best Customers · সেরা খরিদ্দার তালিকা
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7c4226] mt-0.5">
                    Ranked by lifetime PhonePe UPI spend. Tap any buyer to inspect order history.
                  </p>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Chip
                    active={customerFilter === 'ALL'}
                    onClick={() => setCustomerFilter('ALL')}
                  >
                    All ({bestCustomers.length})
                  </Chip>
                  <Chip
                    active={customerFilter === 'VIP'}
                    tone="gold"
                    icon={<Crown className="w-3.5 h-3.5" />}
                    onClick={() => setCustomerFilter('VIP')}
                  >
                    VIP Regulars
                  </Chip>
                  <Chip
                    active={customerFilter === 'FREQUENT'}
                    icon={<Star className="w-3.5 h-3.5" />}
                    onClick={() => setCustomerFilter('FREQUENT')}
                  >
                    Frequent
                  </Chip>
                  <Chip
                    active={customerFilter === 'HIGH_SPEND'}
                    onClick={() => setCustomerFilter('HIGH_SPEND')}
                  >
                    ₹500+ Avg
                  </Chip>
                </div>
              </div>

              <Divider />

              {/* Customer Cards Grid (Flat single-level cards, zero nested boxes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((cust, index) => {
                  const isVip = cust.loyalty_tier.includes('VIP');
                  return (
                    <button
                      key={cust.customer_identifier}
                      type="button"
                      onClick={() => setSelectedCustomer(cust)}
                      className={`w-full min-w-0 text-left p-4 rounded-[var(--radius-control)] border transition-[transform,border-color,background-color,box-shadow] duration-180 ease-[var(--ease-out-expo)] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md active:scale-[0.985] cursor-pointer space-y-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40 ${
                        isVip
                          ? 'bg-[#f5ebd6]/65 border-[#e0b81f]/75'
                          : 'bg-[#FAF7F2] border-[#d8cab6]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-full font-display font-bold text-sm flex items-center justify-center flex-shrink-0 ${
                              isVip
                                ? 'bg-[#6c2b11] text-[#FAF7F2]'
                                : 'bg-[#a84222] text-[#FFFFFF]'
                            }`}
                          >
                            {cust.customer_name ? cust.customer_name.charAt(0) : 'U'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-sm text-[#111314] truncate">
                              {cust.customer_name || 'Regular Customer'}
                            </h3>
                            <span className="text-xs font-mono text-[#7c4226] truncate block">
                              {cust.customer_identifier}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono tabular-nums px-2 py-0.5 rounded-[var(--radius-concentric-control)] bg-[#FFFFFF] border border-[#d8cab6] text-[#6c2b11] flex-shrink-0">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 divide-x divide-[#d8cab6] pt-3 border-t border-[#d8cab6]/80 text-center">
                        <div className="px-1">
                          <span className="text-[11px] text-[#7c4226] block">Spent</span>
                          <span className="font-mono font-bold text-xs text-[#6c2b11] tabular-nums">
                            ₹{cust.total_lifetime_spend.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="px-1">
                          <span className="text-[11px] text-[#7c4226] block">Visits</span>
                          <span className="font-mono font-bold text-xs text-[#111314] tabular-nums">
                            {cust.total_visits}
                          </span>
                        </div>
                        <div className="px-1">
                          <span className="text-[11px] text-[#7c4226] block">Avg</span>
                          <span className="font-mono font-bold text-xs text-[#111314] tabular-nums">
                            ₹{cust.average_order_value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#7c4226] pt-1">
                        <span className="truncate">
                          Last: {cust.days_since_last_visit === 0 ? 'Today' : `${cust.days_since_last_visit}d ago`}
                        </span>
                        <span className="text-[#6c2b11] font-semibold inline-flex items-center gap-0.5 flex-shrink-0">
                          <span>History</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>

        {/* SECTION 2: PhonePe Statements Ledger */}
        <section className="min-w-0">
          <Card padding={0} elevation="low" className="overflow-hidden">
            <div className="p-4 sm:p-6 space-y-5 bg-[#FFFFFF]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-lg sm:text-xl text-[#111314] tracking-tight">
                    PhonePe UPI Ledger · পেমেন্ট হিস্ট্রি ও Bank UTR
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7c4226] mt-0.5 tabular-nums">
                    Showing {filteredPayments.length} of {payments.length} verified counter transactions.
                  </p>
                </div>

                <div className="w-full sm:w-72 flex-shrink-0">
                  <FieldInput
                    type="search"
                    label="Search transactions"
                    isLabelHidden
                    placeholder="Search Bank UTR, Customer..."
                    icon={<Search className="w-4 h-4" />}
                    value={searchQuery}
                    onChange={(val) => setSearchQuery(val)}
                  />
                </div>
              </div>

              {/* Mobile Stacked Ledger List (< 768px) — zero horizontal overflow */}
              <div className="md:hidden rounded-[var(--radius-control)] border border-[#d8cab6] divide-y divide-[#d8cab6]/80 bg-[#FFFFFF] overflow-hidden">
                {filteredPayments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#7c4226]">
                    No transactions match your search filter.
                  </div>
                ) : (
                  filteredPayments.map((p) => {
                    const isCopied = copiedUtr === p.provider_reference_id;
                    return (
                      <div key={p.provider_reference_id} className="p-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <strong className="text-sm font-semibold text-[#111314] block truncate">
                              {p.payer_name || 'Walk-in Customer'}
                            </strong>
                            {p.payer_vpa && (
                              <span className="font-mono text-xs text-[#7c4226] block truncate">
                                {p.payer_vpa}
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-sm text-[#15803D] tabular-nums flex-shrink-0">
                            +₹{p.amount_rupees.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs text-[#7c4226]">
                          <span className="truncate">{p.notes || 'UPI Counter Sale'}</span>
                          <span className="font-mono tabular-nums flex-shrink-0">
                            {new Date(p.paid_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}{' '}
                            ·{' '}
                            {new Date(p.paid_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 bg-[#FAF7F2] rounded-[var(--radius-concentric-control)] border border-[#d8cab6] max-w-full min-w-0">
                            <code className="font-mono font-medium text-xs text-[#111314] tabular-nums truncate">
                              {p.provider_reference_id}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(p.provider_reference_id)}
                              className="inline-flex items-center justify-center px-1.5 min-h-[28px] rounded-[var(--radius-concentric-control)] text-[#7c4226] hover:text-[#6c2b11] hover:bg-[#f5ebd6] transition-[transform,background-color,color] duration-150 ease-[var(--ease-out-expo)] active:scale-97 cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40"
                              title="Copy Bank UTR"
                              aria-label={`Copy Bank UTR ${p.provider_reference_id}`}
                            >
                              {isCopied ? (
                                <span className="text-[11px] font-semibold text-[#15803D]">Copied</span>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <Badge tone="whatsapp" label={p.status} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Ledger Table (>= 768px) */}
              <div className="hidden md:block overflow-x-auto rounded-[var(--radius-control)] border border-[#d8cab6]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#d8cab6] text-[#7c4226] font-semibold">
                    <tr>
                      <th className="p-3.5">Date & Time (তারিখ ও সময়)</th>
                      <th className="p-3.5">Customer / Payer VPA</th>
                      <th className="p-3.5">Bank UTR / Reference</th>
                      <th className="p-3.5">Cut Style / Note</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Amount (টাকা)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d8cab6]/70 bg-[#FFFFFF]">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-[#7c4226]">
                          No transactions match your search filter.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p) => {
                        const isCopied = copiedUtr === p.provider_reference_id;
                        return (
                          <tr
                            key={p.provider_reference_id}
                            className="hover:bg-[#FAF7F2]/70 transition-[background-color] duration-150 ease-[var(--ease-out-expo)]"
                          >
                            <td className="p-3.5 font-mono text-[#7c4226] whitespace-nowrap tabular-nums">
                              {new Date(p.paid_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                              })}{' '}
                              ·{' '}
                              {new Date(p.paid_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="p-3.5">
                              <strong className="text-[#111314] block">
                                {p.payer_name || 'Walk-in Customer'}
                              </strong>
                              {p.payer_vpa && (
                                <span className="font-mono text-xs text-[#7c4226] block">
                                  {p.payer_vpa}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <div className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 bg-[#FAF7F2] rounded-[var(--radius-concentric-control)] border border-[#d8cab6]">
                                <code className="font-mono font-medium text-xs text-[#111314] tabular-nums">
                                  {p.provider_reference_id}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(p.provider_reference_id)}
                                  className="inline-flex items-center justify-center px-1.5 min-w-[28px] min-h-[28px] rounded-[var(--radius-concentric-control)] text-[#7c4226] hover:text-[#6c2b11] hover:bg-[#f5ebd6] transition-[transform,background-color,color] duration-150 ease-[var(--ease-out-expo)] active:scale-97 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40"
                                  title="Copy Bank UTR"
                                  aria-label={`Copy Bank UTR ${p.provider_reference_id}`}
                                >
                                  {isCopied ? (
                                    <span className="text-[11px] font-semibold text-[#15803D]">
                                      Copied
                                    </span>
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5 text-[#7c4226]">{p.notes || 'UPI Counter Sale'}</td>
                            <td className="p-3.5">
                              <Badge tone="whatsapp" label={p.status} />
                            </td>
                            <td className="p-3.5 text-right font-mono font-bold text-sm text-[#15803D] tabular-nums">
                              +₹{p.amount_rupees.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* MODAL 1: PhonePe CSV Upload Dialog */}
      <ModalSheet
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setParsedCsvResult(null);
        }}
        title="Upload PhonePe Statement CSV"
        subtitle="Download daily/weekly statement from business.phonepe.com and drop here"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsUploadModalOpen(false);
                setParsedCsvResult(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              tone="crimson"
              size="sm"
              disabled={!parsedCsvResult?.success}
              onClick={confirmImport}
            >
              Confirm & Import Transactions
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#7c4226] leading-relaxed">
            Download your transaction statement from the{' '}
            <strong className="text-[#111314]">PhonePe for Business Portal</strong> or Business App, and drop the CSV file below.
          </p>

          {/* Drag & Drop Zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Browse or drag and drop PhonePe CSV file"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-[var(--radius-concentric-panel)] text-center cursor-pointer transition-[border-color,background-color] duration-150 ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40 ${
              isDragging
                ? 'border-[#6c2b11] bg-[#6c2b11]/5'
                : 'border-[#d8cab6] bg-[#FAF7F2] hover:bg-[#f5ebd6]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <Upload className="w-8 h-8 mx-auto text-[#6c2b11] mb-2" />
            <p className="text-xs font-bold text-[#111314]">
              Click to browse or drag & drop PhonePe CSV file
            </p>
            <span className="text-xs text-[#7c4226] mt-1 block">
              Supports standard PhonePe for Business CSV exports
            </span>
          </div>

          {/* Parsed Preview */}
          {parsedCsvResult && (
            <div className="pt-2">
              {parsedCsvResult.success ? (
                <div className="p-4 rounded-[var(--radius-control)] bg-[#15803D]/8 border border-[#15803D]/25 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="font-mono font-bold text-sm text-[#15803D] tabular-nums">
                        {parsedCsvResult.validCount}
                      </span>
                      <span className="text-xs text-[#15803D] block">Valid Rows</span>
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-[#15803D] tabular-nums">
                        ₹{parsedCsvResult.totalAmountRupees.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#15803D] block">Total Amount</span>
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-[#15803D] tabular-nums">
                        {parsedCsvResult.uniqueCustomersCount}
                      </span>
                      <span className="text-xs text-[#15803D] block">Customers</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#15803D] border-t border-[#15803D]/20 pt-2">
                    <strong>Auto-Deduplication:</strong> Transactions with existing Bank UTRs will be skipped safely without creating duplicate entries.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-[var(--radius-control)] bg-[#a84222]/10 border border-[#a84222]/30 text-xs text-[#6c2b11]">
                  {parsedCsvResult.error || 'Failed to parse file. Please verify it is a valid PhonePe CSV.'}
                </div>
              )}
            </div>
          )}
        </div>
      </ModalSheet>

      {/* MODAL 2: Customer Purchase History Dialog */}
      <ModalSheet
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.customer_name || 'Regular Customer'}
        subtitle={selectedCustomer?.customer_identifier}
        footer={
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCustomer(null)}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedCustomer && (
          <div className="space-y-4">
            {/* Customer Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 rounded-[var(--radius-control)] bg-[#FAF7F2] border border-[#d8cab6]">
              <div>
                <span className="text-xs text-[#7c4226] block">Total Spent</span>
                <span className="font-mono font-bold text-xs text-[#6c2b11] tabular-nums">
                  ₹{selectedCustomer.total_lifetime_spend.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#7c4226] block">Visits</span>
                <span className="font-mono font-bold text-xs text-[#111314] tabular-nums">
                  {selectedCustomer.total_visits} orders
                </span>
              </div>
              <div>
                <span className="text-xs text-[#7c4226] block">Average Order</span>
                <span className="font-mono font-bold text-xs text-[#111314] tabular-nums">
                  ₹{selectedCustomer.average_order_value}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#7c4226] block">Loyalty Tier</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6c2b11]">
                  {selectedCustomer.loyalty_tier.includes('VIP') ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-[#a84222]" />
                      <span>VIP Regular</span>
                    </>
                  ) : selectedCustomer.loyalty_tier.includes('Frequent') ? (
                    <>
                      <Star className="w-3.5 h-3.5 text-[#6c2b11]" />
                      <span>Frequent</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-[#7c4226]" />
                      <span>Occasional</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold text-sm text-[#111314] mb-2">
                Purchase History from PhonePe Statements
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedCustomer.recent_payments?.map((pay) => (
                  <div
                    key={pay.provider_reference_id}
                    className="p-3 rounded-[var(--radius-control)] border border-[#d8cab6]/80 bg-white flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <strong className="text-[#15803D] font-mono tabular-nums block">
                        +₹{pay.amount_rupees.toLocaleString('en-IN')}
                      </strong>
                      <span className="text-xs text-[#7c4226]">
                        {new Date(pay.paid_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {pay.notes && (
                        <span className="text-xs text-[#111314] block font-medium">
                          {pay.notes}
                        </span>
                      )}
                    </div>
                    <code className="text-xs font-mono text-[#7c4226] bg-[#FAF7F2] px-2 py-1 rounded-[var(--radius-concentric-control)] border border-[#d8cab6] tabular-nums flex-shrink-0">
                      UTR: {pay.provider_reference_id.slice(-6)}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ModalSheet>
    </div>
  );
}
