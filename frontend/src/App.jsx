import './App.css';

function App() {
  return (
    <div>
      <nav className="navbar">
        <div className="logo">
          <h2>ORDER IT</h2>
          <p>Delivery in minutes</p>
        </div>

        <input
          type="text"
          placeholder="Search products..."
        />

        <button className="cart-btn">
          My Cart
        </button>
      </nav>
    </div>
  );
}

export default App;