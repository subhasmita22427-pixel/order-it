function BottomNav({ activeItem, onNavigate }) {
  const items = [
    { id: 'home', label: 'Home', icon: '⌂' },
    { id: 'orders', label: 'Order Again', icon: '▣' },
    { id: 'categories', label: 'Categories', icon: '⊞' },
    { id: 'print', label: 'Print', icon: '▤' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
        <button
          className={`bottom-nav-item${activeItem === item.id ? ' active' : ''}`}
          key={item.id}
          type="button"
          aria-current={activeItem === item.id ? 'page' : undefined}
          onClick={() => onNavigate(item.id)}
        >
          <span aria-hidden="true">{item.icon}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
