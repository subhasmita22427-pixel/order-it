import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('ORDER IT homepage', () => {
  it('renders the storefront, departments, categories, and popular products', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /good thingscome right away/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Shop departments' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Shop departments' })).toHaveTextContent('Grocery');
    expect(screen.getByRole('region', { name: 'Browse product categories' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Popular right now' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Robusta Banana' })).toBeInTheDocument();
  });

  it('filters products by a selected category and clears the filter when selected again', () => {
    render(<App />);
    const category = screen.getByRole('button', { name: /fruits & vegetables/i });

    fireEvent.click(category);

    expect(category).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Fruits & Vegetables' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Robusta Banana' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Classic White Eggs' })).not.toBeInTheDocument();

    fireEvent.click(category);

    expect(category).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: 'Popular right now' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Classic White Eggs' })).toBeInTheDocument();
  });

  it('searches products by name and shows an empty state for unmatched queries', () => {
    render(<App />);
    const search = screen.getByRole('searchbox', { name: 'Search products' });

    fireEvent.change(search, { target: { value: '  BANANA ' } });

    expect(screen.getByRole('heading', { name: /Results for “\s*BANANA\s*”/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Robusta Banana' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Fresh Avocado' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Browse product categories' })).getByRole('button', { name: /fruits & vegetables/i })).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'not a real product' } });

    expect(screen.getByRole('heading', { name: 'No good things found just yet' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('heading', { name: 'Popular right now' })).toBeInTheDocument();
  });
});
