import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { FiHeart, FiShare2 } from "react-icons/fi";
import "./ArtDetail.css";

const ArtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [art, setArt] = useState(null);
  const [relatedArt, setRelatedArt] = useState([]);

  useEffect(() => {
    const fetchArt = async () => {
      const docSnap = await getDoc(doc(db, "artworks", id));
      if (docSnap.exists()) {
        const artData = { id: docSnap.id, ...docSnap.data() };
        setArt(artData);
        
        const q = query(collection(db, "artworks"), where("artistName", "==", artData.artistName));
        const querySnapshot = await getDocs(q);
        setRelatedArt(querySnapshot.docs.filter(d => d.id !== id).map(d => ({ id: d.id, ...d.data() })));
      }
    };
    fetchArt();
  }, [id]);

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) return alert("Please login to save to your wishlist!");
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { wishlist: arrayUnion(id) });
    alert("Added to your wishlist!");
  };

  const handleShare = async () => {
    const shareData = {
      title: art.tags?.title || art.title,
      text: `Check out this artwork by ${art.artistName}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (!art) return <div className="loading">Loading artwork details...</div>;

  return (
    <div className="art-detail-page">
        
      <img src={art.imageURL} alt={art.tags?.title || "Artwork"} />
      
      <div className="detail-content">
        <h1>{art.tags?.title || art.title}</h1>
        <p className="art-artist">by {art.artistName}</p>
        <p className="art-detail-price">PKR {art.price}</p>
        <p className="art-description">{art.description || "A stunning piece of original art."}</p>
        
        <div className="art-detail-actions">
        <button 
  onClick={() => navigate("/checkout", { state: { art: art } })} 
  className="btn-buy-now"
>
  Buy Now
</button>
          <button className="btn-icon" onClick={handleWishlist}>
            <FiHeart />
          </button>
          <button className="btn-icon" onClick={handleShare}>
            <FiShare2 />
          </button>
        </div>
      </div>

      <section className="explore-more">
        <h3>Explore More from {art.artistName}</h3>
        <div className="related-grid">
           {relatedArt.map(item => (
             <div key={item.id} className="related-card" onClick={() => navigate(`/art/${item.id}`)}>
               <img src={item.imageURL} alt={item.tags?.title} />
               <p>{item.tags?.title || item.title}</p>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default ArtDetail;