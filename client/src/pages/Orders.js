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

const changeStatus = async (order_id, newStatus) => {
  const response = await fetch(`http://localhost:5000/orders/${order_id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      delivery_status: newStatus,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    alert(error);
    return;
  }

  const res = await fetch("http://localhost:5000/orders");
  const data = await res.json();
  setOrders(data);
};

const deleteOrder = async (order_id) => {
  const confirmDelete = window.confirm(
    "Ви точно хочете видалити це замовлення?"
  );

  if (!confirmDelete) return;

  const response = await fetch(`http://localhost:5000/orders/${order_id}`, {
    method: "DELETE",
  });

  if (response.ok) {
    setOrders(orders.filter((order) => order.order_id !== order_id));
  } else {
    const error = await response.text();
    alert(error);
  }
};

const deleteAllOrders = async () => {
  const confirmDelete = window.confirm(
    "Ви точно хочете видалити ВСІ замовлення?"
  );

  if (!confirmDelete) return;

  const response = await fetch("http://localhost:5000/orders", {
    method: "DELETE",
  });

  if (response.ok) {
    setOrders([]);
  } else {
    const error = await response.text();
    alert(error);
  }
};

const addReview = async (order) => {
  const rating = prompt("Оцінка від 1 до 5:");
  const comment = prompt("Коментар:");

  if (!rating) return;

  const response = await fetch("http://localhost:5000/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer_id: order.customer_id,
      restaurant_id: order.restaurant_id,
      courier_id: order.courier_id,
      rating: Number(rating),
      comment: comment || "",
    }),
  });

  if (response.ok) {
    alert("Відгук додано");
  } else {
    const error = await response.text();
    alert(error);
  }
};

const changeOrderStatus = async (order_id, status) => {
  const response = await fetch(
    `http://localhost:5000/orders/${order_id}/order-status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_status: status,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    alert(error);
    return;
  }

  const res = await fetch("http://localhost:5000/orders");
  const data = await res.json();
  setOrders(data);
};


  return (
    <main className="page">
      <h1>Мої замовлення</h1>

      {orders.length > 0 && (
  <button className="delete-btn" onClick={deleteAllOrders}>
    Видалити всі замовлення
  </button>
)}


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
            
            <div className="status-buttons">
              <button onClick={() => changeStatus(order.order_id, "created")}>
                Створено
                </button>
                <button onClick={() => changeStatus(order.order_id, "in_progress")}>
                  Готується
                  </button>
                  <button onClick={() => changeStatus(order.order_id, "on_the_way")}>
                    В дорозі
                    </button>
                    <button onClick={() => changeStatus(order.order_id, "delivered")}>
                      Доставлено
                      </button>
                      </div>
            <p>Кур'єр: {order.courier_name || "ще не призначений"}</p>

            <button onClick={() => toggleOrder(order.order_id)}>
              {openOrderId === order.order_id
                ? "Сховати моє замовлення"
                : "Показати моє замовлення"}
            </button>

            <button onClick={() => addReview(order)}>
  Залишити відгук
</button>

            <button
  className="delete-btn"
  onClick={() => deleteOrder(order.order_id)}
>
  Видалити замовлення
</button>

            {openOrderId === order.order_id && (
              <div className="order-details">
                <h4>Склад замовлення:</h4>

                {orderItems[order.order_id]?.map((item) => (
                  <div key={item.item_id}>
                    {item.name} × {item.quantity} шт ({item.price} ₴)
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