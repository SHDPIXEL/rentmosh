import { useState, useEffect } from "react";
import CategoryCard from "../components/CategoryCard";
import {
  Truck,
  Shield,
  Clock,
  Package,
  Tag,
  Gift,
  Percent,
  BadgeCheck,
} from "lucide-react";
import sofa from "../assets/images/sofa.png";
import Banner from "../components/Banner";
import BenefitsCard from "../components/BenefitsCard";
import OffersCard from "../components/OffersCard";
import MarqueeComponent from "../components/ui/Marquee";
import Testimonial from "../components/Testimonial";
import StepstoBook from "../components/StepstoBook";
import FAQ from "../components/FAQ";
import API from "../lib/api";
import toast, { Toaster } from "react-hot-toast";

const Home = () => {
  const [subcategoryDetail, setSubcategoryDetail] = useState([]);
  const [benefitDetails, setBenefitDetails] = useState([]);
  const [offerDetails, setofferDetails] = useState([]);

  const bgColors = [
    "bg-red-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-indigo-400",
  ];

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await API.get("/subcategory/subcategories"); // Fetch subcategories

        // Filter subcategories where the status is "Active"
        const subcategories = (response.data.subcategories || []).filter(
          (sub) => sub.status === "Active"
        );

        // Format the data as required
        const formattedSubcategories = subcategories.map((sub, index) => ({
          id:sub.id,
          title: sub.name, // Subcategory name
          image: sub.image, // Subcategory image URL
          bgColor: bgColors[index % bgColors.length], // Select from predefined colors
        }));

        setSubcategoryDetail(formattedSubcategories);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        toast.error("Failed to fetch subcategories.", {
          position: "top-right",
        });
      }
    };

    fetchSubcategories();
  }, []);

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
      }
    };

    fetchBenefitDetails();
  }, []);

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const response = await API.get("/offer/offers");
        // console.log(response.data.offers); // Log the structure of response.data

        const offers = response.data.offers;

        if (Array.isArray(offers)) {
          const formattedOffers = offers.map((offer, index) => ({
            icon: [Tag, Gift, Percent, BadgeCheck][index % 4], // Sequential icons
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

  return (
    <div className="px-4 w-full">
      <div className="mb-10 mt-5 flex flex-col gap-5">
        <MarqueeComponent />
        <Banner />
      </div>

      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="inline-flex space-x-8">
          {subcategoryDetail.map((category, index) => (
            <CategoryCard
              key={index}
              id={category.id} // Passing the id dynamically
              title={category.title}
              image={category.image}
              bgColor={category.bgColor}
            />
          ))}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Why Choose Us ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefitDetails.map((benefit, index) => (
            <BenefitsCard key={index} benefit={benefit} icon={benefit.icon} />
          ))}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerDetails.map((offer, index) => (
            <OffersCard
              key={index}
              offer={offer}
              bgColor={offer.bgColor}
              icon={offer.icon}
            />
          ))}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Testimonials
        </h2>
        <div className="w-full mx-auto">
          {/* Testimonial Component */}
          <Testimonial />
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl md:text-left font-semibold text-gray-800 mb-6">
          Your Next Rental Is Just 4 Steps Away!
        </h2>
        <div className="w-full max-w-7xl mx-auto">
          <StepstoBook />
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="w-full max-w-7xl mx-auto">
          <FAQ />
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};
export default Home;
