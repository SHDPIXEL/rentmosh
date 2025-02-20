import { useState, useContext, useEffect } from "react";
import RentmoshLogo from "../assets/images/Rentmosh-logo.png";
import {
  Heart,
  ShoppingCart,
  Menu,
  X,
  MapPin,
  ChevronUp,
  ChevronDown,
  LogOut,
} from "lucide-react";
import SearchBar from "./ui/SearchBar";
import Modal from "./ui/CityModal";
import Dropdown from "./ui/DropDown";
import city from "../assets/images/city.jpg";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import API from "../lib/api";
import LoginModal from "../pages/LoginModal";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AuthContext } from "../context/authContext";

const Header = () => {
  const { isAuthenticated, isTokenExpired, logout } = useContext(AuthContext);
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cityList, setCityList] = useState([]); // Fetch cities dynamically
  const [dropdownData, setDropdownData] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await API.get("/city/cities");
        setCityList(response.data.cities); // Assuming response is an array of city objects
      } catch (error) {
        console.error("Error fetching cities:", error);
        toast.error("Failed to fetch cities.", { position: "top-right" });
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get("/category/categories");

        const categories = response.data.filter(
          (category) => category.status === "Active"
        );

        const formattedData = await Promise.all(
          categories.map(async (category) => {
            // Fetch subcategories for each category
            const subcategoryResponse = await API.get(
              `/subcategory/category/${category.id}`
            );

            // Log subcategories to check if the response is correct
            console.log(
              `Subcategories for category ${category.name}:`,
              subcategoryResponse.data.subcategories
            );

            // Ensure subcategories is an array before proceeding
            const subcategories = (
              Array.isArray(subcategoryResponse.data.subcategories)
                ? subcategoryResponse.data.subcategories
                : []
            ).filter((sub) => sub.status === "active");

            // Log the filtered subcategories to verify the status filter
            console.log("Filtered subcategories:", subcategories);

            return {
              label: category.name, // Category name as label
              items: subcategories.map((sub) => sub.name), // Subcategory names as items
            };
          })
        );

        // Log formatted data to check if it looks correct
        console.log("Formatted dropdown data:", formattedData);

        setDropdownData(formattedData);
      } catch (error) {
        console.error("Error fetching categories and subcategories:", error);
        toast.error("Failed to fetch categories.", { position: "top-right" });
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (authToken) {
          const response = await API.get("/user/wishlist", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          setWishlistCount(response.data?.wishlistItems.length || 0);
        }
      } catch (error) {
        console.error("Error fetching wishlist count:", error);
      }
    };

    fetchWishlistCount();
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (authToken) {
          const response = await API.get("/user/cart", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          setCartCount(response.data?.cartItems.length || 0);
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city.name);
    setIsModalOpen(false);
  };

  const handleProfileClick = () => {
    if (!isAuthenticated || isTokenExpired()) {
      setIsLoginModalOpen(true); // Open login modal if not authenticated
    } else {
      setDropdownOpen(!dropdownOpen); // Toggle dropdown visibility
    }
  };

  const handleLinkClick = () => {
    setMenuOpen(false); // Close the menu when Dashboard link is clicked
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Main Header */}

      <div className="flex items-center justify-between px-4 md:px-6 lg:px-34 h-16 max-w-[1600px] mx-auto w-full">
        {/* Left Section - Logo, Search, MapPin */}
        <div className="flex items-center space-x-4">
          <Link to="/">
            <img src={RentmoshLogo} alt="RentMosh Logo" className="w-52" />
          </Link>
          <div className="hidden md:flex items-center justify-center gap-3">
            <SearchBar className="text-gray-700 hover:bg-gray-100 rounded-md" />
            <MapPin
              onClick={() => setIsModalOpen(true)}
              className="w-5 h-5 text-gray-700 hover:bg-gray-100 rounded-md"
            />
          </div>
        </div>

        {/* Hamburger Menu - Only visible on mobile/tablet */}
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            {menuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Center Section - Categories Dropdown (Visible on larger screens) */}
        <div className="hidden lg:flex">
          <div className="flex space-x-6">
            {dropdownData.map((category, index) => (
              <Dropdown
                key={index}
                options={category.items}
                label={category.label}
              />
            ))}
          </div>
        </div>

        {/* Right Section - Wishlist, Cart, Login */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link
            to="/wishlist"
            className="hover:bg-gray-100 p-2 rounded-md relative"
          >
            <Heart className="w-5 h-5 text-gray-700" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="hover:bg-gray-100 p-2 rounded-md relative"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <div
            className="flex relative items-center gap-1 hover:bg-gray-100 rounded-md p-2 cursor-pointer"
            onClick={handleProfileClick}
          >
            <i className="fas fa-user-circle text-gray-700 w-5"></i>
            <span>
              {!isAuthenticated || isTokenExpired() ? "Login" : "Profile"}
            </span>
            {/* Show dropdown icons only when authenticated */}
            {isAuthenticated &&
              !isTokenExpired() &&
              (dropdownOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-700" />
              ))}

            {/* Dropdown Menu for Desktop */}
            {isAuthenticated && !isTokenExpired() && dropdownOpen && (
              <div className="absolute right-0 top-full mt-4 bg-white shadow-md rounded-md w-30 z-50">
                <div className="p-2 text-sm text-gray-600">
                  <Link
                    to="/dashboard"
                    className="block py-2 px-2 hover:bg-gray-100 rounded-md"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left py-2 px-2 hover:bg-gray-100 rounded-md text-gray-700 flex items-center gap-2"
                  >
                    <span>Logout</span>
                    <LogOut className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - Slides in from top when menuOpen is true */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-white h-full overflow-y-auto pb-20">
          {/* Close button for mobile menu */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          <div className="px-4 space-y-4">
            {/* City Selector */}
            <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md text-gray-700 cursor-pointer">
              <div
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center"
              >
                <FaMapMarkerAlt className="text-gray-700 mr-1" size={17} />
                <span>{selectedCity}</span>
              </div>
              <SearchBar />
            </div>

            {/* Categories */}
            {/* <div className="space-y-4 flex flex-col">
              {dropdownData.map((category, index) => (
                <Dropdown key={index} options={category.items} label={category.label} />
              ))}
            </div> */}

            {dropdownData.map((category, index) => (
              <div key={index}>
                <button
                  className="w-full text-left py-2 hover:bg-gray-100"
                  onClick={() =>
                    setOpenSubmenu(openSubmenu === index ? null : index)
                  }
                >
                  <div className="flex items-center">
                    {category.label}
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {openSubmenu === index && (
                  <div className="ml-4 text-gray-600">
                    {category.items.map((item, i) => (
                      <div
                        key={i}
                        className="py-2 px-3 rounded-md active:bg-gray-100"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Actions */}
            <Link
              to="/wishlist"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md w-full"
            >
              <Heart className="w-5 h-5 text-gray-700" />
              <span>Wishlist</span>
            </Link>

            <Link
              to="/cart"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md w-full"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <span>Cart</span>
            </Link>

            <div
              className="flex relative items-center gap-1 hover:bg-gray-100 rounded-md p-2 cursor-pointer"
              onClick={handleProfileClick}
            >
              <i className="fas fa-user-circle text-gray-700 w-5"></i>
              <span>
                {!isAuthenticated || isTokenExpired() ? "Login" : "Profile"}
              </span>
              {/* Show dropdown icons only when authenticated */}
              {isAuthenticated &&
                !isTokenExpired() &&
                (dropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-700" />
                ))}

              {/* Dropdown Menu for Mobile */}
              {isAuthenticated && !isTokenExpired() && dropdownOpen && (
                <div className="absolute left-0 top-full w-48">
                  <div className="text-sm text-gray-600">
                    <Link
                      to="/dashboard"
                      onClick={handleLinkClick} // Close the dropdown when clicked
                      className="block py-2 px-10 hover:bg-gray-100 rounded-md"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left py-2 px-10 hover:bg-gray-100 rounded-md text-gray-700 flex items-center gap-2"
                    >
                      <span>Logout</span>
                      <LogOut className="w-3 h-3 text-gray-700" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Toaster position="top-right" reverseOrder={false} />
        </div>

        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 -z-10"
          onClick={() => setMenuOpen(false)}
        />
      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cityList={cityList}
        onCitySelect={handleCitySelect}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

export default Header;
