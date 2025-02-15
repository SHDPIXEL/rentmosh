import { Tag, Gift, Percent, BadgeCheck, Copy } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const OffersCard = ({ offer,icon: IconComponent }) => {

  if (!IconComponent) {
    console.error("Icon component is undefined. Please check your icon mapping.");
    return null;
  }

  const copyToClipboard = async (code) => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not available");
      }
      await navigator.clipboard.writeText(code);
      toast.success(`Code "${code}" copied to clipboard!`, {
        position: "top-right", // Ensures message appears at the top-right
        duration: 3000,
      });
    } catch (err) {
      // Fallback: Manually create a textarea and copy text
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

  return (
    <>
      {/* Ensure toaster is globally placed at the top right */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="relative bg-cover bg-center rounded-xl bg-gradient-to-r from-blue-900 via-blue-950 to-violet-900 hover:scale-101">
        <div className="relative flex flex-col items-center p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
          {/* White Circle */}
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4">
            <IconComponent className="w-7 h-7 text-yellow-500" />
          </div>

          {/* Title */}
          <h4 className="text-md font-semibold text-yellow-500">{offer.title}</h4>

          {/* Description */}
          {offer.description && (
            <p className="mt-2 text-xs text-center text-yellow-400">{offer.description}</p>
          )}

          {/* Offer Code */}
          {offer.code && (
            <div
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black text-sm font-semibold rounded-md cursor-pointer"
              onClick={() => copyToClipboard(offer.code)}
            >
              Code: {offer.code}
              <Copy
                className="w-4 h-4 text-black cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents triggering parent click
                  copyToClipboard(offer.code);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OffersCard;
