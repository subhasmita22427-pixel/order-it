import { useState } from 'react';
import { getCheckoutTotals } from '../utils/shop';

function Checkout({ items, address, onClose, onChangeAddress, onPlaceOrder }) {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const totals = getCheckoutTotals(items);
  const addressText = address
    ? `${address.house}, ${address.street}, ${address.locality}, ${address.city}, ${address.state} ${address.pin}`
    : 'No delivery address selected';

  const submitOrder = () => {
    if (paymentMethod !== 'cod') return;
    onPlaceOrder({ paymentMethod, ...totals });
  };

  return (
    <div className="modal-backdrop checkout-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button className="dialog-close" type="button" aria-label="Close checkout" onClick={onClose}>×</button>
        <p className="eyebrow">Almost there</p>
        <h2 id="checkout-title">Checkout</h2>
        <div className="demo-checkout-notice"><strong>Demo checkout</strong><span>Orders are stored only in this browser. No backend, live inventory, or payment gateway is connected.</span></div>

        <section className="checkout-step">
          <div className="checkout-step-heading"><h3>1. Delivery address</h3><button className="text-button" type="button" onClick={onChangeAddress}>Change</button></div>
          <p><strong>{address?.type || 'Delivery address'}{address?.recipient ? ` · ${address.recipient}` : ''}</strong><br />{addressText}</p>
          {address?.phone && <small>Phone: +91 {address.phone}</small>}
        </section>

        <section className="checkout-step">
          <h3>2. Order summary</h3>
          <div className="checkout-lines">
            {items.map((item) => <div key={item.id}><span>{item.name} × {item.quantity}</span><strong>₹{item.price * item.quantity}</strong></div>)}
            <div><span>Item total</span><strong>₹{totals.subtotal}</strong></div>
            <div><span>Delivery fee</span><strong>{totals.deliveryFee ? `₹${totals.deliveryFee}` : 'FREE'}</strong></div>
            <div><span>Handling fee</span><strong>₹{totals.handlingFee}</strong></div>
            <div className="checkout-total"><span>Amount payable</span><strong>₹{totals.total}</strong></div>
          </div>
        </section>

        <fieldset className="checkout-step payment-options">
          <legend>3. Payment method</legend>
          <label><input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /><span><strong>Cash on Delivery</strong><small>Pay in cash when your order arrives · Payment pending</small></span></label>
          <label><input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /><span><strong>UPI</strong><small>Razorpay test checkout is not configured in this demo</small></span></label>
          <label><input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><span><strong>Debit / Credit Card</strong><small>Secure gateway checkout required; no card details are collected here</small></span></label>
          <label><input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} /><span><strong>Net Banking</strong><small>Available when a supported payment gateway is configured</small></span></label>
        </fieldset>

        {paymentMethod !== 'cod' && <p className="checkout-payment-unavailable" role="status">Online payment is unavailable until server-side Razorpay integration and payment verification are implemented. Choose Cash on Delivery to place a demo order.</p>}
        <button className="primary-button full-width place-order-button" type="button" disabled={!address || items.length === 0 || paymentMethod !== 'cod'} onClick={submitOrder}>
          Place demo order · ₹{totals.total}
        </button>
        <p className="checkout-security-note">COD orders are recorded as payment pending. Never enter a UPI PIN, card number, or CVV on this demo site.</p>
      </section>
    </div>
  );
}

export default Checkout;
