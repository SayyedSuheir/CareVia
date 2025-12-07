"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/_context/useAuth';
import { useRouter } from 'next/navigation';

const PostFormWithImage = () => {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  console.log(user);
  const router = useRouter();
  
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
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['food', 'clothes', 'electronics', 'furniture', 'other'];

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
      setError(''); // Clear any previous errors
    } else {
      setImageFile(null);
      setImagePreview(null);
      setError('Please select a valid image file');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate image is selected
      if (!imageFile) {
        setError('Please select an image');
        setLoading(false);
        return;
      }

      // Create FormData object
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('address', formData.address);
      dataToSend.append('description', formData.description);
      dataToSend.append('Type', formData.Type);
      dataToSend.append('image', imageFile);
      
      // Send to API
      const res = await fetch('/api/postsaction/createPost', {
        method: 'POST',
        credentials: 'include',
        body: dataToSend, // Don't set Content-Type header - browser will set it with boundary
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        alert('Post created successfully!');
        
        // Reset form
        setFormData({ name: '', address: '', description: '', Type: '' });
        setImageFile(null);
        setImagePreview(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        
        // Optionally redirect to posts page
        // router.push('/posts');
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

  // Check authentication
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
          <p className="mb-4">Please login to create a post</p>
          <button
            onClick={() => router.push('/loginPage')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-2xl rounded-xl p-8 space-y-7 border border-gray-300"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center border-b pb-4">
          Donate Item
        </h2>

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Post created successfully!
          </div>
        )}

        {/* Item Name */}
        <div>
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

        {/* Image Upload */}
        <div className='border-t pt-6'>
          <label htmlFor="image-upload" className="block text-sm font-semibold text-gray-700 mb-2">
            Upload Item Image * (Required)
          </label>
          <input
            type="file"
            name="image-upload"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
            <div className="w-full h-64 overflow-hidden rounded-lg shadow-md border-2 border-dashed border-gray-300">
              <Image
                src={imagePreview}
                alt="Item Preview"
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Address */}
        <div className="relative mt-1">
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1">
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
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />

            {/* Add Phone button */}
            {user?.phoneNumber && !formData.address.includes(user.phoneNumber) && (
                <button
                type="button"
                onClick={() =>
                    setFormData(prev => ({ ...prev, address: `${prev.address} - ${user.phoneNumber}` }))
                }
                className="absolute right-2 top-9 bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 transition"
                >
                Add Phone
                </button>
            )}
        </div>


        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
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
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-y"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="Type" className="block text-sm font-semibold text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="Type"
            name="Type"
            value={formData.Type}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg appearance-none bg-white border shadow-sm transition duration-150"
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

        {/* Submit Button */}
        <div className='pt-4'>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-white transition duration-150 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostFormWithImage;