import { Truck, Shield, Clock, Package } from "lucide-react";

const BenefitsCard = ({ benefit }) => {
  const IconComponent = benefit.icon;


  if (!IconComponent) {
    console.error("Icon component is undefined. Please check your icon mapping.");
    return null;
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <IconComponent className="w-7 h-7 text-red-800" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
        {benefit.title}
      </h3>
      <p className="text-gray-600 text-center text-sm">
        {benefit.description}
      </p>
    </div>
  );
};

export default BenefitsCard;