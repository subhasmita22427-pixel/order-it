function OrderHistory({ orders, onClose, onReorder, onPrint }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog orders-dialog" role="dialog" aria-modal="true" aria-labelledby="orders-title">
        <button className="dialog-close" type="button" aria-label="Close orders" onClick={onClose}>×</button>
        <p className="eyebrow">Your ORDER IT history</p>
        <h2 id="orders-title">Previous orders</h2>
        {orders.length === 0 ? (
          <div className="empty-state compact"><p>No previous orders yet. Your completed demo orders will appear here.</p></div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-card-heading"><strong>Order {order.id}</strong><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
                <p>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
                <div className="order-card-footer"><span>₹{order.total} · {order.paymentMethod === 'cod' ? 'COD · Payment pending' : order.paymentMethod}</span><div><button type="button" onClick={() => onPrint(order)}>Receipt</button><button type="button" onClick={() => onReorder(order)}>Order again</button></div></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default OrderHistory;
