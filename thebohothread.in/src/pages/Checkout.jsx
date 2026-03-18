import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";

const STEPS = ["Delivery", "Payment", "Review", "Confirmed"];

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < current   ? "bg-indigo-500 border-indigo-500 text-white"
              : i === current ? "border-indigo-500 text-indigo-600 bg-indigo-50"
              : "border-gray-200 text-gray-300 bg-white"}`}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === current ? "text-indigo-600" : i < current ? "text-gray-500" : "text-gray-300"}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`h-0.5 w-12 sm:w-20 mx-2 mb-5 sm:mb-0 transition-all ${i < current ? "bg-indigo-500" : "bg-gray-200"}`}/>}
        </div>
      ))}
    </div>
  );
}

function InputGroup({ label, type="text", placeholder, value, onChange, half }) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} className="input-field"/>
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [step, setStep] = useState(0);

  const [addr, setAddr] = useState({
    name: user?.name ?? "", email: user?.email ?? "", phone: "",
    line1: "", line2: "", city: "", state: "", pin: "", country: "India",
  });
  const [payment, setPayment] = useState({ method: "card", cardNum: "", expiry: "", cvv: "", name: "", upi: "" });
  const [saving, setSaving]   = useState(false);
  const [orderId]             = useState(`ORD${Date.now()}`);

  const tax    = Math.round(subtotal * 0.18);
  const grand  = total + tax;

  const handleAddress = () => {
    if (!addr.name || !addr.phone || !addr.line1 || !addr.city || !addr.pin) {
      alert("Please fill all required fields."); return;
    }
    setStep(1);
  };

  const handlePayment = () => {
    if (payment.method === "card" && (!payment.cardNum || !payment.expiry || !payment.cvv)) {
      alert("Please fill card details."); return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    clearCart();
    setStep(3);
    setSaving(false);
  };

  if (items.length === 0 && step < 3) {
    return (
      <div className="page-container py-32 text-center">
        <h2 className="font-sora text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-10 animate-fadeIn">
      <StepBar current={step}/>

      {step < 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* STEP 0: Address */}
            {step === 0 && (
              <div className="card p-8">
                <h2 className="font-sora text-xl font-bold text-gray-900 mb-6">Delivery Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Full Name *"    placeholder="Jane Doe"     value={addr.name}  onChange={e => setAddr({...addr, name: e.target.value})} half/>
                  <InputGroup label="Phone *"        type="tel" placeholder="+91 98765 43210" value={addr.phone} onChange={e => setAddr({...addr, phone: e.target.value})} half/>
                  <InputGroup label="Email"          type="email" placeholder="you@example.com" value={addr.email} onChange={e => setAddr({...addr, email: e.target.value})}/>
                  <InputGroup label="Address Line 1 *" placeholder="House / Flat no., Street" value={addr.line1} onChange={e => setAddr({...addr, line1: e.target.value})}/>
                  <InputGroup label="Address Line 2"   placeholder="Area, Landmark (optional)" value={addr.line2} onChange={e => setAddr({...addr, line2: e.target.value})}/>
                  <InputGroup label="City *"  placeholder="Mumbai" value={addr.city}  onChange={e => setAddr({...addr, city: e.target.value})} half/>
                  <InputGroup label="State *" placeholder="Maharashtra" value={addr.state} onChange={e => setAddr({...addr, state: e.target.value})} half/>
                  <InputGroup label="PIN Code *" placeholder="400001" value={addr.pin} onChange={e => setAddr({...addr, pin: e.target.value})} half/>
                  <InputGroup label="Country" placeholder="India" value={addr.country} onChange={e => setAddr({...addr, country: e.target.value})} half/>
                </div>
                <button onClick={handleAddress} className="btn-primary mt-6 py-3 px-8">Continue to Payment →</button>
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div className="card p-8">
                <h2 className="font-sora text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { val: "card", label: "Credit / Debit Card", icon: "💳" },
                    { val: "upi",  label: "UPI",                 icon: "📱" },
                    { val: "cod",  label: "Cash on Delivery",    icon: "💵" },
                  ].map(m => (
                    <label key={m.val} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payment.method === m.val ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="payment" value={m.val} checked={payment.method === m.val} onChange={() => setPayment({...payment, method: m.val})} className="accent-indigo-500"/>
                      <span className="text-xl">{m.icon}</span>
                      <span className="font-medium text-gray-700">{m.label}</span>
                    </label>
                  ))}
                </div>

                {payment.method === "card" && (
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Card Number</label>
                      <input type="text" placeholder="1234  5678  9012  3456" value={payment.cardNum}
                        onChange={e => setPayment({...payment, cardNum: e.target.value})} className="input-field" maxLength="19"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Cardholder Name</label>
                      <input type="text" placeholder="Jane Doe" value={payment.name}
                        onChange={e => setPayment({...payment, name: e.target.value})} className="input-field"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Expiry (MM/YY)</label>
                        <input type="text" placeholder="09/28" value={payment.expiry}
                          onChange={e => setPayment({...payment, expiry: e.target.value})} className="input-field" maxLength="5"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">CVV</label>
                        <input type="password" placeholder="•••" value={payment.cvv}
                          onChange={e => setPayment({...payment, cvv: e.target.value})} className="input-field" maxLength="4"/>
                      </div>
                    </div>
                  </div>
                )}

                {payment.method === "upi" && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">UPI ID</label>
                    <input type="text" placeholder="yourname@upi" value={payment.upi}
                      onChange={e => setPayment({...payment, upi: e.target.value})} className="input-field"/>
                  </div>
                )}

                {payment.method === "cod" && (
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-800">Cash on Delivery is available. Extra ₹50 COD charge will be added.</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-secondary py-3 px-6">← Back</button>
                  <button onClick={handlePayment}    className="btn-primary py-3 px-8">Review Order →</button>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <div className="card p-8">
                <h2 className="font-sora text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                <div className="space-y-4 mb-6">
                  {items.map(item => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.qty}</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-1">
                  <p className="font-semibold text-gray-700 mb-2">Delivering to:</p>
                  <p className="text-gray-600">{addr.name} · {addr.phone}</p>
                  <p className="text-gray-600">{addr.line1}{addr.line2 ? ", " + addr.line2 : ""}</p>
                  <p className="text-gray-600">{addr.city}, {addr.state} {addr.pin}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary py-3 px-6">← Back</button>
                  <button onClick={handleConfirm} disabled={saving}
                    className={`btn-primary py-3 px-8 ${saving ? "opacity-80" : ""}`}>
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        Placing Order…
                      </span>
                    ) : "Place Order →"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-sora text-base font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2.5 mb-4 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? "text-green-600 font-medium" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>{formatPrice(tax)}</span></div>
                {payment.method === "cod" && (
                  <div className="flex justify-between text-amber-600"><span>COD charge</span><span>₹50</span></div>
                )}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatPrice(grand + (payment.method === "cod" ? 50 : 0))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Confirmed */}
      {step === 3 && (
        <div className="max-w-lg mx-auto card p-12 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="font-sora text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
          <p className="text-gray-500 mb-2">Your order has been confirmed</p>
          <p className="text-sm text-gray-400 mb-8 font-mono bg-gray-50 px-4 py-2 rounded-lg">{orderId}</p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 mb-8">
            <p>Expected delivery: <strong className="text-gray-800">3–5 business days</strong></p>
            <p className="mt-1">Confirmation sent to: <strong className="text-gray-800">{addr.email}</strong></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/orders" className="btn-primary py-3 px-8">Track Order</Link>
            <Link to="/products" className="btn-secondary py-3 px-8">Continue Shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
}
