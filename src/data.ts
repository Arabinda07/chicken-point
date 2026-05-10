import type {CutStyle, Product} from './lib/supabase';

export const siteData = {
  shopName: 'Bikash Chicken Point',
  shopNameBengali: 'বিকাশ চিকেন পয়েন্ট',
  tagline: 'Fresh chicken cut after you pre-book',
  phone: '+91 96350 21694',
  whatsapp: '919635021694',
  pickupNote: 'Walk-in pickup only from Fuljhore Sabji Market, Durgapur',
  address: 'Sabji Market, Fuljhore, Durgapur-713206, West Bengal',
  timing: 'Open daily, 8:00 AM - 9:00 PM',
  udyamRegistrationNumber: 'UDYAM-I-WB-23-8437469',
  openingHours: {
    startHour: 8,
    endHour: 21,
  },
  googleProfileUrl: 'https://share.google/B1iUixv7uA7BVarqb',
  mapEmbedUrl:
    'https://maps.google.com/maps?q=Sabji%20Market,%20Fuljhore,%20Durgapur-713206,%20West%20Bengal&t=&z=16&ie=UTF8&iwloc=&output=embed',
  upiId: 'Q393575257@ybl',
  hero: {
    eyebrow: 'আজকের তাজা কাট',
    title: 'Pre-book fresh chicken. Pick up without waiting.',
    subtitle:
      'Choose weight and cut style before you leave home. We keep it ready for walk-in pickup at Fuljhore Sabji Market.',
  },
  fastTrack: {
    english: 'Online Pre-Bookings: Pick up in 2 mins.',
    bengali: 'অনলাইন বুকিং: ২ মিনিটে পিকআপ',
  },
  booking: {
    title: 'Pre-Book for Pickup',
    titleBengali: 'পিকআপের জন্য বুক করুন',
    invoiceLabel: 'Request GST/Formal Invoice',
    invoiceLabelBengali: 'GST / ফরমাল ইনভয়েস চাই',
  },
  b2b: {
    eyebrow: 'For Restaurants/Hotels',
    title: 'Bulk pickup with formal papers when you need them.',
    body:
      'For hotels, roll counters, caterers, and small restaurants: pre-book your quantity, request a formal invoice, and pick up from the shop counter.',
    bodyBengali:
      'হোটেল, রোল কাউন্টার, ক্যাটারিং বা রেস্টুরেন্টের জন্য আগে থেকে পরিমাণ জানিয়ে রাখুন। দরকার হলে ফরমাল ইনভয়েস চাইতে পারেন।',
  },
  menuDetails: {
    'curry-cut': {
      detail: 'Bone-in pieces for daily home cooking.',
      note: 'Most ordered',
      weight: '0.5kg / 1kg',
    },
    'whole-chicken': {
      detail: 'Cleaned and cut to your preferred size.',
      note: 'Family order',
      weight: 'By bird weight',
    },
    'boneless-breast': {
      detail: 'Lean pieces for snacks, curry, and meal prep.',
      note: 'Lean cut',
      weight: '0.5kg / 1kg',
    },
    drumsticks: {
      detail: 'Good for fry, roast, and biryani prep.',
      note: 'Party favorite',
      weight: '0.5kg / 1kg',
    },
    'leg-pieces': {
      detail: 'Juicy bone-in pieces for richer curries.',
      note: 'Call to confirm',
      weight: '0.5kg / 1kg',
    },
    keema: {
      detail: 'Fresh mince for rolls, paratha, and cutlets.',
      note: 'Fresh ground',
      weight: '0.5kg / 1kg',
    },
    'liver-gizzard': {
      detail: 'Availability changes through the day.',
      note: 'Ask first',
      weight: 'As available',
    },
    'bulk-party': {
      detail: 'Tell us the date, quantity, and cut style.',
      note: '24h notice helps',
      weight: 'Custom quantity',
    },
  },
  orderSteps: [
    {
      title: 'Choose cut, weight, and pickup time',
      body: 'Select what you need before coming to the shop.',
    },
    {
      title: 'We cut and pack',
      body: 'Your chicken is cleaned, cut, and packed after the pre-booking reaches us.',
    },
    {
      title: 'Walk in, confirm, then pay',
      body: 'Show the order number at the counter. Pay only after we confirm the final amount.',
    },
  ],
  faqSection: {
    eyebrow: 'Questions / প্রশ্ন',
    title: 'Quick answers in English and Bengali.',
    subtitle:
      'Start here for pickup timing, cut size, payment timing, and bigger family or shop orders.',
    helpTitle: 'Need a faster answer?',
    helpBody:
      'Call for the quickest reply. WhatsApp is best when you want to mention the cut, weight, and pickup time together.',
    helpBodyBengali:
      'খুব তাড়াতাড়ি উত্তর চাইলে কল করুন। কাট, ওজন আর পিকআপ সময় একসাথে জানাতে চাইলে WhatsApp সবচেয়ে সুবিধাজনক।',
  },
  faqs: [
    {
      id: 'rates',
      tag: 'Rate check',
      question: 'Do prices update on the site?',
      questionBengali: 'ওয়েবসাইটে কি দাম আপডেট হয়?',
      answer:
        'Yes. The owner can update the daily rate from the admin page. Please still confirm at the counter before payment.',
      answerBengali:
        'হ্যাঁ। দোকান থেকে প্রতিদিনের রেট আপডেট করা যাবে। পেমেন্টের আগে কাউন্টারে একবার নিশ্চিত করুন।',
    },
    {
      id: 'cut-size',
      tag: 'Cut style',
      question: 'Can I choose the cut style?',
      questionBengali: 'আমি কি কাটের ধরন বেছে নিতে পারি?',
      answer:
        'Yes. Choose curry, biryani, or fry cut while pre-booking.',
      answerBengali:
        'হ্যাঁ। বুক করার সময় কারি, বিরিয়ানি বা ফ্রাই কাট বেছে নিতে পারবেন।',
    },
    {
      id: 'payment',
      tag: 'Payment',
      question: 'When should I pay?',
      questionBengali: 'কখন পেমেন্ট করব?',
      answer:
        'Please pay only after we confirm your order number, weight, and final amount at the shop.',
      answerBengali:
        'দোকানে অর্ডার নম্বর, ওজন আর ফাইনাল টাকা নিশ্চিত করার পরেই পেমেন্ট করুন।',
    },
    {
      id: 'bulk-order',
      tag: 'Bulk order',
      question: 'Do you take hotel or restaurant orders?',
      questionBengali: 'হোটেল বা রেস্টুরেন্টের অর্ডার নেন?',
      answer:
        'Yes. Use pre-booking for normal quantities. For bigger orders, call ahead and request a formal invoice if needed.',
      answerBengali:
        'হ্যাঁ। সাধারণ পরিমাণের জন্য প্রি-বুক করুন। বড় অর্ডারের জন্য আগে কল করুন, দরকার হলে ফরমাল ইনভয়েস চাইতে পারেন।',
    },
  ],
};

