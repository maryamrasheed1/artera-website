import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation here
import { addDoc, collection } from "firebase/firestore"; // Ensure imports are correct
import { db } from "../firebase";
import logo from "../assets/logo.png";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 1. Define location
  const { art } = location.state || {}; // 2. Destructure after defining
  
  const [formData, setFormData] = useState({ name: "", address: "", phone: "" });

  // Safety check: Redirect if no artwork is selected
  if (!art) {
    return <div className="loading">No artwork selected. <button onClick={() => navigate("/")}>Go Home</button></div>;
  }

  const numericPrice = art?.price ? parseInt(art.price.toString().replace(/[^0-9]/g, '')) : 0;
  const shipping = 200;
  const total = numericPrice + shipping;

  const handlePay = async () => {
    try {
      // 3. Logic to save to Firestore
      await addDoc(collection(db, "orders"), {
        ...formData,
        total,
        status: "confirmed",
        artworkId: art.id
      });
      alert("Payment Successful! Order Confirmed.");
      navigate("/");
    } catch (error) {
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="checkout-page">
      <header className="page-header">
        <img src={logo} alt="Artera Logo" className="logo" onClick={() => navigate("/")} />
      </header>

      <div className="checkout-grid">
        <div className="checkout-form">
          <h2>Shipping Information</h2>
          <input type="text" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="Delivery Address" onChange={(e) => setFormData({...formData, address: e.target.value})} />
          <input type="text" placeholder="Phone Number" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          <button className="btn-pay-now" onClick={handlePay}>Confirm & Pay</button>
        </div>

       {/* Right: Order Summary */}
<div className="order-summary">
  <h3>Order Summary</h3>
  
  {/* Added Image and Title */}
  <div className="summary-art-preview">
    <img src={art.imageURL} alt={art.tags?.title || art.title} />
    <p>{art.tags?.title || art.title}</p>
  </div>
  <hr />

  <div className="summary-row"><span>Subtotal</span><span>PKR {numericPrice.toLocaleString()}</span></div>
  <div className="summary-row"><span>Shipping</span><span>PKR {shipping.toLocaleString()}</span></div>
  <hr />
  <div className="summary-row total"><span>Total</span><span>PKR {total.toLocaleString()}</span></div>
</div>
      </div>
    </div>
  );
};

export default Checkout;