import React, { useState, useEffect } from "react";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Truck,
  Shield,
  Clock,
  Package,
  ArrowRight,
} from "lucide-react";
import BenefitsCard from "../components/BenefitsCard";
import toast, { Toaster } from "react-hot-toast";
import API from "../lib/api";
import sofa from "../assets/images/sofa.png";
import { useNavigate } from "react-router-dom";

// Wishlist Page Component
const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [benefitDetails, setBenefitDetails] = useState([]);
  const navigate = useNavigate(); // ✅ Initialize navigate inside the component

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const authToken = localStorage.getItem("authToken"); // Retrieve token from local storage
        if (!authToken) {
          toast.error("Unauthorized! Please log in.");
          navigate("/login"); // ✅ Redirect to login if no token is found
          return;
        }
  
        const response = await API.get('/user/wishlist', {
          headers: {
            Authorization: `Bearer ${authToken}`, // Send token in the header
          },
        });
  
        // Extract product details safely
        const formattedWishlist = response.data?.wishlistItems.map((item) => ({
          id: item.id,
          title: item.Product?.title || "No title", // Ensure safe access
          image: item.Product?.product_image || "",
          price: item.Product?.price ? JSON.parse(item.Product.price) : [],
          addedDate: item.createdAt || "00-00-0000",
        }));

        setWishlistItems(formattedWishlist);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        
        if (error.response && error.response.status === 401) {
          toast.error("Session expired! Please log in again.");
          localStorage.removeItem("authToken"); // ✅ Clear token
          navigate("/login"); // ✅ Redirect to login
        } else {
          toast.error("Error fetching wishlist!");
        }

        setWishlistItems([]); // Prevent undefined state
      }
    };
  
    fetchWishlist();
  }, [navigate]); // ✅ Include navigate in dependencies to avoid stale closure


  useEffect(() => {
    const fetchBenefitDetails = async () => {
      try {
        const response = await API.get("/benefits/benefit");
        const benefits = response.data;

        const formattedBenefits = benefits.map((benefit, index) => ({
          icon: [Truck, Clock, Shield, Package][index % 4], // Sequential icons (Clock, Truck, Shield, Package)
          title: benefit.title,
          description: benefit.description,
        }));

        setBenefitDetails(formattedBenefits);
      } catch (error) {
        console.error("Error fetching benefit details:", error);
        toast.error("Error fetching benefit details:", error);
      }
    };

    fetchBenefitDetails();
  }, []);


  const removeFromWishlist = async (productId) => {
    try {
      const response = await API.delete("/user/wishlist",{productId});
  
      // ✅ Check if the response is successful
      if (response.status === 200) {
        setWishlistItems((items) => items.filter((item) => item.id !== productId));
        toast.success(`Product removed from wishlist`);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error removing item. Please try again.");
    }
  };


  return (
    <div className="mx-auto px-4 py-8">
      {/* Header */}
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600">{wishlistItems?.length || 0} items</p>
        </div>
        {wishlistItems.length > 0 && (
          <button className="text-red-800 hover:text-red-700 text-sm font-medium">
            Move All to Cart
          </button>
        )}
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length > 0 ? (
        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm w-full hover:shadow-md transition-shadow duration-300 p-4"
            >
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="md:w-32 md:h-32 w-28 h-28 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-grow">
                  <h3 className="md:text-lg text-base font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center space-x-2 mb-2">
                    {item.price.length > 0 ? (
                      item.price.map((p, index) => (
                        <div key={index} className="text-gray-900 text-sm">
                          {p.months}:{" "}
                          <span className="font-bold">₹{p.amount}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500">Price not available</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 md:text-sm text-xs">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Added on {new Date(item.addedDate).toLocaleDateString()}
                    </span>
                  </div>

                  {!item.available && (
                    <div className="text-red-500 text-sm mt-2">
                      Currently out of stock
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {item.available && (
                    <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-300">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Why So Empty ?
          </h2>
          <p className="text-gray-600 mb-6">
            Save items you love and come back to them later
          </p>
          <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Why Save to Wishlist?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefitDetails.map((benefit, index) => (
            <BenefitsCard key={index} benefit={benefit} icon={benefit.icon} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
