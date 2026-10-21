export function filterProducts(products, search, selectedCategory, selectedSubcategory = null) {
  const normalizedSearch = search.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = !selectedCategory
      || product.topCategory === selectedCategory
      || product.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || product.category === selectedSubcategory;
    const searchableText = `${product.name} ${product.category} ${product.subcategory}`.toLowerCase();
    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    return matchesCategory && matchesSubcategory && matchesSearch;
  });
}

export function updateCart(cart, product, quantityDelta) {
  if (product.availability === false) return cart;
  const existingItem = cart.find((item) => item.id === product.id);
  if (!existingItem) {
    return quantityDelta > 0
      ? [...cart, { ...product, quantityLabel: product.quantity, quantity: quantityDelta }]
      : cart;
  }

  return cart
    .map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantityDelta } : item)
    .filter((item) => item.quantity > 0);
}

export function getCartSummary(items) {
  return items.reduce(
    (summary, item) => ({
      itemCount: summary.itemCount + item.quantity,
      totalPrice: summary.totalPrice + item.price * item.quantity,
    }),
    { itemCount: 0, totalPrice: 0 },
  );
}

export function getCheckoutTotals(items) {
  const { totalPrice: subtotal } = getCartSummary(items);
  const deliveryFee = subtotal === 0 || subtotal >= 199 ? 0 : 25;
  const handlingFee = subtotal > 0 ? 2 : 0;
  return { subtotal, deliveryFee, handlingFee, total: subtotal + deliveryFee + handlingFee };
}

export function isValidIndianMobileNumber(value) {
  return /^[6-9]\d{9}$/.test(value);
}

export function isValidIndianPinCode(value) {
  return /^[1-9]\d{5}$/.test(value);
}
