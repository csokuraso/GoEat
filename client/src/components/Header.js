import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./style.css";

function Header() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <header className="header">
      <Link to="/" className="logo">
        Go<span>Eats</span>
      </Link>
      <nav>
        <Link to="/">Головна</Link>
        <Link to="/restaurants">Ресторани</Link>
        <Link to="/checkout">Замовлення</Link>
        <Link to="/cart" className="no-border cart-link">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
            alt="Кошик"
            className="icon large-icon"
          />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </Link>
        <Link to="/profile" className="no-border">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
            alt="Профіль"
            className="icon large-icon"
          />
        </Link>
      </nav>
    </header>
  );
}

export default Header;