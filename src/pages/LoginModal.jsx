import { useState, useContext } from "react";
import LOGIN from "../assets/images/login.jpg";
import toast, { Toaster } from "react-hot-toast";
import { HiOutlineLockClosed, HiOutlineLockOpen } from "react-icons/hi";
import API from "../lib/api";
import { AuthContext } from "../context/authContext"; // assuming you have an AuthContext

const LoginModal = ({ isOpen, onClose }) => {
  const { login, signup } = useContext(AuthContext); // Access login and signup functions from context
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log("Logging in with", email, password);
    try {
      // Make an API call to login
      const response = await API.post("/auth/user/login", { email, password });
      console.log(response.data);
      login(response.data.token); // Save token and type in context
      onClose(); // Close modal after successful login
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    console.log("Signing up with", name, email, phone, password);

    try {
      // Make an API call to sign up
      const response = await API.post("/auth/user/register", {
        name,
        email,
        phone,
        password,
      });
      console.log(response.data);
      signup(response.data.token); // Save token and type in context
      onClose(); // Close modal after successful signup
    } catch (err) {
      console.error("Signup error:", err);

      // Debugging: Log full error response
      if (err.response) {
        console.log("Error Response:", err.response);
      }

      // Extract message safely
      let errorMessage = "SignUp failed"; // Default message
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data; // If backend sends a plain text error
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message; // If backend sends { message: "Error text" }
        }
      } else if (err.message) {
        errorMessage = err.message; // Network errors or Axios-specific issues
      }

      // Display error using React Hot Toast
      toast.error(errorMessage, {
        position: "top-right", // Ensures message appears at the top-right
        duration: 3000,
      });
    }
  };

  return (
    isOpen && (
      <div
        className="fixed inset-0 bg-[#00000099] flex justify-center items-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="flex flex-col md:flex-row w-full max-w-[90%] md:max-w-[70%] lg:max-w-[50%] bg-white rounded-lg shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side (Form) */}
          <div className="flex-1 p-6 bg-white flex flex-col justify-center items-center">
            <h2 className="text-lg font-bold text-gray-700 mb-4 self-start">
              {isSignup ? "Sign Up" : "Login"}
            </h2>

            <form
              onSubmit={isSignup ? handleSignupSubmit : handleLoginSubmit}
              className="w-full space-y-4"
            >
              {isSignup && (
                <>
                  <div className="relative w-full">
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border-b border-gray-300 bg-white focus:outline-none peer"
                      required
                    />
                    <label
                      htmlFor="name"
                      className={`w-full absolute left-0 top-4 text-gray-400 text-sm transition-all ${
                        name
                          ? "top-[-6px] text-xs text-gray-500 bg-white px-1"
                          : "top-4 text-base text-gray-400"
                      }`}
                    >
                      Enter Your Name*
                    </label>
                  </div>
                  <div className="relative w-full">
                    <input
                      type="text"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 border-b border-gray-300 bg-white focus:outline-none peer"
                      required
                    />
                    <label
                      htmlFor="phone"
                      className={`w-full absolute left-0 top-4 text-gray-400 text-sm transition-all ${
                        phone
                          ? "top-[-6px] text-xs text-gray-500 bg-white px-1"
                          : "top-4 text-base text-gray-400"
                      }`}
                    >
                      Enter Your Phone*
                    </label>
                  </div>
                </>
              )}

              <div className="relative w-full">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border-b border-gray-300 bg-white focus:outline-none peer"
                  required
                />
                <label
                  htmlFor="email"
                  className={`w-full absolute left-0 top-2 text-gray-400 text-sm transition-all ${
                    email
                      ? "top-[-6px] text-xs text-gray-500 bg-white px-1"
                      : "top-4 text-base text-gray-400"
                  }`}
                >
                  Enter Your Email*
                </label>
              </div>

              {/* Password */}
              <div className="relative w-full">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border-b border-gray-300 bg-white focus:outline-none peer"
                  required
                />
                <label
                  htmlFor="password"
                  className={`w-full absolute left-0 top-4 text-gray-400 text-sm transition-all ${
                    password
                      ? "top-[-6px] text-xs text-gray-500 bg-white px-1"
                      : "top-4 text-base text-gray-400"
                  }`}
                >
                  Enter Your Password*
                </label>
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-300 hover:text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <HiOutlineLockOpen size={20} />
                  ) : (
                    <HiOutlineLockClosed size={20} />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-red-800"
                  required
                />
                <p className="text-xs text-gray-600">
                  I agree to the{" "}
                  <a
                    href="/terms-and-conditions"
                    className="text-red-800 hover:underline"
                  >
                    terms and conditions{" "}
                  </a>
                  &amp;{" "}
                  <a
                    href="/privacy-policy"
                    className="text-red-800 hover:underline"
                  >
                    privacy policies
                  </a>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                {isSignup ? "Sign Up" : "Login"}
              </button>
            </form>

            {/* Toggle Sign-up/Login */}
            <div className="mt-4 text-center">
              {isSignup ? (
                <p>
                  Already have an account?{" "}
                  <span
                    className="text-red-800 cursor-pointer"
                    onClick={() => setIsSignup(false)}
                  >
                    Login here
                  </span>
                </p>
              ) : (
                <p>
                  Don't have an account?{" "}
                  <span
                    className="text-red-800 cursor-pointer"
                    onClick={() => setIsSignup(true)}
                  >
                    Sign up
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Right Side (Image) - Hidden on Small Screens */}
          <div
            className="hidden md:flex flex-1 bg-cover bg-center"
            style={{ backgroundImage: `url(${LOGIN})` }}
          >
            <img
              src={LOGIN}
              alt="LOGIN Icon"
              className="w-full h-auto object-cover rounded-r-lg"
            />
          </div>
        </div>
        <Toaster />
      </div>
    )
  );
};

export default LoginModal;
