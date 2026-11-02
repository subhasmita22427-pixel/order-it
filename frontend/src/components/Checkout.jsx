import { useState } from 'react';
import { getAvailableDeliverySlots, getDeliverySummary, getMinDeliveryDate, isValidDeliveryPreference } from '../utils/delivery';
import { getCheckoutTotals } from '../utils/shop';

function Checkout({
  items,
  address,
  deliveryPreference,
  onDeliveryPreferenceChange,
  onClose,
  onChangeAddress,
  onPlaceOrder,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const totals = getCheckoutTotals(items);
  const availableSlots = getAvailableDeliverySlots(deliveryPreference.date);
  const addressText = address
    ? `${address.house}, ${address.street}, ${address.locality}, ${address.city}, ${address.state} ${address.pin}`
    : 'No delivery address selected';

  const submitOrder = () => {
    if (paymentMethod !== 'cod' || !isValidDeliveryPreference(deliveryPreference)) return;
    onPlaceOrder({ paymentMethod, deliveryPreference, ...totals });
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
          <h3>2. Delivery option</h3>
          <div className="delivery-option-list">
            <label className={deliveryPreference.type === 'now' ? 'selected' : ''}>
              <input
                type="radio"
                name="delivery-option"
                value="now"
                checked={deliveryPreference.type === 'now'}
                onChange={() => onDeliveryPreferenceChange({ ...deliveryPreference, type: 'now' })}
              />
              <span><strong>Deliver Now</strong><small>Use the regular demo delivery flow.</small></span>
            </label>
            <label className={deliveryPreference.type === 'scheduled' ? 'selected' : ''}>
              <input
                type="radio"
                name="delivery-option"
                value="scheduled"
                checked={deliveryPreference.type === 'scheduled'}
                onChange={() => onDeliveryPreferenceChange({ ...deliveryPreference, type: 'scheduled' })}
              />
              <span><strong>Schedule Delivery</strong><small>Choose a future date and sample time slot.</small></span>
            </label>
          </div>
          {deliveryPreference.type === 'scheduled' && (
            <div className="delivery-schedule-fields">
              <label className="delivery-date-field">
                Delivery date
                <input
                  type="date"
                  aria-label="Delivery date"
                  min={getMinDeliveryDate()}
                  value={deliveryPreference.date}
                  onChange={(event) => onDeliveryPreferenceChange({
                    ...deliveryPreference,
                    date: event.target.value,
                    timeSlot: '',
                  })}
                />
              </label>
              <fieldset className="delivery-slot-options">
                <legend>Available demo time slots</legend>
                {availableSlots.length > 0 ? availableSlots.map((slot) => (
                  <label key={slot.id} className={deliveryPreference.timeSlot === slot.id ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="delivery-time-slot"
                      value={slot.id}
                      checked={deliveryPreference.timeSlot === slot.id}
                      onChange={() => onDeliveryPreferenceChange({ ...deliveryPreference, timeSlot: slot.id })}
                    />
                    <span>{slot.label}</span>
                  </label>
                )) : (
                  <p className="delivery-no-slots">No sample slots are available in the future for this date. Choose another date.</p>
                )}
              </fieldset>
              <p className="delivery-demo-note">Sample slots are for this demo only. They are not live availability and are not reserved.</p>
            </div>
          )}
        </section>

        <section className="checkout-step">
          <h3>3. Order summary</h3>
          <div className="checkout-lines">
            {items.map((item) => <div key={item.id}><span>{item.name} × {item.quantity}</span><strong>₹{item.price * item.quantity}</strong></div>)}
            <div><span>Item total</span><strong>₹{totals.subtotal}</strong></div>
            <div><span>Delivery fee</span><strong>{totals.deliveryFee ? `₹${totals.deliveryFee}` : 'FREE'}</strong></div>
            <div><span>Handling fee</span><strong>₹{totals.handlingFee}</strong></div>
            <div className="delivery-summary-line"><span>Delivery schedule</span><strong>{getDeliverySummary(deliveryPreference)}</strong></div>
            <div className="checkout-total"><span>Amount payable</span><strong>₹{totals.total}</strong></div>
          </div>
        </section>

        <fieldset className="checkout-step payment-options">
          <legend>4. Payment method</legend>
          <label><input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /><span><strong>Cash on Delivery</strong><small>Pay in cash when your order arrives · Payment pending</small></span></label>
          <label><input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /><span><strong>UPI</strong><small>Razorpay test checkout is not configured in this demo</small></span></label>
          <label><input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><span><strong>Debit / Credit Card</strong><small>Secure gateway checkout required; no card details are collected here</small></span></label>
          <label><input type="radio" name="payment" value="netbanking" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} /><span><strong>Net Banking</strong><small>Available when a supported payment gateway is configured</small></span></label>
        </fieldset>

        {paymentMethod !== 'cod' && <p className="checkout-payment-unavailable" role="status">Online payment is unavailable until server-side Razorpay integration and payment verification are implemented. Choose Cash on Delivery to place a demo order.</p>}
        <button className="primary-button full-width place-order-button" type="button" disabled={!address || items.length === 0 || paymentMethod !== 'cod' || !isValidDeliveryPreference(deliveryPreference)} onClick={submitOrder}>
          Place demo order · ₹{totals.total}
        </button>
        <p className="checkout-security-note">COD orders are recorded as payment pending. Never enter a UPI PIN, card number, or CVV on this demo site.</p>
      </section>
    </div>
  );
}

export default Checkout;
