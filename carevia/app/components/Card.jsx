"use client";

import Image from "next/image";
import { useAuth } from "@/app/_context/useAuth";
import { useState, useEffect, useContext } from "react";
import { FilterContext } from "../_context/FilterContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

function Card() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/homePage";
  const context = useContext(FilterContext);
  if (!context) {
  throw new Error("Card must be used inside a FilterProvider");
  }
  const { filters} = useContext(FilterContext);

  const [allPosts, setAllPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!authLoading) {
          let endpoint;

          if (isHome) {
            endpoint = "/api/postsaction/all";
          } else if (pathname === "/needs") {
            endpoint = `/api/requests/requestedItem?userId=${user.id}`;
          } else {
            endpoint = "/api/postsaction/user";
          }

          const res = await fetch(endpoint, { credentials: "include" });
          const data = await res.json();

          if (data.success) {
            setAllPosts(data.posts); // store fetched posts
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
  }, [authLoading, isHome, pathname, user]);

  // Apply filters
  useEffect(() => {
    let filtered = allPosts;

    if (filters.city) {
    filtered = filtered.filter(
    (post) =>
      post.city?.toLowerCase() === filters.city.toLowerCase() ||
      post.area?.toLowerCase().includes(filters.city.toLowerCase()) ||
      post.village?.toLowerCase().includes(filters.city.toLowerCase())
    );
  }

    if (filters.type) {
      // Fix case-sensitive key
      filtered = filtered.filter((post) => post.Type === filters.type);
    }

    setPosts(filtered);
  }, [filters, allPosts]);

  const handleNeeds = async (post) => {
    try {
      if (!user?.id) {
        alert("You must be logged in to request an item.");
        router.push("/loginPage");
        return;
      }

      if (!post?.id) {
        alert("Invalid item. Please try again.");
        return;
      }

      const res = await fetch("/api/requests/requestedItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, goodsId: post.id }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Something went wrong");
        return;
      }

      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
      alert("Item requested successfully! You have 24 hours to pick it up.");
      router.push("/homePage");
    } catch (error) {
      console.error(error);
      alert("Error sending request");
    }
  };

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

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-xl text-gray-600">Loading your posts...</p>
      </div>
    );
  }

  if (!isLoggedIn && !isHome) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">
            Please login to see your posts
          </p>
          <a
            href="/loginPage"
            className="terms-link text-indigo-600 hover:underline"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  if (posts.length === 0 && pathname === "/myDonation") {
    return (
      <div className="no-posts">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">
            You haven't created any posts yet
          </p>
          <Link href="/donatePage" className="make-first-donation">
            Create Your First Post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">
        {pathname === "/needs"
          ? `My Needs (${posts.length})`
          : !isHome
          ? `My Posts (${posts.length})`
          : null}
      </h2>

      {posts.map((post) => (
        <div
          key={post.id}
          className="product-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="card">
            <div className="image-container relative h-64 bg-gray-200">
              <Image
                src={post.image || "/defaultGoods.png"}
                alt={post.name}
                width={300}
                height={300}
                className="object-cover"
              />
              <div className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {post.Type}
              </div>
            </div>

            <div className="card-body p-6">
              <h2 className="card-title item-title text-xl font-bold mb-2 capitalize">
                {post.name}
              </h2>

              <p className="card-text text-base text-gray-600 mb-4 line-clamp-3">
                {post.description}
              </p>

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

              <p className="text-xs text-gray-400 mb-4">
                Posted: {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="card-footer btn flex gap-2">
              {isHome ? (
                <button
                  onClick={() => handleNeeds(post)}
                  className="btn-primary w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold"
                >
                  Need It
                </button>
              ) : pathname === "/needs" ? (
                <div className="text-sm text-gray-500 mb-2">
                  Requested at:{" "}
                  {new Date(post.requestedAt).toLocaleDateString()}
                </div>
              ) : (
                <div className="mydonation-controles">
                  <div className="btn-delete">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="btn-primary flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold"
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
