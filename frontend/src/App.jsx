import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import AddressSelector from './components/AddressSelector';
import AuthModal from './components/AuthModal';
import Cart from './components/Cart';
import Categories from './components/Categories';
import Checkout from './components/Checkout';
import BottomNav from './components/BottomNav';
import OrderHistory from './components/OrderHistory';
import OrderReceipt from './components/OrderReceipt';
import ProductCard from './components/ProductCard';
import TopCategories from './components/TopCategories';
import { categories as productCategories, products } from './data/products';
import { filterProducts, getCheckoutTotals, updateCart as applyCartChange } from './utils/shop';

const readStoredValue = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
};

function App() {
  const [accounts, setAccounts] = useState(() => readStoredValue('order-it-accounts', []));
  const [user, setUser] = useState(() => {
    const mobile = readStoredValue('order-it-current-user', null);
    if (!mobile) return null;
    return readStoredValue('order-it-accounts', []).find((account) => account.mobile === mobile) || null;
  });
  const [selectedAddressId, setSelectedAddressId] = useState(() => user?.selectedAddressId || user?.addresses?.find((address) => address.isDefault)?.id || null);
  const [cart, setCart] = useState(() => user ? readStoredValue(`order-it-cart-${user.mobile}`, []) : []);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileView, setProfileView] = useState('');
  const [activeNav, setActiveNav] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pendingIntent, setPendingIntent] = useState(null);
  const [addressCheckout, setAddressCheckout] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState('');
  const [toast, setToast] = useState('');
  const [orders, setOrders] = useState(() => user ? readStoredValue(`order-it-orders-${user.mobile}`, []) : []);
  const orderInProgress = useRef(false);

  useEffect(() => {
    try {
      window.localStorage.setItem('order-it-accounts', JSON.stringify(accounts));
    } catch (error) {
      console.error('Could not save ORDER IT accounts to local storage.', error);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem('order-it-current-user', JSON.stringify(user.mobile));
        window.localStorage.setItem(`order-it-cart-${user.mobile}`, JSON.stringify(cart));
        window.localStorage.setItem(`order-it-orders-${user.mobile}`, JSON.stringify(orders));
      } else {
        window.localStorage.removeItem('order-it-current-user');
      }
    } catch (error) {
      console.error('Could not save ORDER IT session or cart to local storage.', error);
    }
  }, [cart, orders, user]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const visibleProducts = useMemo(() => {
    return filterProducts(products, search, selectedCategory, selectedSubcategory);
  }, [search, selectedCategory, selectedSubcategory]);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const selectedAddress = user?.addresses?.find((address) => address.id === selectedAddressId);

  const saveAccount = (nextAccount) => {
    setUser((current) => current?.mobile === nextAccount.mobile
      ? { ...current, ...nextAccount }
      : nextAccount);
    setAccounts((current) => {
      const exists = current.some((account) => account.mobile === nextAccount.mobile);
      return exists
        ? current.map((account) => account.mobile === nextAccount.mobile ? nextAccount : account)
        : [...current, nextAccount];
    });
  };

  const updateCart = (product, quantityDelta, currentCart = cart) => {
    setCart((current) => applyCartChange(currentCart === cart ? current : currentCart, product, quantityDelta));
  };

  const requestShoppingAction = (intent) => {
    if (!user) {
      setPendingIntent(intent);
      setShowAuth(true);
      return;
    }
    if (intent.type === 'add') updateCart(intent.product, 1);
    if (intent.type === 'buy') {
      updateCart(intent.product, 1);
      setShowCart(true);
    }
  };

  const authenticate = ({ mobile, name, defaultAddress, isNew }) => {
    const existingAccount = accounts.find((account) => account.mobile === mobile);
    if (!isNew && !existingAccount) {
      setToast('No local account found. Please register first.');
      return;
    }
    const initialAddress = defaultAddress ? {
      id: `address-${Date.now()}`,
      recipient: name,
      phone: mobile,
      house: defaultAddress.house,
      street: defaultAddress.street,
      locality: defaultAddress.locality,
      city: defaultAddress.city,
      state: defaultAddress.state,
      pin: defaultAddress.pin,
      landmark: '',
      type: 'Home',
      isDefault: true,
    } : null;
    const authenticatedAccount = isNew
      ? { mobile, name, addresses: [initialAddress], selectedAddressId: initialAddress.id }
      : existingAccount;
    saveAccount(authenticatedAccount);
    setSelectedAddressId(authenticatedAccount.selectedAddressId || authenticatedAccount.addresses?.find((address) => address.isDefault)?.id || null);
    const restoredCart = readStoredValue(`order-it-cart-${mobile}`, []);
    setOrders(readStoredValue(`order-it-orders-${mobile}`, []));
    setCart(restoredCart);
    setShowAuth(false);

    const intent = pendingIntent;
    setPendingIntent(null);
    if (intent?.type === 'add') updateCart(intent.product, 1, restoredCart);
    if (intent?.type === 'buy') {
      updateCart(intent.product, 1, restoredCart);
      setShowCart(true);
    } else if (intent?.type === 'checkout') {
      setAddressCheckout(true);
      setShowAddresses(true);
    } else if (intent?.type === 'address') {
      setAddressCheckout(false);
      setShowAddresses(true);
    } else if (intent?.type === 'orders') {
      setShowOrders(true);
    }
    setToast(`Welcome${authenticatedAccount.name ? `, ${authenticatedAccount.name.split(' ')[0]}` : ''}!`);
  };

  const changeSelectedAddress = (addressId) => {
    setSelectedAddressId(addressId);
    if (user) {
      setUser((current) => current ? { ...current, selectedAddressId: addressId } : current);
      setAccounts((current) => current.map((account) => account.mobile === user.mobile
        ? { ...account, selectedAddressId: addressId }
        : account));
    }
  };

  const handleCheckout = () => {
    setCheckoutNotice('');
    orderInProgress.current = false;
    setAddressCheckout(true);
    if (!user) {
      setShowCart(false);
      setPendingIntent({ type: 'checkout' });
      setShowAuth(true);
      return;
    }
    setShowCart(false);
    if (selectedAddress) {
      setShowCheckout(true);
    } else {
      setShowAddresses(true);
    }
  };

  const completeCheckoutAddress = () => {
    setShowAddresses(false);
    setShowCheckout(true);
  };

  const logout = () => {
    setUser(null);
    setSelectedAddressId(null);
    setCart([]);
    setOrders([]);
    setProfileOpen(false);
    setShowOrders(false);
    setToast('You have been logged out.');
  };

  const deliveryLabel = selectedAddress
    ? `${selectedAddress.locality}, ${selectedAddress.city}`
    : 'Choose your location';
  const openAddressManager = () => {
    setAddressCheckout(false);
    setProfileOpen(false);
    setShowAddresses(true);
  };

  const selectTopCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setActiveNav(categoryId ? activeNav : 'home');
  };

  const selectSubcategory = (categoryId) => {
    setSelectedSubcategory(categoryId);
    const category = productCategories.find((item) => item.id === categoryId);
    setSelectedCategory(category ? products.find((product) => product.category === categoryId)?.topCategory || null : null);
  };

  const placeDemoOrder = () => {
    if (orderInProgress.current || !user || !selectedAddress || cart.length === 0) return;
    orderInProgress.current = true;
    const totals = getCheckoutTotals(cart);
    const order = {
      id: `OI-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      items: cart.map((item) => ({ ...item })),
      address: { ...selectedAddress },
      ...totals,
      paymentMethod: 'cod',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed (demo)',
    };
    setOrders((current) => [order, ...current]);
    setCart([]);
    setShowCheckout(false);
    setReceiptOrder(order);
    setToast('Demo order placed. Payment is pending; no real delivery or payment was created.');
  };

  const reorder = (order) => {
    const unavailable = [];
    setCart((current) => order.items.reduce((nextCart, previousItem) => {
      const product = products.find((item) => item.id === previousItem.id);
      if (!product || product.availability === false) {
        unavailable.push(previousItem.name);
        return nextCart;
      }
      return applyCartChange(nextCart, product, previousItem.quantity);
    }, current));
    setShowOrders(false);
    setShowCart(true);
    setToast(unavailable.length ? `Unavailable items skipped: ${unavailable.join(', ')}` : 'Previous items added to your cart.');
  };

  const navigate = (destination) => {
    setActiveNav(destination === 'orders' ? 'orders' : destination);
    if (destination === 'home') {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    } else if (destination === 'categories') {
      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
    } else if (destination === 'orders') {
      if (!user) {
        setPendingIntent({ type: 'orders' });
        setShowAuth(true);
      } else {
        setShowOrders(true);
      }
    } else if (destination === 'print') {
      const latestOrder = orders[0];
      if (latestOrder) setReceiptOrder(latestOrder);
      else setToast('There is no order receipt to print yet.');
    }
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="navbar">
          <a className="brand" href="#home" aria-label="ORDER IT home">
            <span className="brand-mark" aria-hidden="true">O</span>
            <span className="brand-copy"><strong>ORDER IT</strong><small>Good things, right away.</small></span>
          </a>
          <button className="delivery-button" type="button" onClick={() => user ? openAddressManager() : (setPendingIntent({ type: 'address' }), setShowAuth(true))}>
            <span className="delivery-icon" aria-hidden="true">⌖</span>
            <span className="delivery-copy"><small>DELIVER TO</small><strong>{deliveryLabel}</strong></span>
            <span className="chevron" aria-hidden="true">⌄</span>
          </button>
          <label className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for products..." aria-label="Search products" />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>×</button>}
          </label>
          {user ? (
            <div className="profile-menu">
              <button className="profile-button" type="button" aria-expanded={profileOpen} aria-haspopup="menu" onClick={() => setProfileOpen((open) => !open)} aria-label="Open profile menu">
                <span className="profile-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                <span className="profile-copy"><small>HELLO</small><strong>{user.name?.split(' ')[0] || user.mobile}</strong></span>
                <span className="chevron" aria-hidden="true">⌄</span>
              </button>
              {profileOpen && <div className="profile-dropdown" role="menu">
                <strong className="profile-dropdown-name">{user.name || 'ORDER IT member'}</strong>
                <button type="button" role="menuitem" onClick={() => { setProfileView('My Profile'); setProfileOpen(false); }}>My Profile</button>
                <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); navigate('orders'); }}>My Orders</button>
                <button type="button" role="menuitem" onClick={openAddressManager}>Saved Addresses</button>
                <button type="button" role="menuitem" onClick={() => { setProfileView('Account Settings'); setProfileOpen(false); }}>Account Settings</button>
                <button className="dropdown-logout" type="button" role="menuitem" onClick={logout}>Logout</button>
              </div>}
            </div>
          ) : (
            <button className="login-button" type="button" onClick={() => setShowAuth(true)}><span aria-hidden="true">♙</span> Login</button>
          )}
          <button className="cart-button" type="button" onClick={() => setShowCart(true)} aria-label={`Open cart, ${cartItemCount} items`}>
            <span className="cart-icon" aria-hidden="true">🛒</span><span>My cart</span><b className="cart-count">{cartItemCount}</b>
          </button>
        </div>
        <TopCategories selectedCategory={selectedCategory} onSelect={selectTopCategory} />
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-content">
            <span className="hero-kicker"><span className="hero-spark">✳</span> YOUR NEIGHBOURHOOD, DELIVERED</span>
            <h1>Good things<br />come <span>right away.</span></h1>
            <p>Your everyday favourites, delivered with a little extra joy.</p>
            <button className="hero-button" type="button" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Explore the good stuff <span aria-hidden="true">→</span></button>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun-shape"></div>
            <div className="hero-fruit fruit-one">🍊</div><div className="hero-fruit fruit-two">🥑</div><div className="hero-fruit fruit-three">🍋</div>
            <div className="hero-note"><span>Made for<br />your every day</span><b>✳</b></div>
          </div>
          <div className="hero-index"><span>01</span><span className="index-line"></span><span>03</span></div>
        </section>

        <div className="trust-strip">
          <span><i>✳</i> Fresh picks, every day</span><span><i>◷</i> At your door in minutes</span><span><i>♡</i> Local love, always</span>
        </div>

        <Categories selectedSubcategory={selectedSubcategory} onSelect={selectSubcategory} />

        <section className="products-section" id="products">
          <div className="section-heading">
            <div><p className="eyebrow">{search ? 'Your search results' : selectedSubcategory ? 'Picked for this category' : selectedCategory ? 'Picked for this department' : 'A few neighbourhood favourites'}</p><h2>{search ? `Results for “${search}”` : selectedSubcategory ? productCategories.find((category) => category.id === selectedSubcategory)?.name : selectedCategory ? 'Shop this department' : 'Popular right now'}</h2></div>
            <span className="product-count">{visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'}</span>
          </div>
          {visibleProducts.length > 0 ? (
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={cart.find((item) => item.id === product.id)?.quantity || 0}
                  onAdd={(item) => requestShoppingAction({ type: 'add', product: item })}
                  onDecrease={(item) => updateCart(item, -1)}
                  onBuy={(item) => requestShoppingAction({ type: 'buy', product: item })}
                  onDetails={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state search-empty"><span aria-hidden="true">🔎</span><h3>No good things found just yet</h3><p>Try another search or browse all of our neighbourhood favourites.</p><button className="text-button" type="button" onClick={() => { setSearch(''); setSelectedCategory(null); }}>Clear filters</button></div>
          )}
        </section>

        <section className="closing-banner"><span className="closing-spark" aria-hidden="true">✳</span><div><p className="eyebrow">The little things matter</p><h2>Make today a little more delightful.</h2><p>From pantry staples to last-minute treats, we’re on our way.</p></div><button type="button" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Find your favourites <span>→</span></button></section>
      </main>

      <footer className="site-footer"><a className="footer-brand" href="#home">ORDER IT<span>✳</span></a><p>Good things, right away.</p><small>© 2026 ORDER IT · Made for your neighbourhood.</small></footer>

      {showAuth && <AuthModal accounts={accounts} onClose={() => { setShowAuth(false); setPendingIntent(null); }} onAuthenticated={authenticate} />}
      {showAddresses && user && <AddressSelector account={user} selectedAddressId={selectedAddressId} onSelect={changeSelectedAddress} onAccountChange={saveAccount} onClose={() => setShowAddresses(false)} onCheckout={addressCheckout ? completeCheckoutAddress : undefined} />}
      {showCart && <Cart items={cart} onClose={() => setShowCart(false)} onIncrease={(item) => updateCart(item, 1)} onDecrease={(item) => updateCart(item, -1)} onRemove={(id) => setCart((current) => current.filter((item) => item.id !== id))} onCheckout={handleCheckout} notice={checkoutNotice} selectedAddress={selectedAddress} />}
      {showCheckout && <Checkout items={cart} address={selectedAddress} onClose={() => setShowCheckout(false)} onChangeAddress={() => { setShowCheckout(false); setAddressCheckout(true); setShowAddresses(true); }} onPlaceOrder={placeDemoOrder} />}
      {showOrders && user && <OrderHistory orders={orders} onClose={() => setShowOrders(false)} onReorder={reorder} onPrint={setReceiptOrder} />}
      {receiptOrder && <OrderReceipt order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
      {profileView && user && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setProfileView('')}><section className="dialog profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title"><button className="dialog-close" type="button" aria-label="Close profile" onClick={() => setProfileView('')}>×</button><p className="eyebrow">Your account</p><h2 id="profile-dialog-title">{profileView}</h2><div className="profile-details"><p><span>Name</span><strong>{user.name || 'Not provided'}</strong></p><p><span>Mobile</span><strong>+91 {user.mobile}</strong></p><p><span>Saved addresses</span><strong>{user.addresses?.length || 0}</strong></p></div><p className="maps-note">This account is stored in this browser for demonstration only. Account settings and authentication are not connected to a backend.</p><button className="primary-button full-width" type="button" onClick={() => setProfileView('')}>Done</button></section></div>}
      {selectedProduct && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedProduct(null)}><section className="dialog detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="dialog-close" type="button" aria-label="Close" onClick={() => setSelectedProduct(null)}>×</button><img src={selectedProduct.image} alt={selectedProduct.name} /><p className="eyebrow">A neighbourhood favourite</p><h2 id="detail-title">{selectedProduct.name}</h2><p>{selectedProduct.quantity} · Carefully picked for your everyday.</p><strong>₹{selectedProduct.price}</strong>{selectedProduct.availability === false ? <p className="stock-label">Currently out of stock</p> : <button className="primary-button full-width" type="button" onClick={() => { const product = selectedProduct; setSelectedProduct(null); requestShoppingAction({ type: 'add', product }); }}>Add to cart</button>}</section></div>}
      <BottomNav activeItem={activeNav} onNavigate={navigate} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default App;
