import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Checkout() {
  const [message, setMessage] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const [paymentMethodId, setPaymentMethodId] = useState(1); 
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "" });

  const [user, setUser] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
  const savedUser = JSON.parse(localStorage.getItem("currentUser"));

  if (savedUser) {
    setUser(savedUser);

    fetch(`http://localhost:5000/users/${savedUser.user_id}/address`)
      .then((res) => res.json())
      .then((data) => setAddress(data.address_text))
      .catch(() => setAddress(""));
  }
}, []);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData({ ...cardData, [name]: value.replace(/\D/g, "") });
  };

  const createOrder = async (e) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
  setMessage("Спочатку увійдіть в акаунт");
  return;
}

    if (cart.length === 0) {
      setMessage("Кошик порожній");
      return;
    }

    const restaurant_id = cart[0].restaurant_id;

    const response = await fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  user_id: user.user_id,
  restaurant_id: restaurant_id,
  payment_method_id: paymentMethodId,
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
       <input value={user?.username || ""} readOnly />
       <input placeholder="Телефон" required />
       <input value={address || "Адреса не вказана"} readOnly />

        <select 
          value={paymentMethodId} 
          onChange={(e) => setPaymentMethodId(Number(e.target.value))}
        >
          <option value="1">Оплата готівкою</option>
          <option value="2">Оплата карткою</option>
        </select>

        {paymentMethodId === 2 && (
          <div className="card-details" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <input 
              name="number"
              placeholder="0000 0000 0000 0000" 
              maxLength="16"
              value={cardData.number}
              onChange={handleCardChange}
              required 
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                name="expiry"
                placeholder="ММ/РР" 
                maxLength="4" 
                value={cardData.expiry}
                onChange={handleCardChange}
                required 
              />
              <input 
                name="cvv"
                type="password"
                placeholder="CVV" 
                maxLength="3" 
                value={cardData.cvv}
                onChange={handleCardChange}
                required 
              />
            </div>
          </div>
        )}

        <button type="submit" style={{ marginTop: '20px' }}>
          Підтвердити замовлення
        </button>
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