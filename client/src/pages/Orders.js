import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((error) => console.log(error));
  }, []);

  const toggleOrder = async (order_id) => {
    // закрыть если уже открыт
    if (openOrderId === order_id) {
      setOpenOrderId(null);
      return;
    }

    setOpenOrderId(order_id);

    // если ещё не загружали — загружаем
    if (!orderItems[order_id]) {
      try {
        const res = await fetch(
          `http://localhost:5000/orders/${order_id}/items`
        );
        const data = await res.json();

        setOrderItems((prev) => ({
          ...prev,
          [order_id]: data,
        }));
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
  const loadOrders = () => {
    fetch("http://localhost:5000/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((error) => console.log(error));
  };

  loadOrders(); // первый запуск

  const interval = setInterval(loadOrders, 5000); // каждые 5 сек

  return () => clearInterval(interval); // очистка
}, []);

const getStatusText = (status) => {
  switch (status) {
    case "created":
      return "Створено";
    case "in_progress":
      return "Готується";
    case "on_the_way":
      return "В дорозі";
    case "delivered":
      return "Доставлено";
    default:
      return "Невідомо";
  }
};

  return (
    <main className="page">
      <h1>Мої замовлення</h1>

      {orders.length === 0 ? (
        <p>У вас ще немає замовлень.</p>
      ) : (
        orders.map((order) => (
          <div className="cart-item" key={order.order_id}>
            <h3>{order.restaurant_name}</h3>
            <p>Номер: {order.order_id}</p>
            <p>Сума: {order.total_amount} ₴</p>
            <p>Дата: {new Date(order.order_date).toLocaleString()}</p>
            <p>Статус: {getStatusText(order.delivery_status) || "Створено"}</p>
            <p>Кур'єр: {order.courier_name || "ще не призначений"}</p>

            <button onClick={() => toggleOrder(order.order_id)}>
              {openOrderId === order.order_id
                ? "Сховати склад"
                : "Показати склад"}
            </button>

            {openOrderId === order.order_id && (
              <div className="order-details">
                <h4>Склад замовлення:</h4>

                {orderItems[order.order_id]?.map((item) => (
                  <div key={item.item_id}>
                    {item.name} × {item.quantity} ({item.price} ₴)
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </main>
  );
}

export default Orders;