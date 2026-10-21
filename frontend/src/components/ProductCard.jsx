function ProductCard({ product, quantity = 0, onAdd, onDecrease, onBuy, onDetails }) {
  return (
    <article className="product-card">
      <button className="product-image-button" type="button" onClick={() => onDetails(product)} aria-label={`View ${product.name} details`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.tag && <span className={`product-tag${product.availability === false ? ' sold-out-tag' : ''}`}>{product.tag}</span>}
        {product.discountPercent > 0 && <span className="product-discount">{product.discountPercent}% OFF</span>}
      </button>
      <div className="product-info">
        <span className="delivery-time"><span aria-hidden="true">◷</span> 8 min</span>
        <h3>{product.name}</h3>
        <p className="product-quantity">{product.quantity}{product.availability === false && <strong className="stock-label"> · Out of stock</strong>}</p>
        <div className="product-buy-row">
          <span className="product-prices"><strong>₹{product.price}</strong>{product.originalPrice && <del>₹{product.originalPrice}</del>}</span>
          {quantity > 0 ? (
            <div className="quantity-control" aria-label={`Quantity in cart: ${quantity}`}>
              <button type="button" aria-label="Decrease quantity" onClick={() => onDecrease(product)}>-</button>
              <span>{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => onAdd(product)}>+</button>
            </div>
          ) : product.availability === false ? (
            <button className="add-button" type="button" disabled>OUT OF STOCK</button>
          ) : (
            <button className="add-button" type="button" onClick={() => onAdd(product)}>ADD</button>
          )}
        </div>
        {product.availability !== false && <button className="buy-link" type="button" onClick={() => onBuy(product)}>Buy now</button>}
      </div>
    </article>
  );
}

export default ProductCard;
