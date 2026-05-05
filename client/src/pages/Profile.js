import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/users/${currentUserId}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((error) => console.log(error));
  }, [currentUserId]);

  if (!user) {
    return (
      <main className="page">
        <p>Завантаження профілю...</p>
      </main>
    );
  }

  const isAdmin = user.role_id === 1;
  const isUser = user.role_id === 3;

  return (
    <main className="page">
      <h1>Профіль</h1>

      <div className="cart-item">
        <label>Обрати користувача:</label>

        <select
          value={currentUserId}
          onChange={(e) => setCurrentUserId(e.target.value)}
        >
          <option value={1}>Admin</option>
          <option value={26}>User</option>
        </select>
      </div>

      <div className="cart-item">
        <h3>{user.username}</h3>
        <p>
          Роль: {isAdmin ? "Адміністратор" : "Користувач"}
        </p>
      </div>

      {isAdmin && (
        <div className="cart-item">
          <h2>Панель адміністратора</h2>

          <button onClick={() => navigate("/orders")}>
            Керувати замовленнями
          </button>

          <button onClick={() => navigate("/restaurants")}>
            Ресторани
          </button>
        </div>
      )}

      {isUser && (
        <div className="cart-item">
          <h2>Кабінет користувача</h2>

          <button onClick={() => navigate("/orders")}>
            Мої замовлення
          </button>

          <button onClick={() => navigate("/")}>
            Перейти до меню
          </button>
        </div>
      )}
    </main>
  );
}

export default Profile;