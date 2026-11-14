import React from 'react';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Product, CutStyle } from '../../lib/supabase';
import { siteData, pickupOptions } from '../../data';
import { Button } from './Button';
import { Badge } from './Badge';
import { FieldInput } from './Field';
import {
  CheckboxInput,
  Drawer,
  DrawerHeader,
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core';
import qrUpiUrl from '../../../assets/QR1.png';

export type WeightUnit = '500g' | '1kg';

export interface CartItem {
  key: string; // `${product.id}-${weightUnit}`
  product: Product;
  weightUnit: WeightUnit;
  weightKg: number; // 0.5 or 1
  unitPrice: number; // price for 500g or 1kg
  quantity: number;
}

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
  selectedCut: CutStyle;
  onSelectCut: (cut: CutStyle) => void;
  selectedPickup: string;
  onSelectPickup: (pickup: string) => void;
  customerName: string;
  onCustomerNameChange: (val: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (val: string) => void;
  requestInvoice: boolean;
  onRequestInvoiceChange: (val: boolean) => void;
  onSubmitOrder: (e: React.FormEvent<HTMLFormElement>) => void;
  orderConfirmed: { code: string; message: string } | null;
}

const CUT_PREP_SEGMENTS: Array<{ value: CutStyle; label: string }> = [
  { value: 'curry', label: 'Curry' },
  { value: 'biryani', label: 'Biryani' },
  { value: 'fry', label: 'Fry' },
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedCut,
  onSelectCut,
  selectedPickup,
  onSelectPickup,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  requestInvoice,
  onRequestInvoiceChange,
  onSubmitOrder,
  orderConfirmed,
}) => {
  const totalWeightKg = items.reduce(
    (sum, item) => sum + item.weightKg * item.quantity,
    0,
  );
  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      side="end"
      width={420}
      label="Your Order Cart"
    >
      <div className="flex flex-col min-h-full">
        <DrawerHeader
          title={`${siteData.booking.title} · ${siteData.booking.titleBengali}`}
          subtitle="Cut fresh after you order · Confirm rate & weight at counter"
          onOpenChange={(open) => !open && onClose()}
          hasDivider
        />

        {/* Drawer Body */}
        <div className="flex-1 py-5 space-y-6">
          {orderConfirmed ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-semibold text-[#111314]">
                  Order #{orderConfirmed.code} Ready
                </h3>
                <p className="text-xs text-[#7c4226] max-w-xs mx-auto leading-relaxed">
                  {orderConfirmed.message}
                </p>
              </div>

              {/* Verified Counter Google Pay / BHIM UPI QR Card */}
              <div className="p-3.5 rounded-[var(--radius-concentric-panel)] bg-[#FAF7F2] border border-[#d8cab6] text-left flex items-center gap-3.5">
                <img
                  src={qrUpiUrl}
                  alt="Google Pay / BHIM UPI QR for Bikash Chicken Shop"
                  className="w-16 h-16 rounded-[var(--radius-concentric-control)] object-cover border border-[#d8cab6] bg-[#FFFFFF] p-1 flex-shrink-0"
                  width="64"
                  height="64"
                  loading="lazy"
                />
                <div className="min-w-0 space-y-0.5">
                  <span className="text-xs font-semibold text-[#111314] block">
                    Pay at Counter After Weighing
                  </span>
                  <p className="text-[11px] text-[#7c4226] leading-snug">
                    Scan our Google Pay / UPI standee at the counter or pay to{' '}
                    <code className="font-mono font-semibold text-[#6c2b11]">{siteData.upiId}</code> once final weight is confirmed.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <Button onClick={onClose} variant="secondary" size="sm">
                  Back to Shop
                </Button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-14 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-[var(--radius-control)] bg-[#f5ebd6]/70 border border-[#d8cab6] text-[#7c4226] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-base text-[#111314]">
                  Your cart is empty
                </h3>
                <p className="text-xs text-[#7c4226] max-w-xs mx-auto">
                  Select a weight (500g or 1kg) on any cut card and click + Add to build your fresh order.
                </p>
              </div>
              <Button onClick={onClose} variant="secondary" size="sm">
                Browse Fresh Cuts
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#7c4226]">
                  <span>Selected Cuts ({items.length})</span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="press-scale text-[#a84222] hover:text-[#6c2b11] hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="p-3.5 rounded-[var(--radius-concentric-panel)] bg-[#FAF7F2] border border-[#d8cab6] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-semibold text-sm text-[#111314] truncate">
                            {item.product.name}
                          </h4>
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-[var(--radius-concentric-control)] bg-[#f5ebd6] border border-[#d8cab6] text-[#6c2b11]">
                            {item.weightUnit}
                          </span>
                        </div>
                        <p className="text-xs text-[#7c4226] font-mono tabular-nums mt-0.5">
                          ₹{item.unitPrice} × {item.quantity} ={' '}
                          <span className="font-semibold text-[#111314]">
                            ₹{item.unitPrice * item.quantity}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.key, -1)}
                          aria-label={`Decrease quantity of ${item.product.name}`}
                          className="press-scale w-8 h-8 rounded-[var(--radius-concentric-control)] bg-[#FFFFFF] border border-[#d8cab6] text-[#111314] hover:bg-[#f5ebd6] hover:border-[#c2ae93] inline-flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-semibold text-[#111314] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.key, 1)}
                          aria-label={`Increase quantity of ${item.product.name}`}
                          className="press-scale w-8 h-8 rounded-[var(--radius-concentric-control)] bg-[#FFFFFF] border border-[#d8cab6] text-[#111314] hover:bg-[#f5ebd6] hover:border-[#c2ae93] inline-flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          aria-label={`Remove ${item.product.name}`}
                          className="press-scale w-8 h-8 rounded-[var(--radius-concentric-control)] text-[#7c4226] hover:text-[#a84222] hover:bg-[#a84222]/10 inline-flex items-center justify-center cursor-pointer ml-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Preferences & Customer Details Form */}
              <form id="cart-checkout-form" onSubmit={onSubmitOrder} className="space-y-4 pt-4 border-t border-[#d8cab6]">
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-[#111314]">
                    Cut Prep (কাটের ধরন)
                  </span>
                  <SegmentedControl
                    value={selectedCut}
                    onChange={(val) => onSelectCut(val as CutStyle)}
                    label="Preferred Cut Prep"
                    layout="fill"
                    size="sm"
                  >
                    {CUT_PREP_SEGMENTS.map((cut) => (
                      <SegmentedControlItem
                        key={cut.value}
                        value={cut.value}
                        label={cut.label}
                      />
                    ))}
                  </SegmentedControl>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-[#111314]">
                    Ready Timing (সময়)
                  </span>
                  <SegmentedControl
                    value={selectedPickup}
                    onChange={onSelectPickup}
                    label="Ready Timing"
                    layout="fill"
                    size="sm"
                  >
                    {pickupOptions.map((p) => (
                      <SegmentedControlItem
                        key={p.value}
                        value={p.value}
                        label={p.label}
                      />
                    ))}
                  </SegmentedControl>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#d8cab6]">
                  <FieldInput
                    label="Your Name (নাম)"
                    isRequired
                    value={customerName}
                    onChange={onCustomerNameChange}
                    placeholder="e.g. Subrata / Anirban"
                    autoComplete="name"
                  />

                  <FieldInput
                    type="tel"
                    label="10-Digit Mobile (ফোন নম্বর)"
                    description="10 digits without +91"
                    isRequired
                    value={customerPhone}
                    onChange={(val) => {
                      const cleaned = val.replace(/\D/g, '').slice(0, 10);
                      onCustomerPhoneChange(cleaned);
                    }}
                    placeholder="9635021694"
                    autoComplete="tel"
                  />

                  <div className="pt-1">
                    <CheckboxInput
                      label={`${siteData.booking.invoiceLabel} (${siteData.booking.invoiceLabelBengali})`}
                      description="Formal GST-compliant invoice for business or catering orders"
                      value={requestInvoice}
                      onChange={onRequestInvoiceChange}
                    />
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Sticky Footer */}
        {!orderConfirmed && items.length > 0 && (
          <div className="pt-4 border-t border-[#d8cab6] bg-[#FFFFFF] space-y-3 mt-auto">
            <div className="p-3.5 bg-[#FAF7F2] border border-[#d8cab6] rounded-[var(--radius-concentric-panel)] surface-bezel flex items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[#7c4226] block font-medium">
                  Estimated Total ({totalWeightKg.toFixed(1)} kg)
                </span>
                <span className="font-bold font-mono text-base text-[#111314] tabular-nums">
                  ~₹{totalAmount}
                </span>
              </div>
              <div className="text-right space-y-1">
                <Badge tone="whatsapp" label="Pay After Weighing" />
                <p className="text-[11px] text-[#7c4226]">Confirm rate & scale weight at counter</p>
              </div>
            </div>

            <Button
              type="submit"
              form="cart-checkout-form"
              variant="primary"
              tone="crimson"
              size="md"
              className="w-full"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Order via WhatsApp</span>
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
};
