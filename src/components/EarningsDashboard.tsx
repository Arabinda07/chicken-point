import { useState, useMemo, useRef, ChangeEvent, DragEvent } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Crown,
  Download,
  FileSpreadsheet,
  Flame,
  HelpCircle,
  Layers,
  Phone,
  QrCode,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  Wallet,
  X,
  ArrowLeft,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import {
  BestCustomer,
  PhonePeUpiPayment,
  Settlement,
  WeeklyRecapMetrics,
  fallbackSettlements,
  fallbackShopPayments,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';
import { parsePhonePeCsv, ParseResult } from '../lib/phonepeCsvParser';
import {
  Card,
  Badge,
  Banner,
  Dialog,
  DialogHeader,
  TextInput,
  TabList,
  Tab,
  HStack,
  useToast,
} from '@astryxdesign/core';
import { Button } from './ui/Button';

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
  const [settlements] = useState<Settlement[]>(fallbackSettlements);
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
    <div className="min-h-screen-dvh flex flex-col bg-[#FAF7F2] text-[#231917]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6DEC8] transition-shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-extrabold text-lg sm:text-xl text-[#872B22]">
                Bikash Chicken Point
              </h1>
              <span className="font-bengali text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-chip)] bg-[#A83A2F]/10 text-[#A83A2F]">
                বিকাশ চিকেন পয়েন্ট
              </span>
              <Badge
                variant="purple"
                icon={<QrCode className="w-3.5 h-3.5" />}
                label="PhonePe Statements"
              />
            </div>
            <p className="text-xs text-[#665852] mt-0.5">
              Executive Recap & Customer Intelligence Hub · Fuljhore Sabji Market, Durgapur
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-control)] bg-[#872B22] text-white hover:bg-[#A83A2F] transition-all hover-lift active-press cursor-pointer shadow-xs"
              title="Upload downloaded statement CSV from PhonePe Business portal"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>

            <button
              type="button"
              onClick={shareWhatsAppRecap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-control)] bg-[#15803D] text-white hover:bg-[#166534] transition-all hover-lift active-press cursor-pointer shadow-xs"
              title="Send formatted weekly summary to Uncle via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Recap</span>
            </button>

            <button
              type="button"
              onClick={onBackToShop}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-chip)] bg-[#F3EFE6] hover:bg-[#E6DEC8] text-[#231917] transition-all hover-lift active-press cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shop</span>
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-chip)] text-[#665852] hover:text-[#872B22] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs using Meta Astryx TabList & Tab */}
        <div className="max-w-6xl mx-auto px-4 border-t border-[#E6DEC8]/60">
          <TabList
            value={activeTab}
            onChange={(val) => onSwitchTab?.(val as 'dashboard' | 'rates' | 'bookings')}
            hasDivider={false}
            size="md"
          >
            <Tab
              value="dashboard"
              label="Recap & Best Customers (সেরা খরিদ্দার)"
              icon={<Award className="w-3.5 h-3.5 text-[#872B22]" />}
            />
            <Tab
              value="rates"
              label="Counter Rates (রেট পরিবর্তন)"
              icon={<Layers className="w-3.5 h-3.5 text-[#872B22]" />}
            />
            <Tab
              value="bookings"
              label="Pending Orders (বুকিং তালিকা)"
              icon={<Clock className="w-3.5 h-3.5 text-[#872B22]" />}
            />
          </TabList>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Executive KPI Cards Grid using Meta Astryx Card */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total UPI Revenue */}
          <Card
            variant="default"
            elevation="low"
            padding={4}
            className="flex flex-col justify-between bg-white border border-[#E6DEC8] rounded-[var(--radius-panel)] transition-all hover-lift"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
                  PhonePe UPI
                </span>
                <h2 className="font-display font-bold text-sm text-[#231917] mt-0.5">
                  মোট UPI বিক্রি
                </h2>
              </div>
              <div className="p-2 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <QrCode className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#872B22] tabular-nums">
                ₹{recapMetrics.total_revenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2 border-t border-[#E6DEC8]/60 flex items-center justify-between text-xs text-[#665852]">
              <span>{recapMetrics.total_orders} verified payments</span>
              <Badge variant="purple" label="Direct to Bank" />
            </div>
          </Card>

          {/* Card 2: Regular Customer Retention */}
          <Card
            variant="default"
            elevation="low"
            padding={4}
            className="flex flex-col justify-between bg-white border border-[#E6DEC8] rounded-[var(--radius-panel)] transition-all hover-lift"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  Customer Loyalty
                </span>
                <h2 className="font-display font-bold text-sm text-[#231917] mt-0.5">
                  নিয়মিত খরিদ্দার হার
                </h2>
              </div>
              <div className="p-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#231917] tabular-nums">
                {recapMetrics.repeat_customer_rate}%
              </span>
            </div>

            <div className="pt-2 border-t border-[#E6DEC8]/60 flex items-center justify-between text-xs text-[#665852]">
              <span>{bestCustomers.filter((c) => c.total_visits > 1).length} repeat weekly buyers</span>
              <Badge variant="success" label="High Repeat" />
            </div>
          </Card>

          {/* Card 3: Sunday Peak Rush */}
          <Card
            variant="default"
            elevation="low"
            padding={4}
            className="flex flex-col justify-between bg-white border border-[#E6DEC8] rounded-[var(--radius-panel)] transition-all hover-lift"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                  Sunday Peak Rush
                </span>
                <h2 className="font-display font-bold text-sm text-[#231917] mt-0.5">
                  রবিবারের বিক্রি
                </h2>
              </div>
              <div className="p-2 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#872B22] tabular-nums">
                ₹{recapMetrics.sunday_revenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2 border-t border-[#E6DEC8]/60 flex items-center justify-between text-xs text-[#665852]">
              <span>{recapMetrics.sunday_orders} morning rush orders</span>
              <Badge variant="error" label="Biggest Rush" />
            </div>
          </Card>

          {/* Card 4: Avg Order Ticket */}
          <Card
            variant="default"
            elevation="low"
            padding={4}
            className="flex flex-col justify-between bg-white border border-[#E6DEC8] rounded-[var(--radius-panel)] transition-all hover-lift"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                  Average Ticket Size
                </span>
                <h2 className="font-display font-bold text-sm text-[#231917] mt-0.5">
                  গড় কেনাকাটা
                </h2>
              </div>
              <div className="p-2 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#231917] tabular-nums">
                ₹{recapMetrics.weekly_aov}
              </span>
            </div>

            <div className="pt-2 border-t border-[#E6DEC8]/60 flex items-center justify-between text-xs text-[#665852]">
              <span>Per customer sale</span>
              <Badge variant="blue" label="~1.5kg – 2kg" />
            </div>
          </Card>
        </section>

        {/* SECTION 1: Best Customers Leaderboard (সেরা খরিদ্দার তালিকা) */}
        <section className="space-y-4">
          <Card
            variant="default"
            elevation="low"
            padding={4}
            className="bg-white border border-[#E6DEC8] rounded-[var(--radius-panel)] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#A83A2F] uppercase tracking-wider">
                    Customer Intelligence
                  </span>
                  <Badge
                    variant="purple"
                    icon={<Crown className="w-3.5 h-3.5" />}
                    label="VIP Retention"
                  />
                </div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-[#231917] mt-1">
                  সেরা খরিদ্দার তালিকা (Best Customers Leaderboard)
                </h3>
                <p className="text-xs text-[#665852]">
                  Recognize and reward regular buyers based on PhonePe UPI payment handles.
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCustomerFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-chip)] transition-all cursor-pointer ${
                    customerFilter === 'ALL'
                      ? 'bg-[#872B22] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#665852] hover:bg-[#F3EFE6] border border-[#E6DEC8]'
                  }`}
                >
                  All ({bestCustomers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerFilter('VIP')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-chip)] transition-all cursor-pointer ${
                    customerFilter === 'VIP'
                      ? 'bg-[#872B22] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#665852] hover:bg-[#F3EFE6] border border-[#E6DEC8]'
                  }`}
                >
                  👑 VIP Regulars
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerFilter('FREQUENT')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-chip)] transition-all cursor-pointer ${
                    customerFilter === 'FREQUENT'
                      ? 'bg-[#872B22] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#665852] hover:bg-[#F3EFE6] border border-[#E6DEC8]'
                  }`}
                >
                  ⭐ Frequent Buyers
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerFilter('HIGH_SPEND')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-chip)] transition-all cursor-pointer ${
                    customerFilter === 'HIGH_SPEND'
                      ? 'bg-[#872B22] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#665852] hover:bg-[#F3EFE6] border border-[#E6DEC8]'
                  }`}
                >
                  ₹500+ Spenders
                </button>
              </div>
            </div>

            {/* Customer Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((cust, index) => (
                <div
                  key={cust.customer_identifier}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-4 rounded-[var(--radius-control)] border transition-all duration-200 hover-lift cursor-pointer space-y-3 ${
                    cust.loyalty_tier.includes('VIP')
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-[#FAF7F2] border-[#E6DEC8]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#872B22] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                        {cust.customer_name ? cust.customer_name.charAt(0) : 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-sm text-[#231917] truncate">
                          {cust.customer_name || 'Regular Customer'}
                        </h4>
                        <span className="text-[11px] font-mono text-[#665852] truncate block">
                          {cust.customer_identifier}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-[var(--radius-chip)] bg-white border border-[#E6DEC8] text-[#872B22]">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E6DEC8]/60 text-center">
                    <div className="bg-white/80 p-1.5 rounded-[var(--radius-chip)] border border-[#E6DEC8]/60">
                      <span className="text-[10px] text-[#665852] block">Total Spent</span>
                      <span className="font-mono font-bold text-xs text-[#872B22] tabular-nums">
                        ₹{cust.total_lifetime_spend.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-[var(--radius-chip)] border border-[#E6DEC8]/60">
                      <span className="text-[10px] text-[#665852] block">Visits</span>
                      <span className="font-mono font-bold text-xs text-[#231917] tabular-nums">
                        {cust.total_visits} orders
                      </span>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-[var(--radius-chip)] border border-[#E6DEC8]/60">
                      <span className="text-[10px] text-[#665852] block">Avg Ticket</span>
                      <span className="font-mono font-bold text-xs text-[#231917] tabular-nums">
                        ₹{cust.average_order_value}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#665852] pt-1">
                    <span className="truncate">
                      Last: {cust.days_since_last_visit === 0 ? 'Today' : `${cust.days_since_last_visit}d ago`}
                    </span>
                    <span className="text-[#872B22] font-semibold inline-flex items-center gap-0.5">
                      <span>History</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* SECTION 2: PhonePe Statements Ledger */}
        <section className="space-y-4">
          <Card
            variant="default"
            elevation="low"
            padding={4}
            className="bg-white border border-[#E6DEC8] rounded-[var(--radius-panel)] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-[#A83A2F] uppercase tracking-wider block">
                  PhonePe Verified Statements
                </span>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-[#231917]">
                  পেমেন্ট হিস্ট্রি ও Bank UTR (UPI Ledger)
                </h3>
              </div>

              <div className="w-full sm:w-72">
                <TextInput
                  type="search"
                  label="Search transactions"
                  isLabelHidden
                  placeholder="Search Bank UTR, Customer..."
                  value={searchQuery}
                  onChange={(val) => setSearchQuery(val)}
                  width="100%"
                />
              </div>
            </div>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto rounded-[var(--radius-control)] border border-[#E6DEC8]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E6DEC8] text-[#665852] font-semibold">
                  <tr>
                    <th className="p-3">Date & Time (তারিখ ও সময়)</th>
                    <th className="p-3">Customer / Payer VPA</th>
                    <th className="p-3">Bank UTR / Reference</th>
                    <th className="p-3">Cut Style / Note</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Amount (টাকা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DEC8]/60 bg-white">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#665852]">
                        No transactions match your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.provider_reference_id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="p-3 font-mono text-[#665852] whitespace-nowrap">
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
                        <td className="p-3">
                          <strong className="text-[#231917] block">{p.payer_name || 'Walk-in Customer'}</strong>
                          {p.payer_vpa && (
                            <span className="font-mono text-[11px] text-[#665852] block">
                              {p.payer_vpa}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="inline-flex items-center gap-1.5 p-1 bg-[#FAF7F2] rounded border border-[#E6DEC8]">
                            <code className="font-mono font-medium text-[11px] text-[#231917]">
                              {p.provider_reference_id}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(p.provider_reference_id)}
                              className="text-[#665852] hover:text-[#872B22] transition-colors cursor-pointer"
                              title="Copy Bank UTR"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-[#665852]">{p.notes || 'UPI Counter Sale'}</td>
                        <td className="p-3">
                          <Badge variant="success" label={p.status} />
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-sm text-[#15803D] tabular-nums">
                          +₹{p.amount_rupees.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>

      {/* MODAL 1: PhonePe CSV Upload Dialog with Meta Astryx Dialog */}
      <Dialog
        isOpen={isUploadModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsUploadModalOpen(false);
            setParsedCsvResult(null);
          }
        }}
        purpose="form"
        width={560}
        maxHeight="85dvh"
        padding={0}
        className="rounded-[var(--radius-panel)] bg-white text-[#231917] border border-[#E6DEC8] shadow-2xl overflow-hidden"
      >
        <DialogHeader
          title="Upload PhonePe Statement CSV"
          subtitle="Download daily/weekly statement from business.phonepe.com and drop here"
          onOpenChange={(open) => {
            if (!open) {
              setIsUploadModalOpen(false);
              setParsedCsvResult(null);
            }
          }}
          className="px-5 py-4 border-b border-[#E6DEC8] bg-[#FAF7F2]/80"
        />

        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-[#665852] leading-relaxed">
            Download your transaction statement from the{' '}
            <strong className="text-[#231917]">PhonePe for Business Portal</strong> or Business App, and drop the CSV file below.
          </p>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-[var(--radius-panel)] text-center cursor-pointer transition-all duration-150 ${
              isDragging
                ? 'border-[#872B22] bg-[#872B22]/5'
                : 'border-[#E6DEC8] bg-[#FAF7F2] hover:bg-[#F3EFE6]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
            <Upload className="w-8 h-8 mx-auto text-[#872B22] mb-2" />
            <p className="text-xs font-bold text-[#231917]">
              Click to browse or drag & drop PhonePe CSV file
            </p>
            <span className="text-[11px] text-[#665852] mt-1 block">
              Supports standard PhonePe for Business CSV exports
            </span>
          </div>

          {/* Parsed Preview */}
          {parsedCsvResult && (
            <div className="pt-2">
              {parsedCsvResult.success ? (
                <div className="p-4 rounded-[var(--radius-control)] bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="font-mono font-bold text-sm text-emerald-800 tabular-nums">
                        {parsedCsvResult.validCount}
                      </span>
                      <span className="text-[10px] text-emerald-700 block">Valid Rows</span>
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-emerald-800 tabular-nums">
                        ₹{parsedCsvResult.totalAmountRupees.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-700 block">Total Amount</span>
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-emerald-800 tabular-nums">
                        {parsedCsvResult.uniqueCustomersCount}
                      </span>
                      <span className="text-[10px] text-emerald-700 block">Customers</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-800 border-t border-emerald-200/60 pt-2">
                    🔒 <strong>Auto-Deduplication:</strong> Transactions with existing Bank UTRs will be skipped safely without creating duplicate entries.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-[var(--radius-control)] bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  ⚠️ {parsedCsvResult.error || 'Failed to parse file. Please verify it is a valid PhonePe CSV.'}
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-[#E6DEC8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsUploadModalOpen(false);
                setParsedCsvResult(null);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-[var(--radius-chip)] text-[#665852] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
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
        </div>
      </Dialog>

      {/* MODAL 2: Customer Purchase History Dialog with Meta Astryx Dialog */}
      <Dialog
        isOpen={!!selectedCustomer}
        onOpenChange={(open) => {
          if (!open) setSelectedCustomer(null);
        }}
        purpose="info"
        width={560}
        maxHeight="85dvh"
        padding={0}
        className="rounded-[var(--radius-panel)] bg-white text-[#231917] border border-[#E6DEC8] shadow-2xl overflow-hidden"
      >
        <DialogHeader
          title={selectedCustomer?.customer_name || 'Regular Customer'}
          subtitle={selectedCustomer?.customer_identifier}
          onOpenChange={(open) => {
            if (!open) setSelectedCustomer(null);
          }}
          className="px-5 py-4 border-b border-[#E6DEC8] bg-[#FAF7F2]/80"
        />

        {selectedCustomer && (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Customer Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 rounded-[var(--radius-control)] bg-[#FAF7F2] border border-[#E6DEC8]">
              <div>
                <span className="text-[10px] text-[#665852] block">Total Spent</span>
                <span className="font-mono font-bold text-xs text-[#872B22] tabular-nums">
                  ₹{selectedCustomer.total_lifetime_spend.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#665852] block">Visits</span>
                <span className="font-mono font-bold text-xs text-[#231917] tabular-nums">
                  {selectedCustomer.total_visits} orders
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#665852] block">Average Order</span>
                <span className="font-mono font-bold text-xs text-[#231917] tabular-nums">
                  ₹{selectedCustomer.average_order_value}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#665852] block">Loyalty Tier</span>
                <span className="text-xs font-semibold text-[#872B22]">
                  {selectedCustomer.loyalty_tier}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#665852] mb-2">
                Purchase History from PhonePe Statements
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedCustomer.recent_payments?.map((pay) => (
                  <div
                    key={pay.provider_reference_id}
                    className="p-2.5 rounded-[var(--radius-control)] border border-[#E6DEC8]/80 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-[#15803D] font-mono tabular-nums block">
                        +₹{pay.amount_rupees.toLocaleString('en-IN')}
                      </strong>
                      <span className="text-[11px] text-[#665852]">
                        {new Date(pay.paid_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {pay.notes && (
                        <span className="text-[11px] text-[#231917] block font-medium">
                          {pay.notes}
                        </span>
                      )}
                    </div>
                    <code className="text-[10px] font-mono text-[#665852] bg-[#FAF7F2] px-2 py-1 rounded border border-[#E6DEC8]">
                      UTR: {pay.provider_reference_id.slice(-6)}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6DEC8] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs font-semibold rounded-[var(--radius-chip)] bg-[#F3EFE6] hover:bg-[#E6DEC8] text-[#231917] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
