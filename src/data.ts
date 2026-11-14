import type {CutStyle, Product} from './lib/supabase';

export type ProductCategory =
  | 'All Cuts'
  | 'Curry Cuts'
  | 'Boneless'
  | 'Wings & Drumsticks'
  | 'Specials';

export const productCategories: ProductCategory[] = [
  'All Cuts',
  'Curry Cuts',
  'Boneless',
  'Wings & Drumsticks',
  'Specials',
];

export const siteData = {
  shopName: 'Bikash Chicken Point',
  shopNameBengali: 'বিকাশ চিকেন পয়েন্ট',
  tagline: 'Fresh chicken cut after you pre-book',
  phone: '+91 96350 21694',
  whatsapp: '919635021694',
  deliveryArea: 'Fuljhore, Durgapur',
  pickupNote: 'Fresh daily dressing at Fuljhore Sabji Market, Durgapur',
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
  upiId: '9635021694@okbizaxis',
  hero: {
    eyebrow: 'আজকের তাজা কাট · Fresh Daily Cuts',
    title: 'Fresh chicken, dressed and cut after you order.',
    subtitle:
      "We dress and cut your chicken only after you book or walk in, never from freezer trays. Pick your cut and pack weight on WhatsApp, confirm today's rate, and pick up at Fuljhore Sabji Market.",
  },
  fastTrack: {
    english: 'WhatsApp Pre-Booking: Skip the counter wait.',
    bengali: 'হোয়াটসঅ্যাপ বুকিং: কাউন্টারে অপেক্ষা ছাড়াই পিকআপ',
  },
  booking: {
    title: 'Your Order Cart',
    titleBengali: 'আপনার অর্ডার কার্ট',
    invoiceLabel: 'Request GST/Formal Invoice',
    invoiceLabelBengali: 'GST / ফরমাল ইনভয়েস চাই',
  },
  b2b: {
    eyebrow: 'Bulk & Party Orders',
    title: 'Planning a family gathering, catering event, or hotel supply?',
    body:
      'Order ahead for family functions, hostels, roll counters, or local hotels. We cut to your piece count for morning pickup and provide a GST or formal bill when needed.',
    bodyBengali:
      'হোটেল, রোল কাউন্টার, ক্যাটারিং বা পারিবারিক অনুষ্ঠানের জন্য আগে থেকে পরিমাণ জানিয়ে রাখুন। দরকার হলে ফরমাল ইনভয়েস পাবেন।',
  },
  menuDetails: {
    'curry-cut': {
      category: 'Curry Cuts' as ProductCategory,
      spec: 'Skinless · Bone-in · Medium',
      detail: 'Skinless bone-in pieces cut evenly for everyday home chicken curry.',
      badge: 'Most Popular',
      weight: '500g / 1kg',
    },
    'whole-chicken': {
      category: 'Curry Cuts' as ProductCategory,
      spec: 'Full Bird · Custom Cut',
      detail: 'Full dressed bird cleaned and cut to the piece size you ask for.',
      badge: undefined,
      weight: '500g / 1kg',
    },
    'boneless-breast': {
      category: 'Boneless' as ProductCategory,
      spec: '100% Boneless · Lean Cubes',
      detail: 'Clean, fat-trimmed boneless breast pieces for chili chicken, tikka, or pan-fry.',
      badge: 'Lean Cubes',
      weight: '500g / 1kg',
    },
    drumsticks: {
      category: 'Wings & Drumsticks' as ProductCategory,
      spec: 'Whole Drumsticks · Skinless',
      detail: 'Whole chicken drumsticks cleaned for tandoori roast, fry, or home biryani.',
      badge: undefined,
      weight: '500g / 1kg',
    },
    'leg-pieces': {
      category: 'Wings & Drumsticks' as ProductCategory,
      spec: 'Whole Leg · Biryani Size',
      detail: 'Large leg and thigh pieces cut for biryani, rezala, and kosha.',
      badge: 'Biryani Cut',
      weight: '500g / 1kg',
    },
    keema: {
      category: 'Boneless' as ProductCategory,
      spec: 'Hand-Minced · Zero Bone',
      detail: 'Boneless chicken minced fresh on the block for kebabs, tadka, and stuffed parathas.',
      badge: undefined,
      weight: '500g / 1kg',
    },
    'liver-gizzard': {
      category: 'Specials' as ProductCategory,
      spec: 'Cleaned · Membrane-Trimmed',
      detail: 'Fresh liver and gizzard pack, washed clean and membrane-trimmed.',
      badge: undefined,
      weight: '500g / 1kg',
    },
    'bulk-party': {
      category: 'Specials' as ProductCategory,
      spec: 'Event Pack · Custom Cut',
      detail: 'Larger orders cut to size for family functions, hostels, and local eateries.',
      badge: undefined,
      weight: '500g / 1kg',
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
        'Yes. The shop updates the daily rate when prices change. Please still confirm at the counter before payment.',
      answerBengali:
        'হ্যাঁ। দোকান থেকে প্রতিদিনের রেট আপডেট করা যাবে। পেমেন্টের আগে কাউন্টারে একবার নিশ্চিত করুন।',
    },
    {
      id: 'cut-size',
      tag: 'Cut style',
      question: 'Can I choose the cut style?',
      questionBengali: 'আমি কি কাটের ধরন বেছে নিতে পারি?',
      answer:
        'Yes. Choose curry, biryani, or fry cut while ordering.',
      answerBengali:
        'হ্যাঁ। বুক করার সময় কারি, বিরিয়ানি বা ফ্রাই কাট বেছে নিতে পারবেন।',
    },
    {
      id: 'payment',
      tag: 'Payment',
      question: 'When should I pay?',
      questionBengali: 'কখন পেমেন্ট করব?',
      answer:
        'Please pay only after we confirm your order number, weight, and final amount.',
      answerBengali:
        'দোকানে অর্ডার নম্বর, ওজন আর ফাইনাল টাকা নিশ্চিত করার পরেই পেমেন্ট করুন।',
    },
    {
      id: 'bulk-order',
      tag: 'Bulk order',
      question: 'Do you take hotel or restaurant orders?',
      questionBengali: 'হোটেল বা রেস্টুরেন্টের অর্ডার নেন?',
      answer:
        'Yes. Use the cart for normal quantities. For bigger orders, call ahead and request a formal invoice if needed.',
      answerBengali:
        'হ্যাঁ। সাধারণ পরিমাণের জন্য বুক করুন। বড় অর্ডারের জন্য আগে কল করুন, দরকার হলে ফরমাল ইনভয়েস চাইতে পারেন।',
    },
  ],
};

export const fallbackProducts: Product[] = [
  {
    id: 'curry-cut',
    name: 'Curry Cut',
    name_bengali: 'কারি কাট',
    price_per_kg: 220,
    is_available: true,
    display_order: 10,
  },
  {
    id: 'whole-chicken',
    name: 'Whole Chicken Cut',
    name_bengali: 'পুরো চিকেন কাট',
    price_per_kg: 210,
    is_available: true,
    display_order: 20,
  },
  {
    id: 'boneless-breast',
    name: 'Boneless Breast',
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
    name: 'Leg & Thigh Pieces',
    name_bengali: 'থাই ও লেগ',
    price_per_kg: 280,
    is_available: true,
    display_order: 50,
  },
  {
    id: 'keema',
    name: 'Chicken Keema',
    name_bengali: 'চিকেন কিমা',
    price_per_kg: 320,
    is_available: true,
    display_order: 60,
  },
  {
    id: 'liver-gizzard',
    name: 'Liver & Gizzard',
    name_bengali: 'লিভার ও গিজার্ড',
    price_per_kg: 180,
    is_available: true,
    display_order: 70,
  },
  {
    id: 'bulk-party',
    name: 'Bulk / Party Pack',
    name_bengali: 'বড় অর্ডার প্যাক',
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
