import {FormEvent, useEffect, useMemo, useState} from 'react';
import {
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Save,
  ShoppingBag,
  Stamp,
  UserRound,
  X,
} from 'lucide-react';
import {
  cutStyleOptions,
  fallbackProducts,
  pickupOptions,
  siteData,
  weightOptions,
} from './data';
import {
  Booking,
  BookingInsert,
  CutStyle,
  Product,
  isSupabaseConfigured,
  supabase,
} from './lib/supabase';

const logoUrl = new URL('../assets/logo.jpeg', import.meta.url).href;
const paymentQrUrl = new URL('../assets/QR1.png', import.meta.url).href;
const googleReviewQrUrl = new URL('../assets/Shop_GoogleQR.png', import.meta.url).href;

type BookingFormState = {
  customerName: string;
  phone: string;
  weightKg: number;
  customWeight: string;
  cutStyle: CutStyle;
  pickupTime: string;
  customPickupTime: string;
  requestInvoice: boolean;
};

type BookingResult = {
  orderCode: string;
  message: string;
};

type LoyaltyState = {
  phone: string;
  totalKg: number | null;
  isLoading: boolean;
  error: string;
};

type AdminProductDraft = Product & {
  draftPrice: string;
  saveState?: 'idle' | 'saving' | 'saved' | 'error';
};

const defaultBookingForm: BookingFormState = {
  customerName: '',
  phone: '',
  weightKg: 1,
  customWeight: '',
  cutStyle: 'curry',
  pickupTime: 'ASAP',
  customPickupTime: '',
  requestInvoice: false,
};

function getKolkataMinutes() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
}

function buildWhatsappLink(message: string) {
  return `https://wa.me/${siteData.whatsapp}?text=${encodeURIComponent(message)}`;
}

function formatPrice(price: number) {
  return `₹${Math.round(price)}/kg`;
}

function formatWeight(weightKg: number) {
  return Number.isInteger(weightKg) ? `${weightKg}kg` : `${weightKg.toFixed(1)}kg`;
}

function generateOrderCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function isDuplicateOrderCode(error: {code?: string; message?: string} | null) {
  return error?.code === '23505' || /duplicate/i.test(error?.message ?? '');
}

function getProductDetail(productId: string) {
  return siteData.menuDetails[productId as keyof typeof siteData.menuDetails];
}

function getBookingWeight(form: BookingFormState) {
  const customWeight = Number(form.customWeight);
  return Number.isFinite(customWeight) && customWeight > 0 ? customWeight : form.weightKg;
}

function getPickupTime(form: BookingFormState) {
  return form.customPickupTime.trim() || form.pickupTime;
}

function buildBookingMessage(orderCode: string, product: Product, form: BookingFormState) {
  const cut = cutStyleOptions.find((option) => option.value === form.cutStyle)?.whatsappLabel ?? 'Curry Cut';
  const invoiceLine = form.requestInvoice ? ' Please prepare GST/Formal Invoice.' : '';
  return (
    `Hello Bikash Da, Order #${orderCode}. I will pick up ` +
    `${formatWeight(getBookingWeight(form))} ${cut} at ${getPickupTime(form)}. ` +
    `Please keep it ready. Item: ${product.name}.${invoiceLine}`
  );
}

function normalizeProducts(products: Product[]) {
  return products
    .map((product) => ({
      ...product,
      price_per_kg: Number(product.price_per_kg),
    }))
    .sort((a, b) => a.display_order - b.display_order);
}

export default function App() {
  const [path] = useState(() => window.location.pathname);

  if (path === '/admin') {
    return <AdminApp />;
  }

  return <Storefront />;
}

function Storefront() {
  const [openFaq, setOpenFaq] = useState(0);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormState>(defaultBookingForm);
  const [bookingError, setBookingError] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyState>({
    phone: '',
    totalKg: null,
    isLoading: false,
    error: '',
  });

  const callLink = `tel:${siteData.phone.replace(/\s+/g, '')}`;
  const isOpenNow = useMemo(() => {
    const now = getKolkataMinutes();
    return (
      now >= siteData.openingHours.startHour * 60 &&
      now < siteData.openingHours.endHour * 60
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      if (!isSupabaseConfigured) {
        setIsLoadingProducts(false);
        setProductError('Live prices need Supabase env keys. Showing starter rates for now.');
        return;
      }

      const {data, error} = await supabase
        .from('products')
        .select('id,name,name_bengali,price_per_kg,is_available,display_order,updated_at')
        .order('display_order', {ascending: true});

      if (!isMounted) {
        return;
      }

      setIsLoadingProducts(false);

      if (error) {
        setProductError('Live prices did not load. Showing saved starter rates.');
        return;
      }

      setProducts(normalizeProducts((data ?? []) as Product[]));
      setProductError('');
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const generalOrderMessage =
    `Hi ${siteData.shopName}, I want to pre-book chicken for counter pickup. ` +
    `Please confirm today's rate and availability.`;

  function openBooking(product: Product) {
    setSelectedProduct(product);
    setBookingForm(defaultBookingForm);
    setBookingError('');
    setBookingResult(null);
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const weightKg = getBookingWeight(bookingForm);
    const pickupTime = getPickupTime(bookingForm);

    if (!bookingForm.customerName.trim() || !bookingForm.phone.trim()) {
      setBookingError('Name and phone are required. নাম আর ফোন নম্বর দিন।');
      return;
    }

    if (!weightKg || weightKg <= 0 || !pickupTime) {
      setBookingError('Choose weight and pickup time. ওজন আর পিকআপ সময় বেছে নিন।');
      return;
    }

    if (!isSupabaseConfigured) {
      setBookingError('Supabase is not configured yet. Please call or WhatsApp the shop.');
      return;
    }

    setBookingError('');
    setIsSubmittingBooking(true);

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const orderCode = generateOrderCode();
      const booking: BookingInsert = {
        order_code: orderCode,
        customer_name: bookingForm.customerName.trim(),
        phone: bookingForm.phone.trim(),
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        weight_kg: weightKg,
        cut_style: bookingForm.cutStyle,
        pickup_time: pickupTime,
        request_invoice: bookingForm.requestInvoice,
        status: 'pending',
      };

      const {error} = await supabase.from('bookings').insert(booking);

      if (isDuplicateOrderCode(error)) {
        continue;
      }

      setIsSubmittingBooking(false);

      if (error) {
        setBookingError(error.message);
        return;
      }

      const message = buildBookingMessage(orderCode, selectedProduct, bookingForm);
      setBookingResult({orderCode, message});
      window.open(buildWhatsappLink(message), '_blank', 'noopener,noreferrer');
      return;
    }

    setIsSubmittingBooking(false);
    setBookingError('Could not create a fresh order number. Please try once more.');
  }

  async function checkLoyalty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phone = loyalty.phone.trim();

    if (!phone) {
      setLoyalty((current) => ({...current, error: 'Enter a phone number first.'}));
      return;
    }

    if (!isSupabaseConfigured) {
      setLoyalty((current) => ({...current, totalKg: 0, error: 'Supabase is not configured yet.'}));
      return;
    }

    setLoyalty((current) => ({...current, isLoading: true, error: ''}));

    const {data, error} = await supabase.rpc('get_loyalty_by_phone', {input_phone: phone});
    const firstRow = Array.isArray(data) ? data[0] : null;

    setLoyalty((current) => ({
      ...current,
      isLoading: false,
      totalKg: error ? null : Number(firstRow?.total_kg ?? 0),
      error: error?.message ?? '',
    }));
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <div className="site-container header-inner">
          <a className="brand-lockup" href="#main-content" aria-label="Bikash Chicken Point home">
            <img src={logoUrl} alt="" className="brand-logo" width="64" height="64" />
            <span>
              <span className="brand-name">{siteData.shopName}</span>
              <span className="brand-subname">{siteData.shopNameBengali}</span>
            </span>
          </a>

          <div className="header-actions">
            <span className={`status-pill ${isOpenNow ? 'is-open' : 'is-closed'}`}>
              <span aria-hidden="true" />
              {isOpenNow ? 'Open now' : 'Open daily 8 AM'}
            </span>
            <a className="icon-button secondary" href={callLink} aria-label={`Call ${siteData.shopName}`}>
              <Phone size={19} />
              <span>Call</span>
            </a>
            <a className="icon-button whatsapp" href={buildWhatsappLink(generalOrderMessage)}>
              <MessageCircle size={19} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="hero-section">
          <div className="site-container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{siteData.hero.eyebrow}</p>
              <h1>{siteData.hero.title}</h1>
              <p className="hero-subtitle">{siteData.hero.subtitle}</p>

              <div className="fast-track-badge" aria-label="Fast track pickup">
                <Clock size={19} />
                <span>{siteData.fastTrack.english}</span>
                <strong>{siteData.fastTrack.bengali}</strong>
              </div>

              <div className="hero-actions" aria-label="Primary ordering actions">
                <a className="primary-cta" href="#menu">
                  <ShoppingBag size={21} />
                  Pre-Book for Pickup
                </a>
                <a className="plain-link" href="#b2b">
                  <BriefcaseBusiness size={19} />
                  Restaurants/Hotels
                </a>
                <a className="plain-link" href="#loyalty">
                  Loyalty Check
                </a>
              </div>
            </div>

            <div className="hero-panel" aria-label="Shop details">
              <img src={logoUrl} alt={`${siteData.shopName} logo`} className="hero-logo" />
              <div className="hero-detail-list">
                <p>
                  <MapPin size={18} />
                  <span>{siteData.address}</span>
                </p>
                <p>
                  <Clock size={18} />
                  <span>{siteData.timing}</span>
                </p>
                <p>
                  <ShoppingBag size={18} />
                  <span>{siteData.pickupNote}</span>
                </p>
                <p>
                  <BriefcaseBusiness size={18} />
                  <span>UDYAM: {siteData.udyamRegistrationNumber}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Shop promises">
          <div className="site-container proof-grid">
            <p>
              <CheckCircle2 size={18} />
              Walk-in pickup only
            </p>
            <p>
              <CheckCircle2 size={18} />
              Cut after pre-booking
            </p>
            <p>
              <CheckCircle2 size={18} />
              WhatsApp order number
            </p>
          </div>
        </section>

        <B2BSection products={products} />

        <section id="menu" className="section-block menu-section">
          <div className="site-container">
            <div className="section-heading">
              <p className="eyebrow">Live Menu / আজকের রেট</p>
              <h2>Choose the cut you need.</h2>
              <p>
                Prices come from the shop admin page. Pick weight, cut style, and time before you leave.
              </p>
            </div>

            {productError && <p className="inline-alert">{productError}</p>}

            <div className="menu-list">
              {isLoadingProducts
                ? Array.from({length: 4}, (_, index) => (
                    <article className="menu-item skeleton-item" key={index}>
                      <span />
                      <span />
                    </article>
                  ))
                : products.map((product) => (
                    <MenuProductCard key={product.id} product={product} onBook={openBooking} />
                  ))}
            </div>
          </div>
        </section>

        <section className="section-block order-section">
          <div className="site-container order-grid">
            <div className="section-heading align-left">
              <p className="eyebrow">How pickup works</p>
              <h2>Fast counter pickup, no prepaid checkout.</h2>
              <p>
                This is built for the market rush. Pre-book, get your four digit order number,
                then pay after the counter confirms weight and amount.
              </p>
            </div>

            <div className="order-steps">
              {siteData.orderSteps.map((step, index) => (
                <article key={step.title} className="order-step">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LoyaltySection loyalty={loyalty} setLoyalty={setLoyalty} onCheck={checkLoyalty} />
        <PaymentAndReview callLink={callLink} />
        <LocationSection callLink={callLink} generalOrderMessage={generalOrderMessage} />
        <FaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} callLink={callLink} />
      </main>

      <Footer />

      <nav className="mobile-order-bar" aria-label="Mobile quick order actions">
        <a href={callLink}>
          <Phone size={18} />
          Call
        </a>
        <a href="#menu">
          <ShoppingBag size={18} />
          Pre-book
        </a>
      </nav>

      {selectedProduct && (
        <BookingModal
          product={selectedProduct}
          form={bookingForm}
          setForm={setBookingForm}
          error={bookingError}
          result={bookingResult}
          isSubmitting={isSubmittingBooking}
          onClose={() => setSelectedProduct(null)}
          onSubmit={submitBooking}
        />
      )}
    </div>
  );
}

function MenuProductCard({
  product,
  onBook,
}: {
  key?: string;
  product: Product;
  onBook: (product: Product) => void;
}) {
  const detail = getProductDetail(product.id);

  return (
    <article className={`menu-item ${product.is_available ? '' : 'is-unavailable'}`}>
      <div>
        <div className="menu-title-row">
          <h3>{product.name}</h3>
          <span>{detail?.note ?? (product.is_available ? 'Available' : 'Ask first')}</span>
        </div>
        <p className="bengali-name">{product.name_bengali}</p>
        <p>{detail?.detail ?? 'Fresh cut from the shop counter.'}</p>
      </div>
      <div className="menu-action">
        <span>{formatPrice(product.price_per_kg)}</span>
        <small>{detail?.weight}</small>
        <button type="button" disabled={!product.is_available} onClick={() => onBook(product)}>
          {product.is_available ? 'Pre-Book for Pickup' : 'Not available now'}
          <ShoppingBag size={17} />
        </button>
      </div>
    </article>
  );
}

function BookingModal({
  product,
  form,
  setForm,
  error,
  result,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  product: Product;
  form: BookingFormState;
  setForm: (form: BookingFormState) => void;
  error: string;
  result: BookingResult | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="booking-sheet" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <div className="sheet-header">
          <div>
            <p className="eyebrow">{siteData.booking.titleBengali}</p>
            <h2 id="booking-title">{siteData.booking.title}</h2>
            <p>
              {product.name} · {product.name_bengali} · {formatPrice(product.price_per_kg)}
            </p>
          </div>
          <button className="round-icon-button" type="button" onClick={onClose} aria-label="Close booking form">
            <X size={20} />
          </button>
        </div>

        {result ? (
          <div className="booking-success">
            <CheckCircle2 size={34} />
            <h3>Order #{result.orderCode} sent to WhatsApp</h3>
            <p>{result.message}</p>
            <a className="primary-cta compact" href={buildWhatsappLink(result.message)}>
              <MessageCircle size={18} />
              Open WhatsApp again
            </a>
          </div>
        ) : (
          <form className="booking-form" onSubmit={onSubmit}>
            <label>
              <span>Name / নাম</span>
              <input
                value={form.customerName}
                onChange={(event) => setForm({...form, customerName: event.target.value})}
                placeholder="Your name"
              />
            </label>

            <label>
              <span>Phone / ফোন</span>
              <input
                value={form.phone}
                onChange={(event) => setForm({...form, phone: event.target.value})}
                inputMode="tel"
                placeholder="10 digit number"
              />
            </label>

            <div className="field-group">
              <span>Weight / ওজন</span>
              <div className="segmented-grid">
                {weightOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={form.weightKg === option.value && !form.customWeight ? 'is-selected' : ''}
                    onClick={() => setForm({...form, weightKg: option.value, customWeight: ''})}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <input
                value={form.customWeight}
                onChange={(event) => setForm({...form, customWeight: event.target.value})}
                inputMode="decimal"
                placeholder="Custom kg"
              />
            </div>

            <div className="field-group">
              <span>Cut Style / কাট</span>
              <div className="segmented-grid">
                {cutStyleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={form.cutStyle === option.value ? 'is-selected' : ''}
                    onClick={() => setForm({...form, cutStyle: option.value})}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <span>Pickup Time / পিকআপ সময়</span>
              <div className="segmented-grid">
                {pickupOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={form.pickupTime === option.value && !form.customPickupTime ? 'is-selected' : ''}
                    onClick={() => setForm({...form, pickupTime: option.value, customPickupTime: ''})}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <input
                value={form.customPickupTime}
                onChange={(event) => setForm({...form, customPickupTime: event.target.value})}
                placeholder="Custom time, e.g. 6:30 PM"
              />
            </div>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={form.requestInvoice}
                onChange={(event) => setForm({...form, requestInvoice: event.target.checked})}
              />
              <span>
                <strong>{siteData.booking.invoiceLabel}</strong>
                <small>{siteData.booking.invoiceLabelBengali}</small>
              </span>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="primary-cta submit-booking" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="spin" size={19} /> : <MessageCircle size={19} />}
              Confirm and Open WhatsApp
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function B2BSection({products}: {products: Product[]}) {
  return (
    <section className="section-block b2b-section" id="b2b">
      <div className="site-container b2b-grid">
        <div className="section-heading align-left">
          <p className="eyebrow">{siteData.b2b.eyebrow}</p>
          <h2>{siteData.b2b.title}</h2>
          <p>{siteData.b2b.body}</p>
          <p className="bengali-name">{siteData.b2b.bodyBengali}</p>
          <p className="udyam-line">
            <FileText size={18} />
            UDYAM Registration Number: <strong>{siteData.udyamRegistrationNumber}</strong>
          </p>
          <button className="primary-cta compact" type="button" onClick={() => window.print()}>
            <Download size={18} />
            Download Rate Card
          </button>
        </div>

        <div className="rate-card" aria-label="Current B2B rate card">
          <div>
            <h3>{siteData.shopName}</h3>
            <p>Current pickup counter rates</p>
          </div>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <span>{product.name}</span>
                <strong>{formatPrice(product.price_per_kg)}</strong>
              </li>
            ))}
          </ul>
          <p>UDYAM: {siteData.udyamRegistrationNumber}</p>
        </div>
      </div>
    </section>
  );
}

function LoyaltySection({
  loyalty,
  setLoyalty,
  onCheck,
}: {
  loyalty: LoyaltyState;
  setLoyalty: (state: LoyaltyState) => void;
  onCheck: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const totalKg = loyalty.totalKg ?? 0;
  const progress = Math.min((totalKg / 10) * 100, 100);

  return (
    <section className="section-block loyalty-section" id="loyalty">
      <div className="site-container loyalty-grid">
        <div className="section-heading align-left">
          <p className="eyebrow">Loyalty Check / লয়্যালটি</p>
          <h2>Digital Stamp Card: {totalKg.toFixed(1)}/10 kg</h2>
          <p>
            Enter the same phone number used for pre-booking. Every saved booking adds to the total.
          </p>
        </div>

        <form className="loyalty-card" onSubmit={onCheck}>
          <Stamp size={34} />
          <label>
            <span>Phone number / ফোন নম্বর</span>
            <input
              value={loyalty.phone}
              onChange={(event) => setLoyalty({...loyalty, phone: event.target.value})}
              inputMode="tel"
              placeholder="Enter phone number"
            />
          </label>
          <div className="stamp-meter" aria-label={`${totalKg.toFixed(1)} kilograms out of 10`}>
            <span style={{width: `${progress}%`}} />
          </div>
          {loyalty.error && <p className="form-error">{loyalty.error}</p>}
          <button className="plain-link" type="submit" disabled={loyalty.isLoading}>
            {loyalty.isLoading ? <Loader2 className="spin" size={18} /> : <Stamp size={18} />}
            Loyalty Check
          </button>
        </form>
      </div>
    </section>
  );
}

function PaymentAndReview({callLink}: {callLink: string}) {
  return (
    <section className="section-block action-section" id="payment">
      <div className="site-container action-grid">
        <article className="qr-panel payment-panel">
          <div className="qr-copy">
            <p className="eyebrow">Payment</p>
            <h2>Pay after we confirm your order.</h2>
            <p>
              Scan the UPI QR only after the counter confirms weight and amount.
              If you pay early, call us so we can match the payment to your order number.
            </p>
            <p className="upi-line">
              <Banknote size={18} />
              UPI shown on QR: <strong>{siteData.upiId}</strong>
            </p>
          </div>
          <div className="qr-card payment-qr-card">
            <img src={paymentQrUrl} alt={`UPI payment QR for ${siteData.shopName}`} loading="lazy" />
          </div>
        </article>

        <article className="qr-panel review-panel">
          <div className="qr-copy">
            <p className="eyebrow">Google Business</p>
            <h2>Scan the Google QR after your order.</h2>
            <p>
              A short review helps nearby families find the shop. Scan the QR, or
              open the listing directly if you are already on your phone.
            </p>
            <p className="upi-line">
              <QrCode size={18} />
              Opens the shop profile on Google
            </p>
            <div className="faq-help-actions">
              <a className="plain-link listing-link" href={siteData.googleProfileUrl} target="_blank" rel="noreferrer">
                Open Google listing
                <ExternalLink size={17} />
              </a>
              <a className="plain-link" href={callLink}>
                <Phone size={17} />
                Call shop
              </a>
            </div>
          </div>
          <div className="qr-card google-qr-card">
            <img
              src={googleReviewQrUrl}
              alt={`Google Business Profile QR for ${siteData.shopName}`}
              loading="lazy"
            />
            <p className="review-thanks">ধন্যবাদ</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function LocationSection({callLink, generalOrderMessage}: {callLink: string; generalOrderMessage: string}) {
  return (
    <section className="section-block location-section" id="location">
      <div className="site-container location-grid">
        <div>
          <p className="eyebrow">Visit or pre-book</p>
          <h2>Find us at Sabji Market, Fuljhore.</h2>
          <p>
            Call before coming, or send a WhatsApp message for today&apos;s fresh cuts.
          </p>
          <div className="location-actions">
            <a className="primary-cta compact" href={buildWhatsappLink(generalOrderMessage)}>
              <MessageCircle size={19} />
              Message the shop
            </a>
            <a className="plain-link" href={callLink}>
              Call {siteData.phone}
            </a>
          </div>
        </div>

        <div className="map-shell">
          <iframe
            title="Bikash Chicken Point location map"
            src={siteData.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{border: 0}}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

function FaqSection({
  openFaq,
  setOpenFaq,
  callLink,
}: {
  openFaq: number;
  setOpenFaq: (index: number) => void;
  callLink: string;
}) {
  return (
    <section className="section-block faq-section">
      <div className="site-container faq-shell">
        <div className="section-heading align-left faq-heading">
          <p className="eyebrow">{siteData.faqSection.eyebrow}</p>
          <h2>{siteData.faqSection.title}</h2>
          <p>{siteData.faqSection.subtitle}</p>
        </div>

        <div className="faq-grid">
          <div className="faq-list" aria-label="Common customer questions">
            {siteData.faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              const panelId = `faq-panel-${faq.id}`;
              const buttonId = `faq-button-${faq.id}`;

              return (
                <button
                  id={buttonId}
                  key={faq.id}
                  type="button"
                  className={`faq-trigger ${isOpen ? 'is-active' : ''}`}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenFaq(index)}
                >
                  <span className="faq-trigger-copy">
                    <span className="faq-trigger-title">{faq.question}</span>
                    <span className="faq-trigger-bengali">{faq.questionBengali}</span>
                  </span>
                  <span className="faq-trigger-tag">{faq.tag}</span>
                </button>
              );
            })}
          </div>

          <div className="faq-panels">
            {siteData.faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              const panelId = `faq-panel-${faq.id}`;
              const buttonId = `faq-button-${faq.id}`;
              const faqMessage =
                `Hi ${siteData.shopName}, I have a question about "${faq.question}". ` +
                `Please help with today's pickup order details.`;

              return (
                <article className="faq-panel" key={faq.id} hidden={!isOpen}>
                  <div id={panelId} role="region" aria-labelledby={buttonId}>
                    <div className="faq-panel-body">
                      <div className="faq-answer-card">
                        <p className="faq-answer-label">English</p>
                        <h3>{faq.question}</h3>
                        <p>{faq.answer}</p>
                      </div>

                      <div className="faq-answer-card is-bengali">
                        <p className="faq-answer-label">বাংলা</p>
                        <h3>{faq.questionBengali}</h3>
                        <p>{faq.answerBengali}</p>
                      </div>
                    </div>

                    <div className="faq-help">
                      <div className="faq-help-copy">
                        <p className="faq-help-title">{siteData.faqSection.helpTitle}</p>
                        <p>{siteData.faqSection.helpBody}</p>
                        <p className="faq-help-bengali">{siteData.faqSection.helpBodyBengali}</p>
                      </div>

                      <div className="faq-help-actions">
                        <a className="plain-link" href={callLink}>
                          <Phone size={18} />
                          Call now
                        </a>
                        <a className="primary-cta compact" href={buildWhatsappLink(faqMessage)}>
                          <MessageCircle size={19} />
                          Ask on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <a className="footer-brand" href="#main-content" aria-label={`${siteData.shopName} home`}>
          <img src={logoUrl} alt="" className="footer-logo" width="48" height="48" />
          <span className="footer-brand-copy">
            <span className="footer-brand-name">{siteData.shopName}</span>
            <span className="footer-bengali">{siteData.shopNameBengali}</span>
          </span>
        </a>

        <span className="footer-locality">Sabji Market, Fuljhore</span>

        <nav className="footer-links" aria-label="Footer">
          <a href="#menu">Cuts</a>
          <a href="#b2b">B2B</a>
          <a href="#payment">Payment</a>
          <a href="#location">Location</a>
          <a href="/admin">Admin</a>
        </nav>
      </div>
    </footer>
  );
}

function AdminApp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [adminProducts, setAdminProducts] = useState<AdminProductDraft[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    async function loadSession() {
      if (!isSupabaseConfigured) {
        setSessionReady(true);
        return;
      }

      const {data} = await supabase.auth.getSession();
      setIsSignedIn(Boolean(data.session));
      setSessionReady(true);
    }

    loadSession();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      fetchAdminData();
    }
  }, [isSignedIn]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError('');

    if (!isSupabaseConfigured) {
      setAuthError('Supabase env keys are missing.');
      return;
    }

    const {error} = await supabase.auth.signInWithPassword({email, password});

    if (error) {
      setAuthError(error.message);
      return;
    }

    setIsSignedIn(true);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setIsSignedIn(false);
    setAdminProducts([]);
    setBookings([]);
  }

  async function fetchAdminData() {
    setAdminError('');

    const [productsResult, bookingsResult] = await Promise.all([
      supabase
        .from('products')
        .select('id,name,name_bengali,price_per_kg,is_available,display_order,updated_at')
        .order('display_order', {ascending: true}),
      supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', {ascending: false})
        .limit(10),
    ]);

    if (productsResult.error) {
      setAdminError(productsResult.error.message);
      return;
    }

    setAdminProducts(
      normalizeProducts((productsResult.data ?? []) as Product[]).map((product) => ({
        ...product,
        draftPrice: String(Math.round(product.price_per_kg)),
        saveState: 'idle',
      })),
    );

    if (!bookingsResult.error) {
      setBookings((bookingsResult.data ?? []) as Booking[]);
    }
  }

  function updateDraft(productId: string, patch: Partial<AdminProductDraft>) {
    setAdminProducts((current) =>
      current.map((product) => (product.id === productId ? {...product, ...patch, saveState: 'idle'} : product)),
    );
  }

  async function saveProduct(product: AdminProductDraft) {
    updateDraft(product.id, {saveState: 'saving'});

    const price = Number(product.draftPrice);
    const {error} = await supabase
      .from('products')
      .update({price_per_kg: price, is_available: product.is_available})
      .eq('id', product.id);

    updateDraft(product.id, {saveState: error ? 'error' : 'saved'});

    if (!error) {
      setTimeout(() => updateDraft(product.id, {saveState: 'idle'}), 1400);
    }
  }

  if (!sessionReady) {
    return (
      <main className="admin-shell">
        <Loader2 className="spin" />
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="admin-shell">
        <form className="admin-login" onSubmit={signIn}>
          <img src={logoUrl} alt="" className="footer-logo" />
          <p className="eyebrow">Owner Admin</p>
          <h1>Update today&apos;s rates fast.</h1>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            <span>Password</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          {authError && <p className="form-error">{authError}</p>}
          <button className="primary-cta" type="submit">
            <UserRound size={19} />
            Sign in
          </button>
          <a className="plain-link" href="/">
            Back to shop
          </a>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <div className="admin-header">
          <div>
            <p className="eyebrow">/admin</p>
            <h1>Today&apos;s counter rates</h1>
            <p>Large controls for quick phone updates.</p>
          </div>
          <button className="plain-link" type="button" onClick={signOut}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>

        {adminError && <p className="form-error">{adminError}</p>}

        <div className="admin-product-list">
          {adminProducts.map((product) => (
            <article className="admin-product" key={product.id}>
              <div>
                <h2>{product.name}</h2>
                <p>{product.name_bengali}</p>
              </div>
              <label>
                <span>₹ / kg</span>
                <input
                  value={product.draftPrice}
                  onChange={(event) => updateDraft(product.id, {draftPrice: event.target.value})}
                  inputMode="numeric"
                />
              </label>
              <label className="toggle-row admin-toggle">
                <input
                  type="checkbox"
                  checked={product.is_available}
                  onChange={(event) => updateDraft(product.id, {is_available: event.target.checked})}
                />
                <span>
                  <strong>{product.is_available ? 'Available' : 'Hidden'}</strong>
                  <small>{product.is_available ? 'গ্রাহক দেখতে পাবে' : 'এখন দেখাবে না'}</small>
                </span>
              </label>
              <button className="primary-cta compact" type="button" onClick={() => saveProduct(product)}>
                {product.saveState === 'saving' ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                {product.saveState === 'saved' ? 'Saved' : 'Save'}
              </button>
            </article>
          ))}
        </div>

        <div className="pending-bookings">
          <h2>Pending bookings</h2>
          {bookings.length === 0 ? (
            <p>No pending bookings right now.</p>
          ) : (
            bookings.map((booking) => (
              <article key={booking.id}>
                <strong>#{booking.order_code}</strong>
                <span>{booking.customer_name} · {booking.phone}</span>
                <span>{formatWeight(Number(booking.weight_kg))} {booking.product_name} · {booking.pickup_time}</span>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
