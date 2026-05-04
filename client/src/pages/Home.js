import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import food from "../assets/sushi.png";
import burger from "../assets/categories/burger.png";
import sushi from "../assets/categories/sushi.png";
import pizza from "../assets/categories/pizza.png";
import wine from "../assets/categories/wine.png";

function Home() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <main className="hero">
  <div className="hero-content">
    <div className="hero-text">
      <h1>ТВІЙ УЛЮБЛЕНИЙ РЕСТОРАН — ТЕПЕР У ТЕБЕ ВДОМА</h1>

      <p>
        Відкрий для себе найкращі страви міста, не виходячи з дому.
        Швидка доставка та справжній смак.
      </p>

      <Link to="/restaurants" className="btn">
        Перейти до ресторанів
      </Link>
    </div>

    <div className="hero-image">
      <img src={food} alt="food" />
    </div>
  </div>
</main>

<section className="home-section">
  <h2>Можемо доставити до Вас</h2>

  <div className="categories-grid">
    <div className="category-card">
      <img src={burger} alt="burger" />
      <p>Бургери</p>
    </div>

    <div className="category-card">
      <img src={sushi} alt="sushi" />
      <p>Суші</p>
    </div>

    <div className="category-card">
      <img src={pizza} alt="pizza" />
      <p>Піца</p>
    </div>

    <div className="category-card">
      <img src={wine} alt="wine" />
      <p>Напої</p>
    </div>
  </div>
</section>

     <section className="home-section">
  <h2>Відгуки клієнтів</h2>

  {reviews.length === 0 ? (
    <p className="section-subtitle">Поки що немає відгуків.</p>
  ) : (
    <div className="reviews">
      {reviews.map((review) => (
        <div className="review-card" key={review.review_id}>
          <h3>{review.username || "Клієнт"}</h3>
          <p className="rating">Оцінка: {review.rating} / 5</p>
          <p>{review.comment || "Без коментаря"}</p>

          {review.restaurant_name && (
            <p className="review-restaurant">
              Ресторан: {review.restaurant_name}
            </p>
          )}
        </div>
      ))}
    </div>
  )}
</section>

    <section className="home-section contact-section">
  <h2>Зв'язатися з нами</h2>

  <div className="contact-content">
    <div className="contact-info">
      <p><strong>Телефон:</strong> +380 00 000 00 00</p>
      <p><strong>Email:</strong> support@deliverygo.com</p>
      <p><strong>Адрес:</strong> г. Запоріжжя</p>
    </div>
  </div>
</section>
    </>
  );
}

export default Home;