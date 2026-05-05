import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false); // Переключатель режимов
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [address, setAddress] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Определяем адрес в зависимости от режима
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
        const message = await response.text();
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
    <main className="page">
        <h1>Профіль: {user.username}</h1>
        <button onClick={() => { localStorage.removeItem("currentUser"); setUser(null); }}>Вийти</button>

        <h2>Моя адреса</h2>

<input
  placeholder="Введіть адресу доставки"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
/>

<button onClick={saveAddress}>
  Зберегти адресу
</button>
    </main>
  );
}

export default Profile;