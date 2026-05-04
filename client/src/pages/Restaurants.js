import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants(data))
      .catch((error) => console.log(error));
  }, []);

  return (
    <main className="page">
      <h1>Всі заклади</h1>

      <div className="products">
        {restaurants.map((restaurant) => (
          <div className="product-card" key={restaurant.restaurant_id}>
            <h3>{restaurant.name}</h3>
            <p>Ресторан №{restaurant.restaurant_id}</p>

            <Link
              className="btn"
              to={`/restaurants/${restaurant.restaurant_id}/menu`}
            >
              Дивитися меню
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Restaurants;