import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function RestaurantMenu() {
  const { restaurant_id } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/menu/restaurant/${restaurant_id}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.log(error));
  }, [restaurant_id])
  
  const addToCart = (product) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find((item) => item.item_id === product.item_id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      restaurant_id: Number(restaurant_id),
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Додано в кошик");
};

  return (
    <main className="page">
      <h1>Меню ресторана</h1>

      <div className="products">
        {products.map((product) => (
          <div className="product-card" key={product.item_id}>
            {product.image_url ? (
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="restaurant-img" 
        />
      ) : (
        <div className="product-image">🍽️</div>
      )}

      <h3>{product.name}</h3>
      <p>{product.price} ₴</p>
      
      <button onClick={() => addToCart(product)}>
        Додати у кошик
      </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default RestaurantMenu;