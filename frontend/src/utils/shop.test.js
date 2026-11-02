import { describe, expect, it } from 'vitest';
import { categories, products, topCategories } from '../data/products.js';
import {
  filterProducts,
  getCheckoutTotals,
  getCartSummary,
  isValidIndianMobileNumber,
  isValidIndianPinCode,
  updateCart,
} from './shop.js';

describe('shop utilities', () => {
  it('filters product names without regard to case or surrounding spaces', () => {
    expect(filterProducts(products, '  BANANA ', null).map((product) => product.id)).toEqual(['banana']);
  });

  it('combines search and category filters and returns no unrelated matches', () => {
    expect(filterProducts(products, 'fresh', 'fruits').map((product) => product.id)).toEqual(['avocado', 'tomato']);
    expect(filterProducts(products, 'not in stock', null)).toEqual([]);
  });

  it('ensures every displayed category has at least one sample product', () => {
    for (const category of categories) {
      expect(products.some((product) => product.category === category.id), `${category.name} has no products`).toBe(true);
    }
  });

  it('validates catalogue IDs, images, prices, stock, and category metadata', () => {
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
    for (const product of products) {
      expect(product.name && product.image.startsWith('data:image/svg+xml')).toBeTruthy();
      expect(product.price > 0 && product.quantity && product.category && product.subcategory).toBeTruthy();
      expect(typeof product.availability).toBe('boolean');
    }
    for (const category of topCategories.filter((item) => item.id)) {
      expect(products.some((product) => product.topCategory === category.id), `${category.name} has no products`).toBe(true);
    }
  });

  it('filters by department and subcategory together', () => {
    expect(filterProducts(products, '', 'grocery', 'fruits').map((product) => product.id)).toEqual(['banana', 'avocado', 'tomato', 'spinach']);
    expect(filterProducts(products, 'vanilla', null).some((product) => product.id === 'ice-cream')).toBe(true);
  });

  it('adds and increments items, then removes them when quantity reaches zero', () => {
    const banana = products.find((product) => product.id === 'banana');
    const oneItem = updateCart([], banana, 1);
    expect(oneItem[0].quantity).toBe(1);
    expect(updateCart(oneItem, banana, 1)[0].quantity).toBe(2);
    expect(updateCart(oneItem, banana, -1)).toEqual([]);
    expect(updateCart([], banana, -1)).toEqual([]);
  });

  it('prevents out-of-stock products from being added to the cart', () => {
    const unavailable = products.find((product) => product.availability === false);
    expect(unavailable).toBeDefined();
    expect(updateCart([], unavailable, 1)).toEqual([]);
  });

  it('calculates item count and total price for multiple cart lines', () => {
    const cart = [
      { ...products[0], quantity: 2 },
      { ...products[1], quantity: 1 },
    ];
    expect(getCartSummary(cart)).toEqual({ itemCount: 3, totalPrice: 183 });
    expect(getCartSummary([])).toEqual({ itemCount: 0, totalPrice: 0 });
  });

  it('calculates delivery, handling, and payable totals', () => {
    expect(getCheckoutTotals([])).toEqual({ subtotal: 0, deliveryFee: 0, handlingFee: 0, total: 0 });
    expect(getCheckoutTotals([{ ...products[0], quantity: 1 }])).toEqual({ subtotal: 42, deliveryFee: 25, handlingFee: 2, total: 69 });
    expect(getCheckoutTotals([{ ...products[0], quantity: 5 }])).toEqual({ subtotal: 210, deliveryFee: 0, handlingFee: 2, total: 212 });
  });

  it('validates Indian mobile numbers and PIN codes', () => {
    expect(isValidIndianMobileNumber('9876543210')).toBe(true);
    expect(isValidIndianMobileNumber('1234567890')).toBe(false);
    expect(isValidIndianMobileNumber('987654321')).toBe(false);
    expect(isValidIndianPinCode('560038')).toBe(true);
    expect(isValidIndianPinCode('011001')).toBe(false);
    expect(isValidIndianPinCode('56003')).toBe(false);
  });
});
