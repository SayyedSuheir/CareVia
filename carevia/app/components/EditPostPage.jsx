"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/_context/useAuth';
import { useRouter, useParams } from 'next/navigation';

const EditPostPage = () => {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id;
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    Type: '',
  });

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['food', 'clothes', 'electronics', 'furniture', 'other'];

  // Fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!isLoggedIn || authLoading) return;

      try {
        const res = await fetch(`/api/postsaction/${postId}`, {
          credentials: 'include',
        });

        const data = await res.json();

        if (data.success) {
          setFormData({
            name: data.post.name,
            address: data.post.address,
            description: data.post.description,
            Type: data.post.Type,
          });
          setCurrentImage(data.post.image);
          setImagePreview(data.post.image);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error('Fetch post error:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPost();
    }
  }, [postId, isLoggedIn, authLoading]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    } else {
      setImageFile(null);
      setError('Please select a valid image file');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);

    try {
      // Create FormData object
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('address', formData.address);
      dataToSend.append('description', formData.description);
      dataToSend.append('Type', formData.Type);
      
      // Only append image if a new one was selected
      if (imageFile) {
        dataToSend.append('image', imageFile);
      }

      // Send to API
      const res = await fetch(`/api/postsaction/${postId}`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        alert('Post updated successfully!');
        router.push('/myDonation'); // Redirect to posts list
      } else {
        setError(data.error || 'Failed to update post');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check authentication
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    router.push('/loginPage');
    return null;
  }

  if (error && !formData.name) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push('/my-posts')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to My Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <form
        onSubmit={handleSubmit}
        className="form-card"
      >
        <div className="header-section">
          <h2 className="title">
            Edit Item
          </h2>
         
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="message-box error-hidden">
            {error}
          </div>
        )}
        {success && (
          <div className="message-box success-hidden">
            Post updated successfully!
          </div>
        )}

        {/* Item Name */}
        <div className="form-group">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            Item Name *
          </label>
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

        {/* Current Image Preview */}
        {imagePreview && (
          <div className="image-preview-container">
            <p className="image-label">
              {imageFile ? 'New Image Preview:' : 'Current Image:'}
            </p>
            <div className="image-box">
              <Image
                src={imagePreview}
                alt="Item Preview"
                width={300}
                height={300}
                className="item-image"
              />
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className='form-group border-top'>
          <label htmlFor="image-upload" className="label">
            Change Image (Optional - leave empty to keep current image)
          </label>
          <input
            type="file"
            name="image-upload"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address" className="label">
            Pickup Address *
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full address for item pickup"
            required
            minLength={5}
            className="input-field"
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="label">
            Description *
          </label>
          <textarea
            name="description"
            id="description"
            rows="6"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the item condition, size, and any other details..."
            required
            minLength={10}
            className="input-field textarea-field"
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="Type" className="label">
            Category *
          </label>
          <select
            id="Type"
            name="Type"
            value={formData.Type}
            onChange={handleChange}
            required
            className="select-field"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Buttons */}
        <div className='button-group'>
          <button
            type="button"
            onClick={() => router.push('/myDonation')}
            className="action-button cancel-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`action-button submit-primary  ${
              submitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {submitting ? 'Updating...' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage;