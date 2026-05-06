import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Restaurants from "./pages/Restaurants";
import RestaurantMenu from "./pages/RestaurantMenu";
import Orders from "./pages/Orders";

import "./styles/style.css";

function App() {
  return (
    <div className="App">
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:restaurant_id/menu" element={<RestaurantMenu />} />
      </Routes>
    </BrowserRouter>
    <ToastContainer 
        position="bottom-right" 
        autoClose={2000} 
        hideProgressBar={false}
        theme="colored"
      />
    </div>
  );
}

export default App;