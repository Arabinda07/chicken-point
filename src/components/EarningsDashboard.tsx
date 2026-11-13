import {useState, useMemo, useRef, ChangeEvent, DragEvent} from 'react';
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
import {parsePhonePeCsv, ParseResult} from '../lib/phonepeCsvParser';

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
  const [payments, setPayments] = useState<PhonePeUpiPayment[]>(fallbackShopPayments);
  const [settlements] = useState<Settlement[]>(fallbackSettlements);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'VIP' | 'FREQUENT' | 'HIGH_SPEND'>('ALL');
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<BestCustomer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
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
    showToast(
      `✅ Imported ${newItems.length} new PhonePe UPI transactions (${parsedCsvResult.transactions.length - newItems.length} existing duplicates ignored)`,
    );
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
    <div className="earnings-dashboard-root">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="dashboard-toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* Top Header Bar */}
      <header className="dashboard-topbar">
        <div className="dashboard-branding">
          <div className="branding-title-row">
            <h1 className="dashboard-title">Bikash Chicken Point</h1>
            <span className="bengali-title">বিকাশ চিকেন পয়েন্ট</span>
            <span className="live-badge upi">
              <QrCode size={14} /> PhonePe UPI Statements
            </span>
          </div>
          <p className="dashboard-subtitle">
            Executive Recap & Customer Intelligence Hub · ফুলঝোড় সবজি মার্কেট
          </p>
        </div>

        <div className="dashboard-top-actions">
          <button
            type="button"
            className="action-pill primary"
            onClick={() => setIsUploadModalOpen(true)}
            title="Upload downloaded statement CSV from PhonePe Business portal"
          >
            <Upload size={16} />
            <span>Upload PhonePe CSV</span>
          </button>
          <button
            type="button"
            className="action-pill share"
            onClick={shareWhatsAppRecap}
            title="Send formatted weekly summary to Uncle via WhatsApp"
          >
            <Share2 size={16} />
            <span>WhatsApp Recap for Uncle</span>
          </button>
          <button type="button" className="plain-link logout" onClick={onSignOut}>
            Sign Out
          </button>
          <button type="button" className="plain-link" onClick={onBackToShop}>
            Back to Shop
          </button>
        </div>
      </header>

      {/* Secondary Navigation Tabs */}
      <nav className="dashboard-nav-tabs" aria-label="Dashboard views">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSwitchTab?.('dashboard')}
        >
          <Award size={16} />
          <span>Recap & Best Customers</span>
          <span className="tab-bengali">সেরা খরিদ্দার ও রিক্যাপ</span>
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'rates' ? 'active' : ''}`}
          onClick={() => onSwitchTab?.('rates')}
        >
          <Layers size={16} />
          <span>Counter Rates</span>
          <span className="tab-bengali">রেট পরিবর্তন</span>
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => onSwitchTab?.('bookings')}
        >
          <Clock size={16} />
          <span>Pending Orders</span>
          <span className="tab-bengali">বুকিং তালিকা</span>
        </button>
      </nav>

      {/* Executive KPI Cards Grid */}
      <section className="kpi-grid">
        {/* Card 1: Total UPI Revenue */}
        <article className="kpi-card phonepe-upi">
          <div className="kpi-header">
            <div>
              <span className="kpi-tag phonepe">PhonePe UPI Collections</span>
              <h2 className="kpi-title">মোট UPI বিক্রি</h2>
            </div>
            <div className="kpi-icon-badge purple">
              <QrCode size={22} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-currency">₹</span>
            <span className="kpi-number">{recapMetrics.total_revenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">{recapMetrics.total_orders} UPI payments verified</span>
            <span className="kpi-pill phonepe">100% Direct to Bank</span>
          </div>
        </article>

        {/* Card 2: Regular Customer Retention */}
        <article className="kpi-card gross-sales">
          <div className="kpi-header">
            <div>
              <span className="kpi-tag">Customer Loyalty</span>
              <h2 className="kpi-title">নিয়মিত খরিদ্দার হার</h2>
            </div>
            <div className="kpi-icon-badge gold">
              <Users size={22} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{recapMetrics.repeat_customer_rate}</span>
            <span className="kpi-currency">%</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">
              {bestCustomers.filter((c) => c.total_visits > 1).length} repeat weekly buyers
            </span>
            <span className="kpi-pill success">High Repeat</span>
          </div>
        </article>

        {/* Card 3: Sunday Peak Rush */}
        <article className="kpi-card Sunday-card">
          <div className="kpi-header">
            <div>
              <span className="kpi-tag">Sunday Peak Share</span>
              <h2 className="kpi-title">রবিবারের বিক্রি</h2>
            </div>
            <div className="kpi-icon-badge red">
              <Flame size={22} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-currency">₹</span>
            <span className="kpi-number">{recapMetrics.sunday_revenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">{recapMetrics.sunday_orders} Sunday morning rush orders</span>
            <span className="kpi-pill red">Biggest Rush</span>
          </div>
        </article>

        {/* Card 4: Avg Order Ticket */}
        <article className="kpi-card aov-card">
          <div className="kpi-header">
            <div>
              <span className="kpi-tag blue">Average Ticket Size</span>
              <h2 className="kpi-title">গড় কেনাকাটা</h2>
            </div>
            <div className="kpi-icon-badge blue">
              <Wallet size={22} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-currency">₹</span>
            <span className="kpi-number">{recapMetrics.weekly_aov}</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Per customer transaction</span>
            <span className="kpi-pill blue">~1.5kg – 2kg avg</span>
          </div>
        </article>
      </section>

      {/* SECTION 1: Best Customers Leaderboard (সেরা খরিদ্দার তালিকা) */}
      <section className="dashboard-panel customer-leaderboard-panel">
        <div className="leaderboard-header-row">
          <div>
            <div className="header-badge-row">
              <span className="panel-eyebrow">Customer Intelligence</span>
              <span className="vip-crown-badge">
                <Crown size={14} /> VIP Retention
              </span>
            </div>
            <h3 className="panel-title">সেরা খরিদ্দার তালিকা (Best Customers Leaderboard)</h3>
            <p className="panel-hint">
              Identified through PhonePe UPI payment handles. Helps your uncle recognize and reward his regular buyers.
            </p>
          </div>

          {/* Filter buttons */}
          <div className="customer-filter-pills">
            <button
              type="button"
              className={`pill-btn ${customerFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setCustomerFilter('ALL')}
            >
              All ({bestCustomers.length})
            </button>
            <button
              type="button"
              className={`pill-btn ${customerFilter === 'VIP' ? 'active' : ''}`}
              onClick={() => setCustomerFilter('VIP')}
            >
              👑 VIP Regulars
            </button>
            <button
              type="button"
              className={`pill-btn ${customerFilter === 'FREQUENT' ? 'active' : ''}`}
              onClick={() => setCustomerFilter('FREQUENT')}
            >
              ⭐ Frequent Buyers
            </button>
            <button
              type="button"
              className={`pill-btn ${customerFilter === 'HIGH_SPEND' ? 'active' : ''}`}
              onClick={() => setCustomerFilter('HIGH_SPEND')}
            >
              ₹500+ Spenders
            </button>
          </div>
        </div>

        {/* Customer Cards Grid */}
        <div className="customer-cards-grid">
          {filteredCustomers.map((cust, index) => (
            <article
              key={cust.customer_identifier}
              className={`customer-card ${cust.loyalty_tier.includes('VIP') ? 'is-vip' : ''}`}
              onClick={() => setSelectedCustomer(cust)}
            >
              <div className="customer-rank-badge">#{index + 1}</div>

              <div className="customer-card-header">
                <div className="customer-avatar">
                  {cust.customer_name ? cust.customer_name.charAt(0) : 'U'}
                </div>
                <div className="customer-name-box">
                  <h4 className="customer-name">{cust.customer_name || 'Regular Customer'}</h4>
                  <span className="customer-vpa">{cust.customer_identifier}</span>
                </div>
                <span className={`loyalty-pill ${cust.loyalty_tier.includes('VIP') ? 'vip' : 'frequent'}`}>
                  {cust.loyalty_tier}
                </span>
              </div>

              <div className="customer-card-metrics">
                <div className="metric-box">
                  <span className="m-label">Total Spent (মোট)</span>
                  <span className="m-val highlight">₹{cust.total_lifetime_spend.toLocaleString('en-IN')}</span>
                </div>
                <div className="metric-box">
                  <span className="m-label">Visits (অর্ডার)</span>
                  <span className="m-val">{cust.total_visits} times</span>
                </div>
                <div className="metric-box">
                  <span className="m-label">Avg / Visit (গড়)</span>
                  <span className="m-val">₹{cust.average_order_value}</span>
                </div>
              </div>

              <div className="customer-card-footer">
                <span className="last-visit-tag">
                  Last: {cust.days_since_last_visit === 0 ? 'Today' : `${cust.days_since_last_visit} days ago`}
                </span>
                <span className="view-orders-link">
                  Order history <ChevronRight size={14} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 2: PhonePe Statements Ledger */}
      <section className="dashboard-panel payments-ledger-panel">
        <div className="ledger-header-row">
          <div>
            <span className="panel-eyebrow">PhonePe Statement Transactions</span>
            <h3 className="panel-title">পেমেন্ট হিস্ট্রি ও Bank UTR (UPI Ledger)</h3>
          </div>

          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search Bank UTR, Customer, or Note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ledger-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="ledger-table-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Date & Time (তারিখ ও সময়)</th>
                <th>Customer / Payer VPA</th>
                <th>Bank UTR / Reference No</th>
                <th>Cut Style / Note</th>
                <th>Status</th>
                <th className="text-right">Amount (টাকা)</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data-cell">
                    No transactions match your search.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.provider_reference_id}>
                    <td className="time-cell">
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
                    <td className="vpa-cell">
                      <strong>{p.payer_name || 'Walk-in Customer'}</strong>
                      {p.payer_vpa && <span className="vpa-subtext">{p.payer_vpa}</span>}
                    </td>
                    <td className="utr-cell">
                      <div className="utr-box">
                        <code>{p.provider_reference_id}</code>
                        <button
                          type="button"
                          className="copy-utr-btn"
                          onClick={() => copyToClipboard(p.provider_reference_id)}
                          title="Copy Bank UTR"
                        >
                          <Copy size={13} />
                          {copiedUtr === p.provider_reference_id && (
                            <span className="copied-tag">Copied</span>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="note-cell">{p.notes || 'UPI Counter Sale'}</td>
                    <td>
                      <span className="status-pill completed">
                        <CheckCircle2 size={13} /> {p.status}
                      </span>
                    </td>
                    <td className="text-right amount-cell">
                      +₹{p.amount_rupees.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL 1: PhonePe CSV Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsUploadModalOpen(false)}>
          <div
            className="csv-upload-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="upload-modal-title"
          >
            <div className="modal-header">
              <div className="modal-title-box">
                <FileSpreadsheet className="text-phonepe" size={22} />
                <h3 id="upload-modal-title">Upload PhonePe Statement CSV</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsUploadModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="upload-instruction">
              Download your daily or weekly transaction statement from the <strong>PhonePe for Business Portal</strong> ([business.phonepe.com](https://business.phonepe.com/)) or PhonePe Business App, and drop the CSV file here.
            </p>

            {/* Drag and Drop Zone */}
            <div
              className={`dropzone-box ${isDragging ? 'is-dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                style={{display: 'none'}}
                onChange={handleFileInputChange}
              />
              <Upload size={32} className="dropzone-icon" />
              <p className="dropzone-text">
                <strong>Click to browse</strong> or drag & drop PhonePe CSV file
              </p>
              <span className="dropzone-hint">Supports standard PhonePe for Business CSV exports</span>
            </div>

            {/* Parsed Preview */}
            {parsedCsvResult && (
              <div className="csv-preview-container">
                {parsedCsvResult.success ? (
                  <div className="parse-success-box">
                    <div className="parse-kpis">
                      <div className="parse-stat">
                        <span className="stat-num">{parsedCsvResult.validCount}</span>
                        <span className="stat-label">Valid UPI Rows</span>
                      </div>
                      <div className="parse-stat">
                        <span className="stat-num">₹{parsedCsvResult.totalAmountRupees.toLocaleString('en-IN')}</span>
                        <span className="stat-label">Total Amount</span>
                      </div>
                      <div className="parse-stat">
                        <span className="stat-num">{parsedCsvResult.uniqueCustomersCount}</span>
                        <span className="stat-label">Customers</span>
                      </div>
                    </div>
                    <div className="dedup-note">
                      🔒 <strong>Auto-Deduplication:</strong> Transactions with existing Bank UTRs will be skipped safely without creating duplicate entries.
                    </div>
                  </div>
                ) : (
                  <div className="parse-error-box">
                    ⚠️ {parsedCsvResult.error || 'Failed to parse file. Please verify it is a valid PhonePe CSV.'}
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="plain-link"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setParsedCsvResult(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-cta compact"
                disabled={!parsedCsvResult?.success}
                onClick={confirmImport}
              >
                Confirm & Import Transactions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Customer Purchase History Drawer */}
      {selectedCustomer && (
        <div className="modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div
            className="customer-drawer-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="customer-drawer-title"
          >
            <div className="modal-header">
              <div className="drawer-header-left">
                <div className="drawer-avatar">
                  {selectedCustomer.customer_name ? selectedCustomer.customer_name.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 id="customer-drawer-title">
                    {selectedCustomer.customer_name || 'Regular Customer'}
                  </h3>
                  <span className="customer-vpa">{selectedCustomer.customer_identifier}</span>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedCustomer(null)}
              >
                ✕
              </button>
            </div>

            <div className="drawer-summary-strip">
              <div>
                <span className="strip-label">Total Lifetime Spend</span>
                <span className="strip-val highlight">
                  ₹{selectedCustomer.total_lifetime_spend.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="strip-label">Visits</span>
                <span className="strip-val">{selectedCustomer.total_visits} orders</span>
              </div>
              <div>
                <span className="strip-label">Average Order</span>
                <span className="strip-val">₹{selectedCustomer.average_order_value}</span>
              </div>
              <div>
                <span className="strip-label">Loyalty Tier</span>
                <span className="strip-val">{selectedCustomer.loyalty_tier}</span>
              </div>
            </div>

            <h4 className="drawer-subheading">Purchase History from PhonePe Statements</h4>
            <div className="drawer-orders-list">
              {selectedCustomer.recent_payments?.map((pay) => (
                <div key={pay.provider_reference_id} className="drawer-order-row">
                  <div>
                    <strong>+₹{pay.amount_rupees.toLocaleString('en-IN')}</strong>
                    <span className="drawer-order-date">
                      {new Date(pay.paid_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {pay.notes && <span className="drawer-order-note">{pay.notes}</span>}
                  </div>
                  <div className="drawer-order-utr">
                    <code>UTR: {pay.provider_reference_id}</code>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="plain-link"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
