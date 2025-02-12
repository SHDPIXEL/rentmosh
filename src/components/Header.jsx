import { useState, useContext } from "react";
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
import { Link } from "react-router-dom";
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

  const cityList = [
    { name: "Mumbai", img: city },
    { name: "Vadodara", img: city },
    { name: "Udaipur", img: city },
    { name: "Pune", img: city },
    { name: "Gandhinagar", img: city },
  ];

  const dropdownData = [
    { label: "Furniture", items: ["Bed", "Table", "Chair"] },
    { label: "Appliance", items: ["Washing Machine", "Fridge", "Microwave"] },
    { label: "Electronics", items: ["Mobile", "Laptop", "Headphones"] },
    { label: "Books", items: ["Fiction", "Non-Fiction", "Comics"] },
  ];

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
          <Link to="/whishlist" className="hover:bg-gray-100 p-2 rounded-md">
            <Heart className="w-5 h-5 text-gray-700" />
          </Link>
          <Link to="/cart" className="hover:bg-gray-100 p-2 rounded-md">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
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
              to="/whishlist"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md w-full"
              onClick={() => setMenuOpen(false)}
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
