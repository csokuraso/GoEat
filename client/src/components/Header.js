import { Link } from "react-router-dom";
import './style.css'; 

function Header() {
  return (
    <header className="header">
        <Link to="/" className="logo">GoEats</Link>
      <nav>
        <Link to="/">Головна</Link>
        <Link to="/restaurants">Ресторани</Link>
        <Link to="/checkout">Замовлення</Link>
<Link to="/cart" className="no-border">
  <img 
    src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png" 
    alt="Кошик" 
    className="icon large-icon" 
  />
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