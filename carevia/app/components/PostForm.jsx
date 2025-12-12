"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/_context/useAuth';
import { useRouter } from 'next/navigation';

const PostFormWithImage = () => {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    city: '',
    village: '',
    description: '',
    Type: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['food', 'clothes', 'electronics', 'furniture', 'other'];

  // Google Places Autocomplete refs
  const areaRef = useRef(null);
  const cityRef = useRef(null);
  const villageRef = useRef(null);
  let autocompleteArea, autocompleteCity, autocompleteVillage;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      autocompleteArea = new window.google.maps.places.Autocomplete(areaRef.current, { types: ['geocode'] });
      autocompleteArea.addListener('place_changed', () => {
        const place = autocompleteArea.getPlace();
        if (place.address_components) {
          const area = place.address_components[0]?.long_name || '';
          setFormData(prev => ({ ...prev, area }));
        }
      });

      autocompleteCity = new window.google.maps.places.Autocomplete(cityRef.current, { types: ['(cities)'] });
      autocompleteCity.addListener('place_changed', () => {
        const place = autocompleteCity.getPlace();
        const city = place.address_components[0]?.long_name || '';
        setFormData(prev => ({ ...prev, city }));
      });

      autocompleteVillage = new window.google.maps.places.Autocomplete(villageRef.current, { types: ['geocode'] });
      autocompleteVillage.addListener('place_changed', () => {
        const place = autocompleteVillage.getPlace();
        const village = place.address_components[0]?.long_name || '';
        setFormData(prev => ({ ...prev, village }));
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    } else {
      setImageFile(null);
      setImagePreview(null);
      setError('Please select a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!imageFile) {
        setError('Please select an image');
        setLoading(false);
        return;
      }

      const fullAddress = `${formData.area}, ${formData.city}, ${formData.village}`;

      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('address', fullAddress);
      dataToSend.append('description', formData.description);
      dataToSend.append('Type', formData.Type);
      dataToSend.append('image', imageFile);
      dataToSend.append('area', formData.area);
      dataToSend.append('city', formData.city);
      dataToSend.append('village', formData.village);

      const res = await fetch('/api/postsaction/createPost', {
        method: 'POST',
        credentials: 'include',
        body: dataToSend,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        alert('Post created successfully!');
        setFormData({ name: '', area: '', city: '', village: '', description: '', Type: '' });
        setImageFile(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="reg-terms">Please login to create a post</p>
          <button
            onClick={() => router.push('/loginPage')}
            className="btn-primary reg-btn bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="postform-container">
      <form onSubmit={handleSubmit} className="postform-form">
        <h2 className="postform-title">Donate Item</h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">Post created successfully!</div>}

        {/* Item Name */}
        <div className='postform-itemname'>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Item Name *</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Winter Jacket, Rice Bag, Laptop"
            required
            minLength={2}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
        </div>

        {/* Image Upload */}
        <div className='postform-image border-t pt-6'>
          <label htmlFor="image-upload" className="block text-sm font-semibold text-gray-700 mb-2">Upload Item Image * (Required)</label>
          <input
            type="file"
            name="image-upload"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="btn-upload-image"
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="postform-imgpre mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
            <div className="w-full h-64 overflow-hidden rounded-lg shadow-md border-2 border-dashed border-gray-300">
              <Image src={imagePreview} alt="Item Preview" width={300} height={300} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Address Fields with Google Autocomplete */}
        <div className="postform-address relative mt-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Location *</label>

          <div className="mb-4">
            <input
              type="text"
              name="village"
              id="village"
              ref={villageRef}
              value={formData.village}
              onChange={handleChange}
              placeholder="Village, Street, or Nearest Landmark (Required)"
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
          </div>

          <div className="mb-4">
            <input
              type="text"
              name="area"
              id="area"
              ref={areaRef}
              value={formData.area}
              onChange={handleChange}
              placeholder="Area / Neighborhood (Required)"
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
          </div>

          <div className="mb-4">
            <input
              type="text"
              name="city"
              id="city"
              ref={cityRef}
              value={formData.city}
              onChange={handleChange}
              placeholder="City / District (Required)"
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
          </div>

          {user?.phoneNumber && !formData.village.includes(user.phoneNumber) && (
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, village: `${prev.village}${prev.village ? ' - ' : ''}${user.phoneNumber}` }))}
              className="btn-primary"
            >
              Add Phone to Pickup Details
            </button>
          )}
        </div>

        {/* Category */}
        <div className='postform-cate'>
          <label htmlFor="Type" className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
          <div className="custom-select-container">
            <button
              type="button"
              className={`custom-select-button ${!formData.Type ? 'placeholder' : ''} ${showCategoryDropdown ? 'open' : ''}`}
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span className="selected-text">
                {formData.Type ? formData.Type.charAt(0).toUpperCase() + formData.Type.slice(1) : 'Select a category'}
              </span>
              <svg className="custom-select-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCategoryDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                <div className="custom-select-dropdown">
                  {categories.map(category => (
                    <div
                      key={category}
                      className={`custom-select-option ${formData.Type === category ? 'selected' : ''}`}
                      onClick={() => { handleChange({ target: { name: 'Type', value: category } }); setShowCategoryDropdown(false); }}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className='postform-decr'>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            id="description"
            rows="6"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the item condition, size, and any other details..."
            required
            minLength={10}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-y"
          />
        </div>

        {/* Submit */}
        <div className='postform-create pt-4'>
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostFormWithImage;
