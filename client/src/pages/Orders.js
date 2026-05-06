import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const loadOrders = async (currentUser) => {
    if (!currentUser) return;

    fetch(`http://localhost:5000/orders?user_id=${currentUser.user_id}`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (!user) return;

    loadOrders(user);

    const interval = setInterval(() => {
      loadOrders(user);
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

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
          `http://localhost:5000/orders/${order_id}/items`,
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
    const response = await fetch(
      `http://localhost:5000/orders/${order_id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delivery_status: newStatus,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      alert(error);
      return;
    }

    const res = await fetch(
      `http://localhost:5000/orders?user_id=${user.user_id}`,
    );
    const data = await res.json();
    setOrders(data);
  };

  const deleteOrder = async (order_id) => {
    const confirmDelete = window.confirm(
      "Ви точно хочете видалити це замовлення?",
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
      "Ви точно хочете видалити ВСІ замовлення?",
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

  return (
    <main className="page orders-page">
      <div className="orders-header">
        <h1>Мої замовлення</h1>
        {orders.length > 0 && (
          <button className="delete-all-btn" onClick={deleteAllOrders}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/9790/9790368.png" 
                  alt="Видалити" 
                  className="delete-all-icon"
                />
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="empty-message">У вас ще немає замовлень.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.order_id}>
              
              <div className="order-main-info">
                <h3>{order.restaurant_name}</h3>
                <p className="order-meta">Номер: <span>{order.order_id}</span></p>
                <p className="order-meta">Сума: <strong>{order.total_amount} ₴</strong></p>
                <p className="order-meta">Дата: {new Date(order.order_date).toLocaleString()}</p>
                <p className={`status-badge ${order.delivery_status}`}>
                  Статус: {getStatusText(order.delivery_status)}
                </p>
                <p className="courier-info">Кур'єр: {order.courier_name || "Пошук..."}</p>
              </div>

              <button className="delete-btn-absolute" onClick={() => deleteOrder(order.order_id)}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3096/3096673.png" 
                  alt="Видалити" 
                  className="delete-icon-large"
                />
              </button>

              {user?.role_id === 1 && (
                <div className="admin-status-panel">
                  <button onClick={() => changeStatus(order.order_id, "created")} className="st-btn created">Створено</button>
                  <button onClick={() => changeStatus(order.order_id, "in_progress")} className="st-btn progress">Готується</button>
                  <button onClick={() => changeStatus(order.order_id, "on_the_way")} className="st-btn way">В дорозі</button>
                  <button onClick={() => changeStatus(order.order_id, "delivered")} className="st-btn done">Доставлено</button>
                </div>
              )}

              <div className="order-actions">
                <button className="action-link" onClick={() => toggleOrder(order.order_id)}>
                  {openOrderId === order.order_id ? "▲ Сховати склад" : "▼ Показати моє замовлення"}
                </button>
                <button className="action-link review" onClick={() => addReview(order)}>
                  ✎ Залишити відгук
                </button>
              </div>

              {openOrderId === order.order_id && (
                <div className="order-details-expand">
                  <h4>Склад замовлення:</h4>
                  {orderItems[order.order_id]?.map((item) => (
                    <div className="item-row" key={item.item_id}>
                      <span>{item.name} × {item.quantity} шт</span>
                      <span>{item.price} ₴</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Orders;