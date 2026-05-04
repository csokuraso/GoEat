import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
        <Link to="/" className="logo">GoEats</Link>

      <nav>
        <Link to="/">Головна</Link>
        <Link to="/restaurants">Ресторани</Link>
        <Link to="/checkout">Замовлення</Link>
        <Link to="/cart">Кошик</Link>
        <Link to="/profile">Профіль</Link>
      </nav>
    </header>
  );
}

export default Header;