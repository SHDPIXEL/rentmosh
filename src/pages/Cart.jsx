import React, { useState, useEffect } from "react";
import {
  Trash2,
  ShoppingCart,
  Heart,
  ArrowRight,
  CheckCircle,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import navigation
import toast, { Toaster } from "react-hot-toast";
import API from "../lib/api";
import sofa from "../assets/images/sofa.png"; // Add an empty cart image to your assets

// Cart Page Component
const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  // Track liked items in a state
  const [likedItems, setLikedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Use navigation hook

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const authToken = localStorage.getItem("authToken"); // Retrieve token from local storage
        if (!authToken) {
          toast.error("Unauthorized! Please log in.");
          navigate("/login"); // Redirect to login if no token is found
          return;
        }

        const response = await API.get("/user/cart", {
          headers: {
            Authorization: `Bearer ${authToken}`, // Send token in the header
          },
        });

        // Format the cart items safely
        const formattedCart = response.data?.cartItems.map((item) => ({
          id: item.productId, // Use productId from the cart
          title: item.product?.title || "No title", // Ensure safe access to product title
          image: item.product?.product_image || "",
          price: item.selectedPrice || 0, // Use selectedPrice from the cart
          selectedMonth: item.selectedMonth || 0, // Add selectedMonth from the cart
          quantity: item.quantity || 1, // Assuming quantity field
        }));
        setCartItems(formattedCart);
      } catch (error) {
        console.error("Error fetching cart:", error);

        if (error.response && error.response.status === 401) {
          toast.error("Session expired! Please log in again.");
          localStorage.removeItem("authToken"); // Clear token
          navigate("/login"); // Redirect to login
        } else {
          toast.error("Error fetching cart!");
        }

        setCartItems([]); // Prevent undefined state
      }
    };

    fetchCart();
  }, [navigate]); // Include navigate in dependencies to avoid stale closure

  const removeFromCart = async (productId) => {
    try {
      const authToken = localStorage.getItem("authToken"); // Retrieve token from local storage
      const response = await API.delete("/user/cart/remove", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: { productId }, // Send productId as part of the request body
      });
  
      console.log("Response status:", response.status); // Log response status
  
      if (response.status === 200) {
        setCartItems((items) => items.filter((item) => item.id !== productId));
        toast.success(`Product removed from cart`);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error removing item. Please try again.");
    }
  };
  

  const toggleLike = (id) => {
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle liked state for this item
    }));
  };

  // const calculateTotal = () => {
  //   return cartItems.reduce((total, item) => {
  //     // Price after discount
  //     const discountedPrice = (item.price * (100 - item.discount)) / 100;
  //     // Multiply discounted price by quantity (tenure)
  //     return total + discountedPrice * item.tenure;
  //   }, 0);
  // };
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Multiply selected price by the quantity (tenure or selectedMonth)
      return total + (item.price * item.selectedMonth);
    }, 0);
  };
  

  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/booked", { state: { transactionId: `TXN${Date.now()}` } });
    }, 2000); // Simulating processing delay
  };

  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
          <p className="text-gray-600">{cartItems.length} items</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side - Added Products */}
        <div className="space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center max-h-screen">
              {/* Centered Content */}
              <div className="flex flex-col items-center justify-center">
                <ShoppingCart className="w-48 h-48 mb-4" />
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Your Cart is Empty
                </h2>
                <p className="text-gray-600 mb-4">
                  Looks like you haven't added anything yet. Start shopping and
                  add items to your cart!
                </p>
                <button
                  onClick={() => (window.location.href = "/products")} // Redirect to products page
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Browse Products
                </button>
              </div>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4"
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
                      {item.price ? (
                        // If selectedMonth and selectedPrice exist, show price for the selected month
                        <div className="text-gray-900 text-sm">
                          ₹<span className="font-bold">{item.price}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          Price not available
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 md:text-sm text-xs">
                      {item.price ? (
                        <span className="text-gray-600">
                          Tenure: {item.selectedMonth}{" "}
                          {item.selectedMonth === 1 ? "month" : "months"}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Price not available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleLike(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-300"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          likedItems[item.id]
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side - Order Summary */}
        {cartItems.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                {/* Total Items Section */}
                <div className="md:text-base text-sm">
                  <div className="flex justify-between space-y-1">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-semibold">
                      {cartItems.length} items
                    </span>
                  </div>

                  {/* Price and Tenure for each product */}
                  <div className="space-y-1">
                    {cartItems.map((item) => {
                      const itemTotal = (item.price * item.selectedMonth).toFixed(2);
                      return (
                        <div key={item.id} className="flex justify-between">
                          <span className="text-gray-500">{item.title}</span>
                          <span className="font-semibold text-gray-500">
                            ₹{itemTotal} ({item.selectedMonth} month
                            {item.selectedMonth > 1 ? "s" : ""})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className=" border-t-2 border-dashed border-gray-300 my-4"></div>
                {/* Total Amount (Before Discount) */}

                <div className="md:text-base text-sm">
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-semibold text-gray-900">
                      ₹
                      {cartItems
                        .reduce(
                          (total, item) => total + item.price * item.selectedMonth,
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>

                  {/* Discount Section */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-red-500">
                      -₹
                      {cartItems
                        .reduce((total, item) => {
                          const discountAmount =
                            ((item.price * item.discount) / 100) * item.tenure;
                          return total + discountAmount;
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </div>

                  {/* Total Payable Section */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Payable</span>
                    <span className="font-semibold text-gray-900">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
                {/* GST Section */}
                <div className="flex justify-between mt-3">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-semibold text-green-600">
                    +₹{((calculateTotal() * 18) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className=" border-t-2 border-dashed border-gray-300 my-6"></div>

              {/* Total Price Calculation */}
              <div className="flex justify-between">
                <span className="md:text-lg text-md font-semibold text-gray-900">
                  Total
                </span>
                <span className="md:text-lg text-md font-semibold text-gray-900">
                  ₹
                  {(calculateTotal() + (calculateTotal() * 18) / 100).toFixed(
                    2
                  )}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-6 w-full bg-red-800 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin w-5 h-5" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Proceed to Checkout</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
