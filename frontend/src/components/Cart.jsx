import { getCartSummary, getCheckoutTotals } from '../utils/shop';

function Cart({ items, onClose, onIncrease, onDecrease, onRemove, onCheckout, notice, selectedAddress }) {
  const { itemCount: totalItems, totalPrice } = getCartSummary(items);
  const totals = getCheckoutTotals(items);

  return (
    <div className="modal-backdrop cart-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-header">
          <div><p className="eyebrow">Your basket</p><h2 id="cart-title">My cart <span>({totalItems})</span></h2></div>
          <button className="dialog-close" type="button" aria-label="Close cart" onClick={onClose}>×</button>
        </div>
        {items.length === 0 ? (
          <div className="empty-cart"><span aria-hidden="true">🛍️</span><h3>Your cart is waiting</h3><p>Find something lovely for your home.</p><button className="primary-button" type="button" onClick={onClose}>Start shopping</button></div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <img src={item.image} alt="" />
                  <div className="cart-item-info"><h3>{item.name}</h3><p>{item.quantityLabel}</p><strong>₹{item.price * item.quantity}</strong></div>
                  <div className="cart-item-actions"><div className="quantity-control"><button type="button" aria-label={`Decrease ${item.name}`} onClick={() => onDecrease(item)}>-</button><span>{item.quantity}</span><button type="button" aria-label={`Increase ${item.name}`} onClick={() => onIncrease(item)}>+</button></div><button className="remove-button" type="button" onClick={() => onRemove(item.id)}>Remove</button></div>
                </article>
              ))}
            </div>
            <div className="cart-summary">
              {selectedAddress && <div className="checkout-address"><span>Delivering to</span><strong>{selectedAddress.type} · {selectedAddress.locality}, {selectedAddress.city}</strong></div>}
              <div><span>Item total</span><strong>₹{totalPrice}</strong></div><div><span>Delivery fee</span><strong className={totals.deliveryFee ? '' : 'free-delivery'}>{totals.deliveryFee ? `₹${totals.deliveryFee}` : 'FREE'}</strong></div><div><span>Handling fee</span><strong>₹{totals.handlingFee}</strong></div><div className="cart-grand-total"><span>Grand total</span><strong>₹{totals.total}</strong></div>
              {notice && <p className="checkout-notice" role="status">{notice}</p>}
              <button className="primary-button full-width checkout-button" type="button" onClick={onCheckout}>Proceed to checkout <span>· ₹{totals.total}</span></button><p>Local demo checkout · no real payment processing.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export default Cart;
