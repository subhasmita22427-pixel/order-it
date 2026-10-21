function OrderReceipt({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog receipt-dialog" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
        <button className="dialog-close no-print" type="button" aria-label="Close receipt" onClick={onClose}>×</button>
        <p className="eyebrow">ORDER IT · Demo receipt</p>
        <h2 id="receipt-title">Order confirmed</h2>
        <p className="receipt-order-id">{order.id} · {new Date(order.createdAt).toLocaleString()}</p>
        <div className="receipt-lines">
          {order.items.map((item) => <div key={item.id}><span>{item.name} × {item.quantity}</span><strong>₹{item.price * item.quantity}</strong></div>)}
          <div><span>Item total</span><strong>₹{order.subtotal}</strong></div>
          <div><span>Delivery fee</span><strong>{order.deliveryFee ? `₹${order.deliveryFee}` : 'FREE'}</strong></div>
          <div><span>Handling fee</span><strong>₹{order.handlingFee}</strong></div>
          <div className="checkout-total"><span>Amount payable</span><strong>₹{order.total}</strong></div>
        </div>
        <p><strong>Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</strong><br />Status: {order.paymentStatus}</p>
        <p className="receipt-address"><strong>Deliver to</strong><br />{order.address?.recipient} · +91 {order.address?.phone}<br />{order.address?.house}, {order.address?.street}, {order.address?.locality}, {order.address?.city} {order.address?.pin}</p>
        <p className="checkout-security-note">Demo order only. This is not a tax invoice or proof of a real delivery or payment.</p>
        <div className="receipt-actions no-print"><button className="secondary-button" type="button" onClick={onClose}>Continue shopping</button><button className="primary-button" type="button" onClick={() => window.print()}>Print receipt</button></div>
      </section>
    </div>
  );
}

export default OrderReceipt;
