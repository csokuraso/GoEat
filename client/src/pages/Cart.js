import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const removeItem = (item_id) => {
    const updatedCart = cart.filter((item) => item.item_id !== item_id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  return (
    <main className="page">
      <h1>Кошик</h1>

      {cart.length === 0 ? (
        <p>Кошик порожній.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.item_id}>
              <h3>{item.name}</h3>
              <p>Ціна: {item.price} ₴</p>
              <p>Кількість: {item.quantity}</p>
              <p>Сума: {Number(item.price) * item.quantity} ₴</p>
              <button className="delete-btn" onClick={() => removeItem(item.item_id)}>
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/3096/3096673.png" 
                    alt="Видалити" 
                    className="delete-icon"
                  />
                </button>
            </div>
          ))}

          <h2>Разом: {total} ₴</h2>

          <Link to="/checkout" className="btn">
            Оформити замовлення
          </Link>
        </>
      )}
    </main>
  );
}

export default Cart;