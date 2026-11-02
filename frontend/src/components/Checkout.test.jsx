import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Checkout from './Checkout';
import OrderHistory from './OrderHistory';
import OrderReceipt from './OrderReceipt';
import { getDeliverySummary } from '../utils/delivery';
import { products } from '../data/products';

const address = {
  id: 'address-1',
  type: 'Home',
  recipient: 'ORDER IT customer',
  phone: '9876543210',
  house: '12A',
  street: 'Main Road',
  locality: 'Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  pin: '560038',
};

function CheckoutHarness({ onPlaceOrder }) {
  const [deliveryPreference, setDeliveryPreference] = useState({ type: 'now', date: '', timeSlot: '' });
  return (
    <Checkout
      items={[{ ...products[0], quantity: 1 }]}
      address={address}
      deliveryPreference={deliveryPreference}
      onDeliveryPreferenceChange={setDeliveryPreference}
      onClose={vi.fn()}
      onChangeAddress={vi.fn()}
      onPlaceOrder={onPlaceOrder}
    />
  );
}

describe('Checkout delivery scheduling', () => {
  it('allows selecting a future demo slot and shows it in the order summary', () => {
    const onPlaceOrder = vi.fn();
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const scheduledDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    const preference = { type: 'scheduled', date: scheduledDate, timeSlot: '12:00-14:00' };

    render(<CheckoutHarness onPlaceOrder={onPlaceOrder} />);
    fireEvent.click(screen.getByRole('radio', { name: /schedule delivery/i }));
    fireEvent.change(screen.getByLabelText('Delivery date'), { target: { value: scheduledDate } });
    const slot = screen.getByRole('radio', { name: '12:00 PM - 2:00 PM' });
    fireEvent.click(slot);

    expect(slot).toBeChecked();
    expect(screen.getByText('Delivery schedule').parentElement).toHaveTextContent(getDeliverySummary(preference));
    expect(screen.getByText(/Delivering to|Home · ORDER IT customer/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Place demo order/i }));

    expect(onPlaceOrder).toHaveBeenCalledWith(expect.objectContaining({
      paymentMethod: 'cod',
      deliveryPreference: preference,
    }));
  });

  it('keeps scheduled orders disabled until a future date and time slot are selected', () => {
    render(<CheckoutHarness onPlaceOrder={vi.fn()} />);
    fireEvent.click(screen.getByRole('radio', { name: /schedule delivery/i }));

    expect(screen.getByRole('button', { name: /Place demo order/i })).toBeDisabled();
    expect(screen.getByText('Choose a delivery date and time slot')).toBeInTheDocument();
  });

  it('shows the saved delivery schedule in order history and confirmation', () => {
    const order = {
      id: 'OI-12345678',
      createdAt: '2026-11-02T10:00:00.000Z',
      items: [{ ...products[0], quantity: 1 }],
      address,
      delivery: { summary: 'Scheduled: Tue, 3 Nov · 12:00 PM - 2:00 PM' },
      subtotal: 42,
      deliveryFee: 25,
      handlingFee: 2,
      total: 69,
      paymentMethod: 'cod',
      paymentStatus: 'Pending',
    };

    const history = render(<OrderHistory orders={[order]} onClose={vi.fn()} onReorder={vi.fn()} onPrint={vi.fn()} />);
    expect(screen.getByText(/Scheduled: Tue, 3 Nov · 12:00 PM - 2:00 PM/)).toBeInTheDocument();

    history.unmount();
    render(<OrderReceipt order={order} onClose={vi.fn()} />);
    expect(screen.getByText('Scheduled: Tue, 3 Nov · 12:00 PM - 2:00 PM')).toBeInTheDocument();
    expect(screen.getByText(/Indiranagar, Bengaluru/)).toBeInTheDocument();
  });
});
