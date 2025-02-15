import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import toast, { Toaster } from "react-hot-toast";
import API from "../lib/api";
import sofa from "../assets/images/sofa.png";

// Category Page Component
const CategoryPage = () => {
  const { categoryName, id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/product/subcategory/${id}/products`);
        console.log("API Response:", response.data); // Debugging

        if (!response.data || !Array.isArray(response.data.products)) {
          throw new Error("Invalid response format");
        }

        const allProducts = response.data.products;
        console.log("All Products:", allProducts);
        // If no subcategory products exist, show all products
        setProducts(allProducts);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  return (
    <div className="mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          {categoryName}
        </h1>
        <p className="text-gray-600">Displaying products for {categoryName}</p>
      </div>

      {/* Product Grid */}
      {Array.isArray(products) && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard product={product} key={product.id || index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            No Products Available
          </h2>
          <p className="text-gray-600 mb-6">
            There are no products available in this category.
          </p>
          <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            <span>Browse Other Categories</span>
          </button>
        </div>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CategoryPage;
