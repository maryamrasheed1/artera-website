import { useState } from "react";
import { FiX, FiUploadCloud } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { uploadArtworkFile, saveArtwork } from "../../services/artworkService";
import { createPortal } from "react-dom";
import "./UploadModal.css";

const categories = ["Painting", "Calligraphy", "Digital Art", "Sculpture", "Photography", "Mixed Media"];

const UploadModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    tags: "",
    forSale: true,
  });

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!file) { setError("Please select an image."); return; }
  setError("");
  setUploading(true);

  try {
    // 1. Upload file to Cloudinary
    const { downloadURL, storagePath } = await uploadArtworkFile(
      file,
      setProgress
    );

    // 2. Save metadata to Firestore
    await saveArtwork({
      title: formData.title,
      category: formData.category,
      price: formData.price ? Number(formData.price) : null,
      description: formData.description,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      forSale: formData.forSale,
      imageURL: downloadURL,
      storagePath,
      artistId: user.uid,
      artistName: user.name,
      status: "Listed",
    });

    if (onSuccess) onSuccess();
    onClose();
  } catch (err) {
    setError("Upload failed: " + err.message);
  } finally {
    setUploading(false);
    setProgress(0);
  }
};
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Upload Artwork</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">

            <div className="upload-zone-wrap">
              <div
                className={`upload-zone ${dragOver ? "drag-over" : ""} ${preview ? "has-preview" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input").click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="upload-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <FiUploadCloud />
                    <p>Drag & drop your artwork here</p>
                    <span>or click to browse</span>
                    <small>PNG, JPG, MP4 up to 50MB</small>
                  </div>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {preview && (
                <button
                  type="button"
                  className="remove-preview"
                  onClick={() => { setFile(null); setPreview(null); }}
                >
                  Remove & re-upload
                </button>
              )}
              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p>{progress}% uploaded</p>
                </div>
              )}
            </div>

            <div className="modal-fields">
              <div className="field-group">
                <label>Title *</label>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g. Whispering Willows"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field-group">
                  <label>Price (PKR)</label>
                  <input
                    name="price"
                    type="number"
                    placeholder="e.g. 12000"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Tell buyers about this piece..."
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label>Tags</label>
                <input
                  name="tags"
                  type="text"
                  placeholder="e.g. abstract, watercolor, blue"
                  value={formData.tags}
                  onChange={handleChange}
                />
                <small className="field-hint">Separate with commas</small>
              </div>

              <div className="field-toggle">
                <div>
                  <p className="toggle-label">List for sale</p>
                  <p className="toggle-sub">Buyers can purchase this directly</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="forSale"
                    checked={formData.forSale}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {error && <p style={{ color: "#b84b2a", fontSize: "0.83rem" }}>{error}</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn-upload" disabled={uploading}>
              {uploading ? `Uploading ${progress}%...` : "Publish Artwork"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default UploadModal;