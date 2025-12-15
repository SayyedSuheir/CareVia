"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/app/_context/useAuth";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
const PostFormWithImage = () => {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    area: "",
    city: "",
    image: "",
    village: "",
    description: "",
    Type: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAI, setCheckingAI] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categories = ["food", "clothes", "electronics", "furniture", "other"];

  const areaRef = useRef(null);
  const cityRef = useRef(null);
  const villageRef = useRef(null);
  const imageInputRef = useRef(null);
  let autocompleteArea, autocompleteCity, autocompleteVillage;

  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      autocompleteArea = new window.google.maps.places.Autocomplete(areaRef.current, { types: ["geocode"] });
      autocompleteArea.addListener("place_changed", () => {
        const place = autocompleteArea.getPlace();
        const area = place.address_components?.[0]?.long_name || "";
        setFormData((prev) => ({ ...prev, area }));
      });

      autocompleteCity = new window.google.maps.places.Autocomplete(cityRef.current, { types: ["(cities)"] });
      autocompleteCity.addListener("place_changed", () => {
        const place = autocompleteCity.getPlace();
        const city = place.address_components?.[0]?.long_name || "";
        setFormData((prev) => ({ ...prev, city }));
      });

      autocompleteVillage = new window.google.maps.places.Autocomplete(villageRef.current, { types: ["geocode"] });
      autocompleteVillage.addListener("place_changed", () => {
        const place = autocompleteVillage.getPlace();
        const village = place.address_components?.[0]?.long_name || "";
        setFormData((prev) => ({ ...prev, village }));
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      setError("Please select an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setCheckingAI(true);
    setError("");
    try {
      const formDataAI = new FormData();
      formDataAI.append("image", file);

      const res = await fetch("/api/image/validate", {
        method: "POST",
        body: formDataAI,
      });

      const data = await res.json();
     console.log("🔍 Validation response:", data);

if (!data.success) {
    toast.error(data.reason || "AI validation failed");
    setError(data.reason || "AI validation failed");
    setImageFile(null);
    setImagePreview(null);
    return;
}


      // Check AI-generated probability
      const aiProb = data.result?.type?.ai_generated || 0;
      if (aiProb > 0.9) {
        setError("Image appears to be AI-generated. Please upload a real photo.");
        setImageFile(null);
        setImagePreview(null);
        setCheckingAI(false);
        return;
      }

      // ✅ Passed AI check
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
      toast.success("Image validated successfully!");

    } catch (err) {
      console.error("AI validation error:", err);
      setError("Failed to validate image. Try again.");
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setCheckingAI(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!imageFile) {
      setError("Please upload a valid image before submitting.");
      setLoading(false);
      return;
    }

    try {
      const fullAddress = `${formData.area}, ${formData.city}, ${formData.village}`;
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("address", fullAddress);
      dataToSend.append("description", formData.description);
      dataToSend.append("Type", formData.Type);
      dataToSend.append("image", imageFile);
      dataToSend.append("area", formData.area);
      dataToSend.append("city", formData.city);
      dataToSend.append("village", formData.village);

      const res = await fetch("/api/postsaction/createPost", {
        method: "POST",
        credentials: "include",
        body: dataToSend,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success("Post created successfully!");
        setFormData({ name: "", area: "", city: "",image: "", village: "", description: "", Type: "" });
        setImageFile(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        if (imageInputRef.current) {
       imageInputRef.current.value = ""; // <-- clear the file input
      }
      } else {
        setError(data.error || "Failed to create post.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <p>Loading...</p>;
  if (!isLoggedIn) return <p>Please login to create a post</p>;

  return (
    <div className="postform-container">
      <div className="mobile-note">
      
      {/* <i className="pin"></i> */}
      <blockquote className="note yellow">
        Note: To keep CareVia safe and trustworthy, this form uses AI image detection. 
          Any AI-generated images or images that violate our guidelines will not be published.
        <cite className="author">CareVia</cite>
      </blockquote>
      </div>
      
      <form onSubmit={handleSubmit} className="postform-form">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded">Post created successfully!</div>}
        <div className="postform-title">
          <h2>Create a Kind Donation</h2>
        </div>
        <div className="postform-body">
          <div className="postform-input">
            <div className="postform-input-itemname">
              <input type="text" name="name" placeholder="Item Name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="postform-input-image">
              <input type="file" accept="image/*" onChange={handleImageChange}  ref={imageInputRef} required />
              {checkingAI && <p>Checking image safety...</p>}
              {imagePreview && <Image src={imagePreview} alt="preview" width={200} height={200} className="imgpre" />}
            </div>
            <div className="postform-input-village">
             <input type="text" name="village" ref={villageRef} value={formData.village} onChange={handleChange} placeholder="Village" required />
            </div>
            <div className="postform-input-area">
              <input type="text" name="area" ref={areaRef} value={formData.area} onChange={handleChange} placeholder="Area" required />
            </div>
            <div className="postform-input-city">
             <input type="text" name="city" ref={cityRef} value={formData.city} onChange={handleChange} placeholder="City" required />
            </div>
          </div>
          <div className="postform-select">
            <select name="Type" value={formData.Type} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="postform-description">
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
          </div>
        </div>
        <div className="postform-btn">
          <button type="submit" disabled={loading || checkingAI || !imageFile}>
            {loading ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </form>
      <div className="quote-container">
      {/* <i className="pin"></i> */}
      <blockquote className="note yellow">
        Note: To keep CareVia safe and trustworthy, this form uses AI image detection. 
          Any AI-generated images or images that violate our guidelines will not be published.
        <cite className="author">CareVia</cite>
      </blockquote>
      </div>
    </div>
  );
};

export default PostFormWithImage;
