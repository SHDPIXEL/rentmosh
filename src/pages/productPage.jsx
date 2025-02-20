import { useParams } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Tag,
  Gift,
  Copy,
  Percent,
  BadgeCheck,
} from "lucide-react";
import sofa from "../assets/images/sofa.png";
import toast, { Toaster } from "react-hot-toast";
import ProductCard from "../components/ProductCard"; // Import ProductCard component
import API from "../lib/api";
import "@fortawesome/fontawesome-free/css/all.min.css";

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [benefit, setBenefit] = useState([]);
  const [mainImage, setMainImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false); // Track cart status
  const scrollRef = useRef(null);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); // State to store related products
  const [offerDetails, setofferDetails] = useState([]);
  const [rating, setRating] = useState(0);
  const [priceOptions, setPriceOptions] = useState({}); // State to store dynamic price options
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0); // Default price for 3 months

  useEffect(() => {
    const fetchProductById = async () => {
      try {
        const response = await API.get(`/product/products/${productId}`); // API call to fetch product
        console.log(response.data.product);
        let productData = response.data.product;
        console.log(productData);

        // If inStock is false (or 0), add an "Out of Stock" message
        if (!productData.inStock) {
          productData.outOfStockMessage = "Product is now Out of Stock";
        }

        setProduct(productData);

        // Extracting benefit title
        if (productData.benefit) {
          console.log("Benefit Title:", productData.benefit.title);
          console.log("Benefit Description:", productData.benefit.description);
          console.log("Benefits:", productData.benefit);
          const benefits = productData.benefit;
          console.log(benefits);
          setBenefit(benefits); // Store it in state if needed
        }
        // Parse price options from the product's price field
        const parsedPriceOptions = JSON.parse(productData.price);
        console.log("PriceOptions", parsedPriceOptions);

        // Convert months string (like "6 months") to a number
        const priceObj = parsedPriceOptions.reduce((acc, item) => {
          const months = parseInt(item.months, 10); // Extract number of months
          acc[months] = item.amount;
          return acc;
        }, {});

        setPriceOptions(priceObj); // Set price options dynamically based on the product data

        const relatedResponse = await API.get(
          `/product/products/${productId}/exploremore`
        );
        console.log(relatedResponse.data);
        console.log(relatedResponse.data.data);
        setRelatedProducts(relatedResponse.data.data);
      } catch (err) {
        setError("Error fetching product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductById();
  }, [productId]);

  useEffect(() => {
    if (product?.rating) {
      setRating(Math.floor(product.rating));
    }
  }, [product]);

  //const product = products.find((p) => p.id === parseInt(productId));

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const response = await API.get("/offer/offers");
        console.log(response.data.offers); // Log the structure of response.data

        const offers = response.data.offers;

        if (Array.isArray(offers)) {
          const formattedOffers = offers.map((offer, index) => ({
            icon: [Tag, Gift][index % 4], // Sequential icons
            title: offer.title,
            description: offer.description,
            code: offer.code,
          }));

          setofferDetails(formattedOffers);
        } else {
          console.error("API response is not an array:", offers);
        }
      } catch (error) {
        console.error("Error fetching offer details:", error);
      }
    };

    fetchOfferDetails();
  }, []);

  // Set the default selectedMonth and selectedPrice when the component mounts
  useEffect(() => {
    const defaultMonth = Object.keys(priceOptions)[0]; // Set the first month as default
    setSelectedMonth(defaultMonth);
    setSelectedPrice(priceOptions[defaultMonth]);
  }, [priceOptions]);

  // if (!product) {
  //   return (
  //     <div className="text-center text-red-500 text-lg">Product Not Found</div>
  //   );
  // }

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const parsedPrice =
    product && Array.isArray(product.price)
      ? product.price
      : product
      ? JSON.parse(product.price || "[]")
      : [];

  {
    parsedPrice.length > 0 ? (
      parsedPrice.map((priceOption) => (
        <option key={priceOption.months} value={priceOption.months}>
          {priceOption.months} Months
        </option>
      ))
    ) : (
      <option disabled>No available price options</option>
    );
  }

  const firstPrice = parsedPrice.length > 0 ? parsedPrice[0] : null;

  const handleAddToWishlist = async () => {
    try {
      await API.post("/user/wishlist", { productId: product.id });
      setIsWishlisted(true);
      toast.success("Product added to Wishlist");
    } catch (error) {
      console.error("Full error object:", error);

      // Check if error is an object and has an 'error' key
      if (error.error) {
        toast.error(error.error);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleAddToCart = async () => {
    try {
      // Get the token from localStorage (or sessionStorage)
      const authToken = localStorage.getItem("authToken");

      // Check if the token exists
      if (!authToken) {
        toast.error("You must be logged in to add products to the cart.");
        return; // Exit the function if there's no token
      }
      // Send selectedPrice, selectedMonth, and productId to the backend to store in Cart
      await API.post("/user/cart", {
        productId: product.id,
        selectedPrice: selectedPrice, // Send the selected price
        selectedMonth: selectedMonth, // Send the selected month
      });
      setIsInCart(true); // Mark as added to the cart
      toast.success("Product added to Cart"); // Show a success message
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Check if the error response includes a specific message
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Show the specific error message from the API
      } else {
        toast.error("Failed to add product to Cart"); // Show a generic failure message
      }
    }
  };

  const handlePrevSlide = () => {
    setCurrentOfferIndex((prevIndex) => {
      const nextIndex =
        prevIndex === 0 ? offerDetails.length - 1 : prevIndex - 1;
      return nextIndex;
    });
  };

  const handleNextSlide = useCallback(() => {
    setCurrentOfferIndex((prevIndex) =>
      prevIndex === offerDetails.length - 1 ? 0 : prevIndex + 1
    );
  }, [offerDetails.length]);

  useEffect(() => {
    const interval = setInterval(handleNextSlide, 3000);
    return () => clearInterval(interval);
  }, [handleNextSlide]);

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedPrice(priceOptions[month]); // Update selectedPrice when month changes
  };

  const copyToClipboard = async (code) => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not available");
      }
      await navigator.clipboard.writeText(code);
      toast.success(`Code "${code}" copied to clipboard!`, {
        position: "top-right", // Toast will appear at the top-right
        duration: 3000,
      });
    } catch (err) {
      // Fallback if Clipboard API is not supported
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast.success(`Code "${code}" copied!`, { position: "top-right" });
      } catch {
        toast.error("Failed to copy code.", { position: "top-right" });
      }
      document.body.removeChild(textarea);
    }
  };

  const handleRatingClick = (index) => {
    setRating(index + 1); // Set the rating based on clicked star
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {/* Ensure toaster is globally placed at the top right */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mx-auto px-4 md:py-8 py-0 md:mt-5 mt-0">
        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative flex justify-center items-center h-100 top-8 rounded-xl overflow-hidden">
              <img
                src={product.product_image[0]}
                alt={product.title}
                className="w-full h-full object-contain"
              />
              {/* Previous Button */}
              <button
                onClick={() =>
                  setMainImage((prev) =>
                    prev === 0 ? product.product_image.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              {/* Next Button */}
              <button
                onClick={() =>
                  setMainImage((prev) =>
                    prev === product.product_image.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex justify-center space-x-4 md:mt-20 mt-10">
              {Array.isArray(product.product_image) &&
              product.product_image.length > 0 ? (
                product.product_image.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index}`}
                    className={`md:w-20 md:h-20 w-16 h-16 rounded-lg cursor-pointer border-2 transition-all duration-300 ${
                      mainImage === index
                        ? "border-blue-500 scale-105"
                        : "border-gray-300"
                    }`}
                    onClick={() => setMainImage(index)}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No images available
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="md:text-3xl text-2xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>
                <div className="flex items-center">
                  {/* Map through 5 stars */}
                  {[...Array(5)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleRatingClick(index)} // Update rating when clicked
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`md:w-5 md:h-5 w-4 h-4 ${
                          index < rating
                            ? "fill-yellow-400 text-yellow-400" // Filled star if the index is less than the rating
                            : "text-gray-300" // Empty star if the index is greater than or equal to the rating
                        }`}
                      />
                    </button>
                  ))}
                  {/* Display current rating and reviews */}
                  <span className="ml-2 md:text-base text-sm text-gray-600">
                    {rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToWishlist(); // Call the wishlist function
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Heart
                  className={`md:w-6 md:h-6 h-5 w-5 ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            <p className="text-gray-600 md:text-base text-sm">
              {product.description}
            </p>
            <div className="flex items-baseline space-x-4">
              {firstPrice ? (
                <>
                  <span className="md:text-xl font-semibold text-lg text-black ">
                    ₹{firstPrice.amount}
                  </span>
                  <div>
                    <span className="mr-2 text-md text-gray-600">
                      ({firstPrice.months})
                    </span>
                  </div>
                  {/* <span className="text-red-500 md:text-lg text-md font-semibold">
                    {product.discount}% OFF
                  </span> */}
                </>
              ) : (
                <p className="text-gray-500">Price not available</p>
              )}
            </div>

            {product.offers && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block md:text-base text-sm">
                {product.offers}
              </div>
            )}

            <div>
              {loading && <p>Loading...</p>}
              {error && <p>{error}</p>}

              <div className="border-t pt-6 mb-0">
                <h3 className="text-lg font-semibold mb-4">
                  Select Tenure & Price
                </h3>
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Month Selection */}
                  <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="bg-gray-100 text-black font-medium md:text-md text-sm py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-300"
                  >
                    {Object.keys(priceOptions).map((month) => (
                      <option key={month} value={month}>
                        {month} Months
                      </option>
                    ))}
                  </select>

                  {/* Price Selection */}
                  <select
                    value={selectedPrice}
                    className="bg-gray-100 text-black font-medium text-md py-2 px-4 rounded-lg cursor-pointer appearance-none"
                    disabled
                  >
                    <option>₹{selectedPrice}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Offer Slider Section */}
            <div className="mt-6 relative mb-0">
              <h3 className="text-lg font-semibold mb-2">Special Offers</h3>
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 via-blue-950 to-violet-900 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  {offerDetails &&
                  offerDetails.length > 0 &&
                  offerDetails[currentOfferIndex] ? (
                    <>
                      {offerDetails[currentOfferIndex].icon === "Tag" ? (
                        <Tag size={24} className="text-blue-500" />
                      ) : offerDetails[currentOfferIndex].icon === "Gift" ? (
                        <Gift size={24} className="text-green-500" />
                      ) : null}
                      <div>
                        <div
                          className="flex items-center gap-2 text-black text-sm font-semibold rounded-md cursor-pointer"
                          onClick={() =>
                            copyToClipboard(
                              offerDetails[currentOfferIndex].code
                            )
                          }
                        >
                          <div className="flex justify-center items-center">
                            <h4 className="font-bold mb-1 text-yellow-400">
                              {offerDetails[currentOfferIndex].title}
                            </h4>
                          </div>
                          <div className="flex bg-yellow-400 font-semibold rounded-md p-2 justify-center items-center">
                            Code: {offerDetails[currentOfferIndex].code}
                            <Copy
                              className="w-4 h-4 text-black cursor-pointer ml-1"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevents triggering parent click
                                copyToClipboard(
                                  offerDetails[currentOfferIndex].code
                                );
                              }}
                            />
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-yellow-400">
                          {offerDetails[currentOfferIndex].description}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p>No offers available</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrevSlide}
                    className="md:p-2 p-1 rounded-full bg-yellow-400 hover:bg-yellow-500"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="md:p-2 p-1 rounded-full bg-yellow-400 hover:bg-yellow-500"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                disabled={!product?.inStock}
                style={{ opacity: product?.inStock ? 1 : 0.5 }}
                className="flex-1 bg-[#960b22] text-white py-3 px-6 rounded-lg hover:bg-red-700 transition duration-300"
              >
                Buy Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(); // Call the function to add product to the cart
                }}
                className={`flex-1 border-2 py-3 px-6 rounded-lg ${
                  isInCart
                    ? "bg-[#960b22] text-white"
                    : "border-[#960b22] text-[#960b22] hover:bg-red-50"
                }`}
              >
                {isInCart ? "Added to Cart" : "Add to Cart"}{" "}
                {/* Toggle the text */}
              </button>
            </div>
            {product?.outOfStockMessage && (
              <p style={{ color: "#960b22", fontWeight: "bold" }}>
                {product.outOfStockMessage}
              </p>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12">
          <h3 className="md:text-2xl text-xl font-bold text-gray-800 mb-4">
            Product Benefits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 md:gap-6 gap-3">
            {product?.benefit ? (
              <div className="p-4">
                <div className="bg-gray-100 border border-gray-100 overflow-hidden bg-opacity-100 p-6 rounded-xl transform transition duration-300 hover:scale-101 hover:shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <i className="fas fa-check text-xl text-red-800"></i>
                    </div>
                    <h4 className="ml-4 text-lg font-semibold text-black">
                      {product.benefit.title}
                    </h4>
                  </div>
                  <p className="text-black text-sm">
                    {product.benefit.description}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-black text-sm">No benefits available</p>
            )}
          </div>
        </div>

        {/* Product Specifications Section */}
        <div className="mt-12">
          <h3 className="md:text-2xl text-xl font-bold text-gray-800 mb-6">
            Product Specifications
          </h3>
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl md:p-6 p-2">
            <table className="w-full table-auto rounded-xl border-collapse">
              <tbody>
                {/* Map over the product details and display the properties */}
                <tr className="hover:bg-gray-100 transition duration-200 rounded-lg overflow-hidden">
                  <td className="py-3 font-semibold text-gray-700 rounded-md md:text-lg text-sm p-2 pr-4">
                    Brand
                  </td>
                  <td className="py-3 text-gray-600 rounded-md md:text-lg text-sm">
                    <span className="inline-block w-4 text-center">:</span>
                    <span className="ml-2">{product.brand}</span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-100 transition duration-200 rounded-lg overflow-hidden">
                  <td className="py-3 font-semibold text-gray-700 rounded-md md:text-lg text-sm p-2 pr-4">
                    Colour
                  </td>
                  <td className="py-3 text-gray-600 rounded-md md:text-lg text-sm">
                    <span className="inline-block w-4 text-center">:</span>
                    <span className="ml-2">{product.colour}</span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-100 transition duration-200 rounded-lg overflow-hidden">
                  <td className="py-3 font-semibold text-gray-700 rounded-md md:text-lg text-sm p-2 pr-4">
                    Material
                  </td>
                  <td className="py-3 text-gray-600 rounded-md md:text-lg text-sm">
                    <span className="inline-block w-4 text-center">:</span>
                    <span className="ml-2">{product.material}</span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-100 transition duration-200 rounded-lg overflow-hidden">
                  <td className="py-3 font-semibold text-gray-700 rounded-md md:text-lg text-sm p-2 pr-4">
                    Size
                  </td>
                  <td className="py-3 text-gray-600 rounded-md md:text-lg text-sm">
                    <span className="inline-block w-4 text-center">:</span>
                    <span className="ml-2">{product.size}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Related Products
          </h3>
          {relatedProducts.length === 0 ? (
            <p>No Related Products</p>
          ) : (
            <div className="flex gap-6 overflow-x-auto">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductPage;
