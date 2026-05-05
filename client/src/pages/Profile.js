import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false); // Переключатель режимов
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");

useEffect(() => {
  const savedUser = localStorage.getItem("currentUser");

  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    setUsername(parsedUser.username);

    fetch(`http://localhost:5000/users/${parsedUser.user_id}/address`)
      .then((res) => res.json())
      .then((data) => setAddress(data.address_text))
      .catch(() => setAddress(""));
  }
}, []);

const saveProfile = async () => {
  if (!username.trim()) {
    alert("Введіть ім'я");
    return;
  }

  const response = await fetch(`http://localhost:5000/users/${user.user_id}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password: newPassword,
    }),
  });

  if (response.ok) {
    const updatedUser = await response.json();

    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setNewPassword("");

    alert("Профіль оновлено");
  } else {
    const error = await response.text();
    alert(error);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const url = isRegistering 
      ? "http://localhost:5000/users" 
      : "http://localhost:5000/users/login";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        localStorage.setItem("currentUser", JSON.stringify(data));
      } else {
        setError(isRegistering ? "Цей логін уже зайнятий" : "Невірний логін або пароль");
      }
    } catch (err) {
      setError("Помилка з'єднання з сервером");
    }
  };

  const saveAddress = async () => {
  if (!address.trim()) {
    alert("Введіть адресу");
    return;
  }

  const response = await fetch(`http://localhost:5000/users/${user.user_id}/address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address_text: address,
    }),
  });

  if (response.ok) {
    alert("Адресу збережено");
    setAddress("");
  } else {
    const error = await response.text();
    alert(error);
  }
};

  if (!user) {
    return (
      <main className="page">
        <div className="auth-container">
          <h1 style={{ textAlign: 'center', color: '#004fc4' }}>
            {isRegistering ? "Реєстрація" : "Вхід"}
          </h1>
          {error && <div className="error-message">{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <input 
              placeholder="Виберіть логін" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Придумайте пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit">
              {isRegistering ? "Створити акаунт" : "Увійти"}
            </button>
          </form>
          
          <button 
            className="btn-link" 
            style={{ background: 'none', border: 'none', color: '#004fc4', cursor: 'pointer', marginTop: '10px', width: '100%' }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Вже є акаунт? Увійти" : "Немає акаунту? Зареєструватися"}
          </button>
        </div>
      </main>
    );
  }

  return (
  <main className="page profile-page">
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>

        <h2>{user.username}</h2>
        <p>Користувач GoEats</p>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("currentUser");
            setUser(null);
          }}
        >
          Вийти
        </button>
      </aside>

      <section className="profile-main-card">
        <h1>Профіль</h1>
        <p className="profile-subtitle">
          Керуйте особистими даними та адресою доставки
        </p>

        <div className="profile-grid">
          <div className="profile-field">
            <label>Ім'я користувача</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <label>Новий пароль</label>
            <input
              type="password"
              placeholder="Залиште пустим, якщо не змінюєте"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="profile-field profile-field-wide">
            <label>Адреса доставки</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Введіть адресу доставки"
            />
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={saveProfile}>Зберегти профіль</button>
          <button onClick={saveAddress}>Зберегти адресу</button>
        </div>
      </section>
    </div>
  </main>
);
}

export default Profile;