import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/layout";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/productPage";
import WishlistPage from "./pages/WishList";
import CartPage from "./pages/Cart";
import ProfilePage from "./pages/ProfilePage";
import BookedPage from "./pages/BookedPage";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./helper/ProtectedRoute"; // Import ProtectedRoute
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsandCondition from "./pages/TermsandCondition";
import RentalAgreement from "./pages/rentalagreement";
import AboutUs from "./pages/aboutUs";
import ContactUs from "./pages/contactUs";
import { Navigate } from "react-router-dom";

import "./App.css";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route
                path="/category/:categoryName"
                element={<CategoryPage />}
              />
              <Route path="/product/:productId" element={<ProductPage />} />
              <Route path="/whishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<ProfilePage />} />}
              />
              <Route path="/booked" element={<BookedPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-condition" element={<TermsandCondition />} />
              <Route path="/rental-agreement" element={<RentalAgreement />} />
              <Route path="/aboutUs" element={<AboutUs />} />
              <Route path="/contactUs" element={<ContactUs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
