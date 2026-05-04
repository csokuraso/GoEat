import { useEffect, useState } from "react";

function Catalog() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
  fetch("http://localhost:5000/menu")
    .then((res) => res.json())
    .then((data) => setProducts(data))
    .catch((error) => console.log(error));
}, []);

  return (
    <main className="page">
      <h1>Каталог</h1>

      <div className="products">
        {products.map((product) => (
          <div className="product-card" key={product.item_id}>
            <div className="product-image">🍽️</div>
            <h3>{product.name}</h3>
            <p>{product.price} ₴</p>
            <button>Додати у кошик</button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Catalog;