import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../layouts/Navbar";
import { FiArrowRight, FiHeart, FiShare2 } from "react-icons/fi";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Painting", "Calligraphy", "Digital Art", "Sculpture", "Photography"];

  useEffect(() => {
    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArtworks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e, artId) => {
    e.stopPropagation();
    if (!user) return alert("Please login to save artworks!");
    await updateDoc(doc(db, "users", user.uid), { wishlist: arrayUnion(artId) });
    alert("Saved to your wishlist!");
  };

  const filteredArt = activeCategory === "All" 
    ? artworks 
    : artworks.filter(art => art.category === activeCategory);

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="hero-text">
          <span className="hero-badge">Pakistan's Art Marketplace</span>
          <h1>Discover & Own <br /> <span>Original Art</span></h1>
          <div className="hero-actions">
            <a href="/register" className="btn-prime">Start Exploring <FiArrowRight /></a>
          </div>
        </div>
        <div className="hero-mosaic">
          {artworks.slice(0, 3).map((art) => (
            <div key={art.id} className="mosaic-card">
              <img src={art.imageURL} alt={art.title || "Artwork"} />
            </div>
          ))}
        </div>
      </section>

      <section className="category-section">
        <div className="category-chips">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`chip ${cat === activeCategory ? "chip-active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="gallery-section">
        <div className="masonry-grid">
          {filteredArt.map((art) => (
            <div key={art.id} className="art-card" onClick={() => navigate(`/art/${art.id}`)}>
              <div className="art-img-wrap">
                <img src={art.imageURL} alt={art.title} />
                <div className="art-overlay">
                  <button className="btn-buy" onClick={(e) => { e.stopPropagation(); navigate(`/art/${art.id}`); }}>Buy Now</button>
                  <button className="btn-icon" onClick={(e) => handleSave(e, art.id)}><FiHeart /></button>
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + '/art/' + art.id); alert("Link copied!"); }}><FiShare2 /></button>
                </div>
              </div>
              <div className="art-info">
                <p className="art-title">{art.title || (art.tags ? art.tags.title : "Untitled")}</p>
                <p className="art-artist">by {art.artistName}</p>
                <p className="art-price">PKR {art.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;