import { useState } from "react";
import Navbar from "../layouts/Navbar";
import { FiHeart, FiShare2, FiShield, FiTruck, FiRefreshCw, FiStar } from "react-icons/fi";
import "./ArtworkDetail.css";

const artwork = {
  title: "Whispering Willows",
  artist: "Sara Malik",
  location: "Lahore, Pakistan",
  price: "PKR 12,000",
  category: "Painting",
  medium: "Watercolor on Paper",
  size: '18" × 24"',
  year: "2024",
  description: "A serene landscape capturing the gentle movement of willow trees beside a quiet stream. Painted with layered watercolor washes, this piece evokes stillness and quiet contemplation. Each strand of the willow is hand-detailed, giving the painting a soft, organic depth.",
  tags: ["landscape", "watercolor", "nature", "calming", "blue"],
  rating: 4.8,
  reviews: 14,
  img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=700",
};

const moreByArtist = [
  { title: "Golden Hour", price: "PKR 22,000", img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300" },
  { title: "Sufi Verses", price: "PKR 9,000", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300" },
  { title: "Desert Bloom", price: "PKR 18,000", img: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300" },
];

const ArtworkDetail = () => {
  const [saved, setSaved] = useState(false);
  const [activeImg, setActiveImg] = useState(artwork.img);

  return (
    <div className="detail-page">
      <Navbar />

      <div className="detail-layout">

        {/* Left — Image */}
        <div className="detail-left">
          <div className="detail-main-img">
            <img src={activeImg} alt={artwork.title} />
            <button
              className={`detail-save-btn ${saved ? "saved" : ""}`}
              onClick={() => setSaved(!saved)}
            >
              <FiHeart fill={saved ? "#b84b2a" : "none"} color={saved ? "#b84b2a" : "#fff"} />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="detail-thumbs">
            {[artwork.img, ...moreByArtist.map(a => a.img)].slice(0, 3).map((src, i) => (
              <div
                key={i}
                className={`detail-thumb ${activeImg === src ? "thumb-active" : ""}`}
                onClick={() => setActiveImg(src)}
              >
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>

        {/* Right — Info */}
        <div className="detail-right">

          {/* Badge + Share */}
          <div className="detail-top-row">
            <span className="detail-badge">{artwork.category}</span>
            <button className="detail-share"><FiShare2 /> Share</button>
          </div>

          <h1 className="detail-title">{artwork.title}</h1>

          {/* Artist */}
          <div className="detail-artist">
            <div className="artist-avatar">S</div>
            <div>
              <p className="artist-name">{artwork.artist}</p>
              <p className="artist-loc">{artwork.location}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="detail-rating">
            <FiStar fill="#b84b2a" color="#b84b2a" />
            <strong>{artwork.rating}</strong>
            <span>({artwork.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="detail-price-row">
            <p className="detail-price">{artwork.price}</p>
            <span className="detail-escrow"><FiShield /> Escrow Protected</span>
          </div>

          {/* Meta */}
          <div className="detail-meta">
            <div><span>Medium</span><strong>{artwork.medium}</strong></div>
            <div><span>Size</span><strong>{artwork.size}</strong></div>
            <div><span>Year</span><strong>{artwork.year}</strong></div>
          </div>

          {/* Description */}
          <p className="detail-desc">{artwork.description}</p>

          {/* Tags */}
          <div className="detail-tags">
            {artwork.tags.map((t) => (
              <span key={t} className="detail-tag">#{t}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <button className="btn-buy-now">Buy Now</button>
            <button
              className={`btn-wishlist ${saved ? "wishlisted" : ""}`}
              onClick={() => setSaved(!saved)}
            >
              <FiHeart fill={saved ? "#b84b2a" : "none"} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>

          {/* Guarantees */}
          <div className="detail-guarantees">
            <div><FiShield /><span>Secure escrow payment</span></div>
            <div><FiTruck /><span>Insured delivery</span></div>
            <div><FiRefreshCw /><span>7-day return policy</span></div>
          </div>

        </div>
      </div>

      {/* More by Artist */}
      <div className="more-by-artist">
        <h2>More by {artwork.artist}</h2>
        <div className="more-grid">
          {moreByArtist.map((art, i) => (
            <div key={i} className="more-card">
              <img src={art.img} alt={art.title} />
              <div className="more-info">
                <p>{art.title}</p>
                <strong>{art.price}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;