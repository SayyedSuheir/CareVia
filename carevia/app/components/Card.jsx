"use client";

import Image from "next/image";
import { useAuth } from "@/app/_context/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

function Card() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  const pathname = usePathname();
const isHome = pathname === "/homePage";

  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user's posts when logged in
 useEffect(() => {
  const fetchPosts = async () => {
    try {
      if (!authLoading) {

        // ✅ Choose endpoint ONLY based on URL
        const endpoint = isHome
          ? "/api/postsaction/all"      // Home = all posts
          : "/api/postsaction/user";   // Other pages = user's posts

        const res = await fetch(endpoint, {
          credentials: "include",
        });

        const data = await res.json();

        if (data.success) {
          setPosts(data.posts);
        } else {
          setError(data.error);
        }

      }
    } catch (err) {
      console.error("Fetch posts error:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();
}, [authLoading, isHome]);


  // Handle post deletion
  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/postsaction/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setPosts(posts.filter((post) => post.id !== postId));
        alert("Post deleted successfully");
      } else {
        alert(data.error || "Failed to delete post");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete post");
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-xl text-gray-600">Loading your posts...</p>
      </div>
    );
  }

  // Not logged in state
 if (!isLoggedIn && !isHome) {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-4">Please login to see your posts</p>
        <a href="/loginPage" className="terms-link text-indigo-600 hover:underline">
          Go to Login
        </a>
      </div>
    </div>
  );
}


  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  // No posts state
  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">You haven't created any posts yet</p>
          <a
            href="/create-post"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Create Your First Post
          </a>
        </div>
      </div>
    );
  }

  // Display user's posts
  return (
    <div className="container mx-auto px-4 py-8">
      {!isHome && (
            <h2 className="text-3xl font-bold mb-6 text-center">
                My Posts ({posts.length})
            </h2>
        )}

     

      
      
        {posts.map((post) => (
          
            <div
              key={post.id}
              className="product-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
            <div className="card ">
              {/* Image Container */}
              <div className="image-container relative h-64 bg-gray-200">
                <Image
                  src={post.image || "/defaultGoods.png"}
                  alt={post.name}
                  width={300}
                  height={300}
                 
                  className="object-cover"
                />
                {/* Category Badge */}
                <div className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {post.Type}
                </div>
              </div>

              {/* Content */}
              <div className="card-body p-6">
                {/* Title */}
                <h2 className="card-title item-title text-xl font-bold mb-2 capitalize">
                  {post.name}
                </h2>

                {/* Description */}
                <p className="card-text text-base text-gray-600 mb-4 line-clamp-3">
                  {post.description}
                </p>

                {/* Address */}
                <div className="citem-address flex items-center text-sm text-gray-500 mb-4">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    width={20}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="truncate">{post.address}</span>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-400 mb-4">
                  Posted: {new Date(post.createdAt).toLocaleDateString()}
                </p>
                </div>
                {/* Action Buttons */}
              
                  <div className="card-footer btn  flex gap-2">

                          {isHome ? (
                              // ✅ Button visible ONLY on homepage
                              <button
                              onClick={() => router.push(`/post/${post.id}`)}
                              className="btn-primary w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold"
                              >
                              Need It
                              </button>
                          ) : (
                              // ✅ Buttons visible ONLY outside homepage
                              <div className="mydonation-controles">
                                <div className="btn-delete">
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="  btn-primary flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold"
                                >
                                    Delete
                                </button>
                              </div>
                            <div className="btn-edit">
                              <button
                                  onClick={() => router.push(`/editmypage/${post.id}`)}
                                  className="btn-primary flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold"
                              >
                                  Edit
                              </button>
                              </div>
                              </div>

                          )}

                  </div>

                
              </div>
            </div>
           
        ))}
      </div>
   
  );
}

export default Card;