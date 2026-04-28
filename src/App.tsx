import { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ShoppingBag,
} from 'lucide-react';
import { siteData } from './data';

const logoUrl = new URL('../assets/logo.jpeg', import.meta.url).href;
const paymentQrUrl = new URL('../assets/QR1.png', import.meta.url).href;
const googleReviewQrUrl = new URL('../assets/Shop_GoogleQR.png', import.meta.url).href;

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

export default function App() {
  const [openFaq, setOpenFaq] = useState(0);

  const callLink = `tel:${siteData.phone.replace(/\s+/g, '')}`;
  const isOpenNow = useMemo(() => {
    const now = getKolkataMinutes();
    return (
      now >= siteData.openingHours.startHour * 60 &&
      now < siteData.openingHours.endHour * 60
    );
  }, []);

  const generalOrderMessage =
    `Hi ${siteData.shopName}, please share today's chicken rate and availability. ` +
    `I am near Fuljhore / Durgapur.`;

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

              <div className="hero-actions" aria-label="Primary ordering actions">
                <a className="primary-cta" href={buildWhatsappLink(generalOrderMessage)}>
                  <MessageCircle size={21} />
                  Ask today's rate
                </a>
                <a className="plain-link" href="#menu">
                  See cuts
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
                  <span>{siteData.deliveryArea}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Shop promises">
          <div className="site-container proof-grid">
            <p>
              <CheckCircle2 size={18} />
              Cut after order confirmation
            </p>
            <p>
              <CheckCircle2 size={18} />
              Cleaned and packed for home cooking
            </p>
            <p>
              <CheckCircle2 size={18} />
              WhatsApp first, then pay
            </p>
          </div>
        </section>

        <section id="menu" className="section-block menu-section">
          <div className="site-container">
            <div className="section-heading">
              <p className="eyebrow">Menu</p>
              <h2>Ask for today's rate before ordering.</h2>
              <p>
                Rates can change through the day. Pick a cut, send the WhatsApp message,
                and we will confirm availability before payment.
              </p>
            </div>

            <div className="menu-list">
              {siteData.menuItems.map((item) => {
                const message =
                  `Hi ${siteData.shopName}, please share today's rate and availability for ` +
                  `${item.name} (${item.weight}).`;

                return (
                  <article className="menu-item" key={item.id}>
                    <div>
                      <div className="menu-title-row">
                        <h3>{item.name}</h3>
                        <span>{item.note}</span>
                      </div>
                      <p className="bengali-name">{item.bengaliName}</p>
                      <p>{item.detail}</p>
                    </div>
                    <div className="menu-action">
                      <span>{item.weight}</span>
                      <a href={buildWhatsappLink(message)}>
                        Ask today's rate
                        <MessageCircle size={17} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-block order-section">
          <div className="site-container order-grid">
            <div className="section-heading align-left">
              <p className="eyebrow">How orders work</p>
              <h2>Simple, clear, no surprise payment.</h2>
              <p>
                This page is for quick ordering, not prepaid checkout. The shop confirms
                the rate and delivery timing first.
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

        <section className="section-block action-section" id="payment">
          <div className="site-container action-grid">
            <article className="qr-panel payment-panel">
              <div className="qr-copy">
                <p className="eyebrow">Payment</p>
                <h2>Pay after we confirm your order.</h2>
                <p>
                  Scan the UPI QR only after we reply with the final amount. If you pay
                  early, call us so we can match the payment to your order.
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
                <a className="plain-link listing-link" href={siteData.googleProfileUrl} target="_blank" rel="noreferrer">
                  Open Google listing
                  <ExternalLink size={17} />
                </a>
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

        <section className="section-block location-section" id="location">
          <div className="site-container location-grid">
            <div>
              <p className="eyebrow">Visit or order</p>
              <h2>Find us at Sabji Market, Fuljhore.</h2>
              <p>
                Address: {siteData.address}. Call before coming, or send a WhatsApp
                message for today's fresh cuts.
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
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

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
                    `Please help with today's rate / order details.`;

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
      </main>

      <footer className="site-footer">
        <div className="site-container footer-inner">
          <div className="footer-brand">
            <img src={logoUrl} alt="" className="footer-logo" width="48" height="48" />
            <p>{siteData.shopName}</p>
            <span className="footer-bengali">{siteData.shopNameBengali}</span>
            <span>{siteData.address}</span>
            <span className="footer-note">{siteData.footer.note}</span>
            <span className="footer-note footer-note-bengali">{siteData.footer.noteBengali}</span>
          </div>

          <div className="footer-meta">
            <div>
              <p className="footer-label">Open daily</p>
              <span>{siteData.timing}</span>
            </div>
            <div>
              <p className="footer-label">Best for</p>
              <span>Rate checks, cut requests, and nearby home orders.</span>
            </div>
          </div>

          <div className="footer-contact">
            <div className="footer-actions">
              <a className="footer-action secondary" href={callLink}>
                <Phone size={18} />
                {siteData.phone}
              </a>
              <a className="footer-action primary" href={buildWhatsappLink(generalOrderMessage)}>
                <MessageCircle size={18} />
                Order on WhatsApp
              </a>
            </div>

            <div className="footer-links">
              <a href="#menu">Cuts</a>
              <a href="#payment">Payment</a>
              <a href="#location">Location</a>
              <a href={siteData.googleProfileUrl} target="_blank" rel="noreferrer">
                Google listing
              </a>
            </div>
          </div>
        </div>
      </footer>

      <nav className="mobile-order-bar" aria-label="Mobile quick order actions">
        <a href={callLink}>
          <Phone size={18} />
          Call
        </a>
        <a href={buildWhatsappLink(generalOrderMessage)}>
          <MessageCircle size={18} />
          Ask rate
        </a>
      </nav>
    </div>
  );
}