export const fallbackProducts: Product[] = [
  {
    id: 'curry-cut',
    name: 'Curry cut',
    name_bengali: 'কারি কাট',
    price_per_kg: 220,
    is_available: true,
    display_order: 10,
  },
  {
    id: 'whole-chicken',
    name: 'Whole chicken cut',
    name_bengali: 'পুরো চিকেন কাট',
    price_per_kg: 210,
    is_available: true,
    display_order: 20,
  },
  {
    id: 'boneless-breast',
    name: 'Boneless breast',
    name_bengali: 'বোনলেস ব্রেস্ট',
    price_per_kg: 360,
    is_available: true,
    display_order: 30,
  },
  {
    id: 'drumsticks',
    name: 'Drumsticks',
    name_bengali: 'লেগ পিস',
    price_per_kg: 280,
    is_available: true,
    display_order: 40,
  },
  {
    id: 'leg-pieces',
    name: 'Leg pieces',
    name_bengali: 'থাই ও লেগ',
    price_per_kg: 280,
    is_available: true,
    display_order: 50,
  },
  {
    id: 'keema',
    name: 'Chicken keema',
    name_bengali: 'চিকেন কিমা',
    price_per_kg: 320,
    is_available: true,
    display_order: 60,
  },
  {
    id: 'liver-gizzard',
    name: 'Liver & gizzard',
    name_bengali: 'লিভার ও গিজার্ড',
    price_per_kg: 180,
    is_available: false,
    display_order: 70,
  },
  {
    id: 'bulk-party',
    name: 'Bulk / party order',
    name_bengali: 'বড় অর্ডার',
    price_per_kg: 210,
    is_available: true,
    display_order: 80,
  },
];

export const weightOptions = [
  {label: '0.5kg', value: 0.5},
  {label: '1kg', value: 1},
  {label: '1.5kg', value: 1.5},
  {label: '2kg', value: 2},
];

export const cutStyleOptions: Array<{label: string; value: CutStyle; whatsappLabel: string}> = [
  {label: 'Curry / কারি', value: 'curry', whatsappLabel: 'Curry Cut'},
  {label: 'Biryani / বিরিয়ানি', value: 'biryani', whatsappLabel: 'Biryani Cut'},
  {label: 'Fry / ফ্রাই', value: 'fry', whatsappLabel: 'Fry Cut'},
];

export const pickupOptions = [
  {label: 'ASAP', value: 'ASAP'},
  {label: '30 min', value: '30 min'},
  {label: '1 hour', value: '1 hour'},
];
