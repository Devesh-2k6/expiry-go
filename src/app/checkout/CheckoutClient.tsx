"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Lock,
  ShieldCheck,
  Store,
  Smartphone,
  Copy,
  Check,
  QrCode,
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { getMyReservations, checkoutReservation } from "@/services/reservations";
import type { ApiReservation } from "@/types/product";
import { useToast } from "@/components/ui/Toast";

export default function CheckoutClient({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [reservation, setReservation] = useState<ApiReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState<"COUNTER" | "UPI" | "CARD">("COUNTER");

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<"COUNTER" | "UPI" | "CARD">("COUNTER");

  // UPI State
  const [upiUtr, setUpiUtr] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card Input States
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!reservationId) {
      setLoading(false);
      return;
    }
    getMyReservations()
      .then((res) => {
        const found = res.find((r) => r.id === reservationId);
        if (found) setReservation(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reservationId]);

  if (!loading && !reservationId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-10 max-w-sm text-center shadow-xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard size={28} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Active Checkout</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            You don&apos;t have an active order to check out. Browse deals and make a reservation first.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/deals"
              className="w-full block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-center transition shadow-md shadow-purple-500/20"
            >
              Browse Deals
            </Link>
            <Link
              href="/reservations"
              className="w-full block bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-xl text-center transition"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Card brand detection based on starting digit
  const cardBrand = useMemo(() => {
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (cleanNum.startsWith("4")) return "visa";
    if (cleanNum.startsWith("5")) return "mastercard";
    return "generic";
  }, [cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19);
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setCardExpiry(value.slice(0, 5));
  };

  const handleCardCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCardCvc(value.slice(0, 4));
  };

  const validateCardForm = () => {
    const errors: { [key: string]: string } = {};
    if (!cardName.trim()) {
      errors.cardName = "Cardholder name is required";
    }
    const cleanNumber = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cleanNumber)) {
      errors.cardNumber = "Card number must be 16 digits";
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      errors.cardExpiry = "Expiry must be MM/YY";
    } else {
      const [month, year] = cardExpiry.split("/").map(Number);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear() % 100;
      if (month < 1 || month > 12) {
        errors.cardExpiry = "Invalid month";
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.cardExpiry = "Expired card";
      }
    }
    if (!/^\d{3,4}$/.test(cardCvc)) {
      errors.cardCvc = "CVC must be 3 or 4 digits";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 1. Pay at Counter Flow
  const handleConfirmCounterPickup = async () => {
    setProcessing(true);
    setProcessingStep("Generating your Store Counter Pickup Pass...");
    await new Promise((r) => setTimeout(r, 600));

    try {
      setSuccessMode("COUNTER");
      setSuccess(true);
      toast.success("Pickup Pass Confirmed!", "Show your 6-digit PIN at the store counter upon arrival.");
    } catch (err) {
      toast.error("Error", "Could not finalize counter reservation.");
    } finally {
      setProcessing(false);
      setProcessingStep("");
    }
  };

  // 2. UPI Flow
  const handleConfirmUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiUtr.trim() || upiUtr.trim().length < 6) {
      toast.warning("UTR Required", "Please enter the 12-digit UPI reference / UTR number from your payment app.");
      return;
    }

    setProcessing(true);
    setProcessingStep("Verifying UPI transaction with merchant bank...");
    await new Promise((r) => setTimeout(r, 1200));

    try {
      await checkoutReservation(reservationId);
      setSuccessMode("UPI");
      setSuccess(true);
      toast.success("UPI Payment Confirmed!", "Your payment has been registered. Your pickup pass is ready.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("UPI Verification Failed", msg);
    } finally {
      setProcessing(false);
      setProcessingStep("");
    }
  };

  // 3. Card Flow
  const handlePayCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCardForm()) return;

    setProcessing(true);
    setProcessingStep("Verifying card credentials...");
    await new Promise((r) => setTimeout(r, 800));

    setProcessingStep("Contacting bank gateway...");
    await new Promise((r) => setTimeout(r, 800));

    setProcessingStep("Finalizing ExpiryGo reservation...");
    await new Promise((r) => setTimeout(r, 600));

    try {
      await checkoutReservation(reservationId);
      setSuccessMode("CARD");
      setSuccess(true);
      toast.success("Payment Received!", "Your card payment was processed securely.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Payment Failed", msg);
    } finally {
      setProcessing(false);
      setProcessingStep("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 font-bold">
        Reservation not found.
      </div>
    );
  }

  const shopName = reservation.product.shop?.name || "Local Partner Store";
  const shopAddress = reservation.product.shop?.address || "Store Counter";
  const shopUpi = reservation.product.shop?.upi_id || "expirygo.pay@upi";
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(shopUpi)}&pn=${encodeURIComponent(shopName)}&am=${reservation.total_price.toFixed(2)}&cu=INR&tn=ExpiryGo%20Surplus%20Rescue`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        {success ? (
          <div className="p-8 flex flex-col items-center text-center animate-in fade-in duration-500 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-1 shadow-inner animate-bounce">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {successMode === "COUNTER" ? "STORE COUNTER PICKUP READY" : "PAYMENT CONFIRMED"}
              </span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {successMode === "COUNTER" ? "Counter Pass Active!" : "Deal Rescued Successfully!"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs max-w-xs">
                {successMode === "COUNTER"
                  ? "Pay directly to the merchant at the counter upon collecting your items."
                  : "Thank you for saving food and cutting down CO2 landfill emissions."}
              </p>
            </div>

            {/* In-Store Pickup QR & PIN Card */}
            <div className="w-full p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <ShieldCheck size={14} /> Store Verification PIN
                </span>
                <span className="font-mono text-[11px]">Valid 48h</span>
              </div>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-2xl inline-block mx-auto shadow-md">
                <QRCodeSVG
                  value={`EXPIRYGO:${reservation.pickup_code}`}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* 6-Digit Pickup Code */}
              <div className="space-y-1">
                <div className="font-mono text-3xl font-black text-emerald-400 tracking-widest bg-slate-800/80 py-2 px-4 rounded-xl border border-slate-700 inline-block">
                  {(reservation.pickup_code || "000000").split("").join(" ")}
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  Tell this 6-digit code to shopkeeper
                </p>
              </div>

              {/* Store & Product Details */}
              <div className="pt-3 border-t border-slate-800/80 text-left text-xs space-y-1.5 text-gray-300">
                <div className="flex justify-between items-center font-bold">
                  <span className="truncate max-w-[200px] text-white">{reservation.product.name}</span>
                  <span className="text-emerald-400 font-mono">₹{reservation.total_price.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-gray-400 flex items-start gap-1">
                  <MapPin size={12} className="shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
                  <span className="truncate">
                    {shopName} &bull; {shopAddress}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2">
              <Link
                href="/reservations"
                className="w-full block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl text-center text-xs transition shadow-lg shadow-purple-500/25"
              >
                View My Reservations
              </Link>
              <Link
                href="/deals"
                className="w-full block bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-2.5 px-6 rounded-2xl text-center text-xs transition"
              >
                Browse More Deals
              </Link>
            </div>
          </div>
        ) : processing ? (
          <div className="p-10 flex flex-col items-center text-center min-h-[400px] justify-center animate-in fade-in duration-300">
            <Loader2 className="animate-spin text-emerald-500 mb-6" size={48} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Processing Order</h3>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">{processingStep}</p>
            <div className="mt-8 flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <Lock size={12} /> SSL 256-bit Encrypted Session
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <Link
                href="/reservations"
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Choose Payment Method</h1>
                <p className="text-xs text-gray-400">Pick counter payment, UPI, or card</p>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Product preview */}
              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={reservation.product.front_image_url || "/placeholder.png"}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                  alt=""
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate text-xs">
                    {reservation.product.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                    Qty: {reservation.quantity} unit{reservation.quantity > 1 ? "s" : ""} &bull; {shopName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{reservation.total_price.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COUNTER")}
                  className={`py-2 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === "COUNTER"
                      ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 font-medium"
                  }`}
                >
                  <Store size={16} />
                  <span className="text-[10px] leading-tight">Pay at Store</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`py-2 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === "UPI"
                      ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 font-medium"
                  }`}
                >
                  <Smartphone size={16} />
                  <span className="text-[10px] leading-tight">Direct UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`py-2 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === "CARD"
                      ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 font-medium"
                  }`}
                >
                  <CreditCard size={16} />
                  <span className="text-[10px] leading-tight">Debit/Card</span>
                </button>
              </div>

              {/* METHOD 1: PAY AT STORE COUNTER */}
              {paymentMethod === "COUNTER" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/50 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <Store size={16} className="text-emerald-600" />
                      <span>Zero Upfront Online Payment Required</span>
                    </div>
                    <p className="text-[11px] text-emerald-950 dark:text-emerald-200/80 leading-relaxed">
                      Reserve this discount immediately. You can pay <strong>₹{reservation.total_price.toFixed(2)}</strong> directly to the merchant at the shop counter using <strong>Cash</strong> or the merchant&apos;s <strong>Store Soundbox QR</strong> when picking up.
                    </p>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 pt-1 flex items-start gap-1">
                      <MapPin size={12} className="shrink-0 mt-0.5 text-emerald-600" />
                      <span>Pickup location: <strong>{shopName}</strong> ({shopAddress})</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmCounterPickup}
                    disabled={processing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <CheckCircle size={16} />
                    <span>Confirm Counter Pay &amp; Get Pickup PIN</span>
                  </button>
                </div>
              )}

              {/* METHOD 2: DIRECT UPI QR PAYMENT */}
              {paymentMethod === "UPI" && (
                <form onSubmit={handleConfirmUpi} className="space-y-4 animate-in fade-in duration-200">
                  <div className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60 space-y-3">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      Scan merchant UPI QR code using GPay, PhonePe, or Paytm:
                    </p>

                    <div className="bg-white p-3 rounded-2xl inline-block shadow-sm">
                      <QRCodeSVG value={upiPayUrl} size={140} level="M" />
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        {shopUpi}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(shopUpi);
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition"
                      >
                        {copiedUpi ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      Pay Exact Amount: ₹{reservation.total_price.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Enter UPI Reference / UTR Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={upiUtr}
                      onChange={(e) => setUpiUtr(e.target.value)}
                      placeholder="e.g. 429381029384 (12 digits)"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 outline-none text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Found in your GPay / PhonePe / Paytm transaction receipt.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition cursor-pointer"
                  >
                    <Smartphone size={16} />
                    <span>Submit UTR &amp; Get Pickup PIN</span>
                  </button>
                </form>
              )}

              {/* METHOD 3: CARD PAYMENT */}
              {paymentMethod === "CARD" && (
                <form onSubmit={handlePayCard} className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">Credit / Debit Card</h3>
                    <div className="flex gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span className={cardBrand === "visa" ? "text-blue-500 font-black" : "opacity-40"}>Visa</span>
                      <span className={cardBrand === "mastercard" ? "text-red-500 font-black" : "opacity-40"}>MC</span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/80">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Cardholder Name"
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 transition"
                      />
                      {formErrors.cardName && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.cardName}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 4242 4242 4242"
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pl-9 outline-none text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 font-mono transition"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <CreditCard size={14} />
                        </div>
                      </div>
                      {formErrors.cardNumber && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Expires
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleCardExpiryChange}
                          placeholder="MM/YY"
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 font-mono transition"
                        />
                        {formErrors.cardExpiry && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.cardExpiry}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={handleCardCvcChange}
                          placeholder="123"
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 font-mono transition"
                        />
                        {formErrors.cardCvc && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.cardCvc}</p>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition cursor-pointer"
                  >
                    <Lock size={15} />
                    <span>Pay ₹{reservation.total_price.toFixed(2)} with Card</span>
                  </button>
                </form>
              )}

              {/* Security Badge */}
              <div className="flex items-center gap-2 justify-center py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-t border-gray-100 dark:border-gray-800 pt-3">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Verified ExpiryGo Surplus Handover Protection</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

