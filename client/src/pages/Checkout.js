import { useState } from "react";
import { Link } from "react-router-dom";

function Checkout() {
  const [message, setMessage] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState(null); // ← ВНУТРИ

  const createOrder = async (e) => {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      setMessage("Кошик порожній");
      return;
    }

    const restaurant_id = cart[0].restaurant_id;

    const response = await fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: 1,
        restaurant_id: restaurant_id,
        address_id: 1,
        payment_method_id: 1,
        items: cart,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      localStorage.removeItem("cart");
      setCreatedOrderId(data.order_id);
      setMessage(`Замовлення створено! Номер: ${data.order_id}`);
    } else {
      const error = await response.text();
      setMessage(`Помилка: ${error}`);
    }
  };

  return (
    <main className="page">
      <h1>Оформлення замовлення</h1>

      <form className="form" onSubmit={createOrder}>
        <input placeholder="Ім'я" />
        <input placeholder="Телефон" />
        <input placeholder="Адреса доставки" />

        <select>
          <option>Готівка</option>
        </select>

        <button type="submit">Підтвердити замовлення</button>
      </form>

      {message && <p className="section-subtitle">{message}</p>}

      {createdOrderId && (
        <Link to="/orders" className="btn">
          Переглянути замовлення
        </Link>
      )}
    </main>
  );
}

export default Checkout;