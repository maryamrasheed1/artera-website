import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// 1. Upload file to Cloudinary with explicit error handling
export const uploadArtworkFile = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          downloadURL: data.secure_url,
          storagePath: data.public_id,
        });
      } else {
        reject(new Error("Cloudinary upload failed: " + xhr.statusText));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network upload error")));

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`
    );
    xhr.send(formData);
  });
};

// 2. Save artwork with try/catch error handling
export const saveArtwork = async (artworkData) => {
  try {
    const docRef = await addDoc(collection(db, "artworks"), {
      ...artworkData,
      createdAt: serverTimestamp(),
      views: 0,
      saves: 0,
      sold: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving artwork:", error);
    throw new Error("Could not save artwork to database.");
  }
};

// 3. Fetch artworks
export const getAllArtworks = async () => {
  const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getArtistArtworks = async (artistId) => {
  if (!artistId) return [];
  const q = query(collection(db, "artworks"), where("artistId", "==", artistId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getArtwork = async (id) => {
  const docSnap = await getDoc(doc(db, "artworks", id));
  if (!docSnap.exists()) throw new Error("Artwork not found.");
  return { id: docSnap.id, ...docSnap.data() };
};

// 4. Update and Delete
export const updateArtwork = async (id, data) => {
  try {
    await updateDoc(doc(db, "artworks", id), data);
  } catch (error) {
    console.error("Error updating artwork:", error);
    throw error;
  }
};

// Helper to specifically mark artwork as sold
export const markArtworkAsSold = async (id) => {
  await updateDoc(doc(db, "artworks", id), { sold: true });
};

export const deleteArtwork = async (id) => {
  try {
    await deleteDoc(doc(db, "artworks", id));
  } catch (error) {
    console.error("Error deleting artwork:", error);
    throw error;
  }
};