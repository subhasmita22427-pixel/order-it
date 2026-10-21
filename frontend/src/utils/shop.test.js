import assert from 'node:assert/strict';
import test from 'node:test';
import { categories, products, topCategories } from '../data/products.js';
import {
  filterProducts,
  getCheckoutTotals,
  getCartSummary,
  isValidIndianMobileNumber,
  isValidIndianPinCode,
  updateCart,
} from './shop.js';

test('filters product names without regard to case or surrounding spaces', () => {
  assert.deepEqual(filterProducts(products, '  BANANA ', null).map((product) => product.id), ['banana']);
});

test('combines search and category filters and returns no unrelated matches', () => {
  assert.deepEqual(filterProducts(products, 'fresh', 'fruits').map((product) => product.id), ['avocado', 'tomato']);
  assert.deepEqual(filterProducts(products, 'not in stock', null), []);
});

test('every displayed category has at least one sample product', () => {
  for (const category of categories) {
    assert.ok(products.some((product) => product.category === category.id), `${category.name} has no products`);
  }
});

test('catalogue products have unique IDs, images, prices, stock, and category metadata', () => {
  assert.equal(new Set(products.map((product) => product.id)).size, products.length);
  for (const product of products) {
    assert.ok(product.name && product.image.startsWith('data:image/svg+xml'));
    assert.ok(product.price > 0 && product.quantity && product.category && product.subcategory);
    assert.equal(typeof product.availability, 'boolean');
  }
  for (const category of topCategories.filter((item) => item.id)) {
    assert.ok(products.some((product) => product.topCategory === category.id), `${category.name} has no products`);
  }
});

test('filters by department and subcategory together', () => {
  assert.deepEqual(filterProducts(products, '', 'grocery', 'fruits').map((product) => product.id), ['banana', 'avocado', 'tomato', 'spinach']);
  assert.ok(filterProducts(products, 'vanilla', null).some((product) => product.id === 'ice-cream'));
});

test('adds and increments items, then removes them when quantity reaches zero', () => {
  const banana = products.find((product) => product.id === 'banana');
  const oneItem = updateCart([], banana, 1);
  assert.equal(oneItem[0].quantity, 1);
  assert.equal(updateCart(oneItem, banana, 1)[0].quantity, 2);
  assert.deepEqual(updateCart(oneItem, banana, -1), []);
  assert.deepEqual(updateCart([], banana, -1), []);
});

test('out-of-stock products cannot be added to cart', () => {
  const unavailable = products.find((product) => product.availability === false);
  assert.ok(unavailable);
  assert.deepEqual(updateCart([], unavailable, 1), []);
});

test('calculates item count and total price for multiple cart lines', () => {
  const cart = [
    { ...products[0], quantity: 2 },
    { ...products[1], quantity: 1 },
  ];
  assert.deepEqual(getCartSummary(cart), { itemCount: 3, totalPrice: 183 });
  assert.deepEqual(getCartSummary([]), { itemCount: 0, totalPrice: 0 });
});

test('calculates delivery, handling, and payable totals', () => {
  assert.deepEqual(getCheckoutTotals([]), { subtotal: 0, deliveryFee: 0, handlingFee: 0, total: 0 });
  assert.deepEqual(getCheckoutTotals([{ ...products[0], quantity: 1 }]), { subtotal: 42, deliveryFee: 25, handlingFee: 2, total: 69 });
  assert.deepEqual(getCheckoutTotals([{ ...products[0], quantity: 5 }]), { subtotal: 210, deliveryFee: 0, handlingFee: 2, total: 212 });
});

test('validates Indian mobile numbers and PIN codes', () => {
  assert.equal(isValidIndianMobileNumber('9876543210'), true);
  assert.equal(isValidIndianMobileNumber('1234567890'), false);
  assert.equal(isValidIndianMobileNumber('987654321'), false);
  assert.equal(isValidIndianPinCode('560038'), true);
  assert.equal(isValidIndianPinCode('011001'), false);
  assert.equal(isValidIndianPinCode('56003'), false);
});
