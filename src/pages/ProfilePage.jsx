import React, { useState, useEffect } from "react";
import { Download, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../lib/api";
import { data } from "react-router-dom";

const ProfilePage = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [addresses, setAddresses] = useState([]);
  const [addressData, setAddressData] = useState({
    fullName: "",
    contact: "",
    address: "",
    nearestLandmark: "",
    postalCode: "",
    city: "",
  });
  const [kycData, setKycData] = useState({
    idName: "",
    idProofImage: null,
  });
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [kycList, setKycList] = useState([]); // Holds submitted KYC details
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAddresses();
    fetchUserProfile();
    fetchKYCDetails();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await API.get("/user/address", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.status === 200 && response.data) {
        // Ensure addresses is always an array
        const formattedAddresses = Array.isArray(response.data)
          ? response.data
          : JSON.parse(response.data || "[]"); // Handle JSON string case

        setAddresses(formattedAddresses); // Update state with fetched addresses
      }
    } catch (error) {
      console.error("Error fetching Addresses:", error); // Log the entire error

      // Check for the specific error message
      if (error.message === "No addresses found for this user") {
        toast.error("No addresses found for this user.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await API.get("/auth/user/profileDetails", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.status === 200) {
        setUserData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setError("Failed to fetch user details");
      toast.error("An error occurred while fetching the address.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKYCDetails = async () => {
    try {
      const response = await API.get("/user/get/kyc", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.status === 200 && response.data.kyc) {
        // Check if KYC data exists or is empty
        if (Object.keys(response.data.kyc).length === 0) {
          toast.info("No KYC details available.");
          setKycList([]); // Ensure state is empty
          return;
        }

        // Format KYC data correctly
        const formattedKYC = {
          idName: response.data.kyc.idName,
          idProofImage: Array.isArray(response.data.kyc.idProofImage)
            ? response.data.kyc.idProofImage
            : JSON.parse(response.data.kyc.idProofImage || "[]"), // Handle JSON string
        };

        setKycList([formattedKYC]); // Update state with fetched KYC details
      } else {
        toast.info("No KYC details available.");
        setKycList([]); // Ensure state is empty
      }
    } catch (error) {
      console.error("Error fetching KYC:", error); // Log the entire error

      // Check if error contains the message directly
      if (error.message === "KYC record not found") {
        toast.error("KYC record not found.");
      } else {
        toast.error("An unexpected error occurred.");
      }

      setKycList([]); // Reset the state in case of error
    }
  };

  const handleInputChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handleKYCInputChange = (e) => {
    setKycData({ ...kycData, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setKycData({ ...kycData, idProofImage: file });
  };

  const handleDeleteClick = async (index) => {
    try {
      const response = await API.delete("/user/delete/address");

      if (response.status === 200) {
        toast.success("Address deleted successfully!");

        // Remove the deleted address from state
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(updatedAddresses);
      } else {
        toast.error("Failed to delete address.");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("An error occurred while deleting the address.");
    }
  };

  const handleEditClick = async (index) => {
    try {
      setIsEditing(true);
      setEditIndex(index);

      const response = await API.get("/user/address"); // Fetch all addresses
      console.log("Fetched Addresses:", response.data);

      if (response.status === 200 && Array.isArray(response.data)) {
        const selectedAddress = response.data[index]; // Get the correct address

        if (selectedAddress) {
          setAddressData({
            fullName: selectedAddress.fullName || "",
            contact: selectedAddress.contact || "",
            address: selectedAddress.address || "",
            nearestLandmark: selectedAddress.nearestLandmark || "",
            postalCode: selectedAddress.postalCode || "",
            city: selectedAddress.city || "",
          });
        } else {
          toast.error("No address found at this index.");
        }
      } else {
        toast.error("Failed to fetch address for editing.");
      }
    } catch (error) {
      console.error("Error fetching address for editing:", error);
      toast.error("An error occurred while fetching the address.");
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        // Since the address is linked to the user ID from the token, we no longer need the address ID from the index
        // We send the request to the "/user/update/address" endpoint (no need for the address ID in the URL)

        const response = await API.put(
          "/user/update/address", // API endpoint to update address
          addressData, // Send the addressData for update
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Include token in the header
            },
          }
        );

        if (response.status === 200) {
          toast.success("Address updated successfully!");
          fetchAddresses(); // Refresh the list after update
        } else {
          toast.error("Failed to update address.");
        }

        setIsEditing(false);
        setEditIndex(null); // Reset editing state
      } else {
        // Adding a new address
        const response = await API.post(
          "/user/create/address", // API endpoint to create address
          addressData, // Send the address data to create a new address
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Include token in the header
            },
          }
        );

        if (response.status === 201) {
          toast.success("Address added successfully!");
          fetchAddresses(); // Refresh the list after adding the address
        } else {
          toast.error("Failed to add address.");
        }
      }

      // Reset form fields after submitting
      setAddressData({
        fullName: "",
        contact: "",
        address: "",
        nearestLandmark: "",
        postalCode: "",
        city: "",
      });
    } catch (error) {
      console.error("Error submitting address:", error);
      toast.error("An error occurred while saving the address.");
    }
  };

  // Handle KYC form submission (POST request)
  const handleKYCSubmit = async () => {
    try {
      if (!kycData.idName || !kycData.idProofImage) {
        toast.error("Please fill in all fields and upload an ID Proof.");
        return;
      }

      const formData = new FormData();
      formData.append("idName", kycData.idName);
      formData.append("idProofImage", kycData.idProofImage);

      const response = await API.post("/user/kyc", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        toast.success("KYC details submitted successfully!");

        // Append new KYC data to the list
        const newKYC = {
          idName: kycData.idName,
          idProofImage: URL.createObjectURL(kycData.idProofImage),
        };

        // Update the local state and save to localStorage
        const updatedKycList = [...kycList, newKYC];
        setKycList(updatedKycList);

        // Save the updated list to localStorage
        localStorage.setItem("kycList", JSON.stringify(updatedKycList));

        // Reset form data
        setKycData({ idName: "", idProofImage: null });
      } else {
        toast.error("Failed to submit KYC details.");
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);

      // Log the full error response for debugging
      if (error.response) {
        console.error("Server Response:", error.response);
      }

      // Extract error message from server response
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An error occurred while submitting KYC details.";

      toast.error(errorMessage);
    }
  };

  const handleDeleteKYC = async (index) => {
    try {
      const response = await API.delete("/user/delete/kyc", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Send token
      });

      if (response.status === 200) {
        toast.success("KYC deleted successfully!");

        // Remove the deleted KYC entry from state
        const updatedKYCList = kycList.filter((_, i) => i !== index);
        setKycList(updatedKYCList);
      } else {
        toast.error("Failed to delete KYC.");
      }
    } catch (error) {
      console.error("Error deleting KYC:", error);
      toast.error("An error occurred while deleting the KYC.");
    }
  };

  const colors = {
    0: "bg-purple-100 text-purple-700 text-purple-900",
    1: "bg-yellow-100 text-yellow-700 text-yellow-900",
    2: "bg-red-100 text-red-700 text-red-900",
  };

  const sectionTitles = {
    dashboard: "Dashboard",
    orders: "Orders",
    address: "Address",
    payments: "Payments",
    invoice: "Invoice",
    kyc: "KYC Verification",
    profile: "Profile Settings",
  };

  const sections = {
    dashboard: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-100 shadow-sm p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-blue-700">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-900">42</p>
        </div>
        <div className="bg-green-100 shadow-sm p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-green-700">
            Total Money Spent
          </h3>
          <p className="text-2xl font-bold text-green-900">₹ 1,20,000</p>
        </div>
      </div>
    ),
    orders: (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-gray-200 bg-white p-6 rounded-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="shadow-sm rounded-md p-2">Order ID</th>
              <th className="shadow-sm rounded-md p-2">Status</th>
              <th className="shadow-sm rounded-md p-2">Amount</th>
              <th className="shadow-sm rounded-md p-2">Amount</th>
              <th className="shadow-sm rounded-md p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="shadow-sm rounded-sm text-center p-2">#12345</td>
              <td className="shadow-sm rounded-sm text-center p-2">Active</td>
              <td className="shadow-sm rounded-sm text-center p-2">₹ 2,500</td>
              <td className="shadow-sm rounded-sm text-center p-2">₹ 2,500</td>
              <td className="shadow-sm rounded-sm text-center p-2">₹ 2,500</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
    address: (
      <>
        {activeSection === "address" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Address Form */}
            <div className="p-6 rounded-lg space-y-4">
              {[
                "fullName",
                "contact",
                "address",
                "nearestLandmark",
                "postalCode",
                "city",
              ].map((name) => (
                <div key={name} className="w-full">
                  <input
                    type="text"
                    name={name}
                    value={addressData[name]}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 shadow-sm p-2 rounded focus:outline-none focus:border-gray-400 hover:border-gray-400"
                    placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
                  />
                </div>
              ))}
              <div className="w-full sm:w-2/4">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-[#960b22] text-white p-2 rounded shadow-md hover:bg-red-700 transition"
                >
                  {isEditing ? "Update" : "Submit"}
                </button>
              </div>
            </div>

            {/* Address List */}
            <div className="space-y-4 w-full">
              {addresses.length > 0 ? (
                addresses.map((address, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm w-full p-4 hover:shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-[#960b22]">
                        {address?.fullName || "No Name"}
                      </p>
                      <div className="flex space-x-2">
                        <Pencil
                          className="cursor-pointer text-gray-600 hover:text-blue-500 transition"
                          size={20}
                          onClick={() => handleEditClick(index)}
                        />
                        <Trash2
                          className="cursor-pointer text-gray-600 hover:text-red-500 transition"
                          size={20}
                          onClick={() => handleDeleteClick(index)}
                        />
                      </div>
                    </div>
                    <p className="text-gray-500">
                      {address.contact || "No Contact"}
                    </p>
                    <p className="truncate mt-2 text-gray-500">
                      {address.address || "No Address"}
                    </p>
                    <p className="text-gray-500">
                      {address.city || "No City"},{" "}
                      {address.postalCode || "No Postal Code"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No addresses saved yet.</p>
              )}
            </div>
          </div>
        )}
      </>
    ),
    payments: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Total Invoice", "Total Payments", "Balance"].map((title, index) => (
          <div
            key={title}
            className={`shadow-md p-6 rounded-lg text-center ${
              colors[index].split(" ")[0]
            }`}
          >
            <h3
              className={`text-lg font-semibold ${colors[index].split(" ")[1]}`}
            >
              {title}
            </h3>
            <p className={`text-2xl font-bold ${colors[index].split(" ")[2]}`}>
              ₹ {index === 2 ? "1,500" : index === 1 ? "8,500" : "10,000"}
            </p>
          </div>
        ))}
      </div>
    ),
    invoice: (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-gray-200 bg-white p-6 rounded-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="shadow-sm rounded-md p-2">Invoice Date</th>
              <th className="shadow-sm rounded-md p-2">Invoice No.</th>
              <th className="shadow-sm rounded-md p-2">Order No.</th>
              <th className="shadow-sm rounded-md p-2">Amount</th>
              <th className="shadow-sm rounded-md p-2">Download</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="shadow-sm rounded-sm text-center p-2">
                01-02-2025
              </td>
              <td className="shadow-sm rounded-sm text-center p-2">INV123</td>
              <td className="shadow-sm rounded-sm text-center p-2">ORD456</td>
              <td className="shadow-sm rounded-sm text-center p-2">₹ 2,500</td>
              <td className="shadow-sm rounded-sm text-center p-2 flex justify-center items-center">
                <Download className="cursor-pointer" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
    kyc: (
      <div className="flex justify-between space-x-6">
        {/* KYC Form (Left Side) */}
        <div className="p-6 w-full sm:w-2/4">
          {/* Name Input */}
          <div className="w-full sm:w-3/4">
            <input
              type="text"
              name="idName"
              value={kycData.idName}
              onChange={handleKYCInputChange}
              className="w-full border border-gray-200 focus:outline-none focus:border-gray-400 hover:border-gray-400 shadow-sm p-2 rounded"
              placeholder="Name as per ID-Proof"
            />
          </div>

          {/* File Upload */}
          <div className="w-full mt-5 sm:w-3/4">
            <h3 className="text-md text-gray-700">Upload ID-Proof Image</h3>
            <label className="w-full cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-full p-2 shadow-sm rounded border border-gray-200 text-center bg-white text-gray-700">
                {kycData.idProofImage
                  ? kycData.idProofImage.name
                  : "Choose File"}
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="w-full mt-5 sm:w-2/4">
            <button
              onClick={handleKYCSubmit}
              className="w-full bg-[#960b22] text-white p-2 rounded shadow-md hover:bg-red-700 transition"
            >
              Submit
            </button>
          </div>
        </div>

        {/* KYC List (Right Side) */}
        <div className="w-full mt-5 sm:w-2/4 space-y-4">
          {kycList.map((kyc, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm w-full p-4 hover:shadow-md"
            >
              <div className="flex justify-between items-center">
                <p className="font-bold text-red-800">{kyc.idName}</p>
                <Trash2
                  className="cursor-pointer text-gray-600 hover:text-red-500 transition"
                  size={20}
                  onClick={() => handleDeleteKYC(index)}
                />
              </div>
              <p className="text-gray-500">Uploaded ID Proof:</p>
              <img
                src={kyc.idProofImage} // Ensure this is a valid URL or blob
                alt="ID Proof"
                className="w-32 h-20 object-cover border rounded mt-2"
              />
            </div>
          ))}
        </div>
      </div>
    ),
    profile: (
      <div className="p-6 rounded-lg space-y-4">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <>
            {["Name", "Contact", "Email"].map((placeholder, index) => (
              <div key={index} className="w-full sm:w-2/4">
                <input
                  className="w-full border border-gray-200 focus:outline-none focus:border-gray-400 hover:border-gray-400 shadow-sm p-2 rounded"
                  placeholder={placeholder}
                  value={
                    placeholder === "Name"
                      ? userData.name
                      : placeholder === "Contact"
                      ? userData.phone
                      : userData.email
                  }
                  readOnly
                />
              </div>
            ))}
            <div className="w-full sm:w-1/4">
              <button className="w-full bg-[#960b22] text-white p-2 rounded shadow-md hover:bg-red-700 transition">
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    ),
  };

  return (
    <div className="mx-auto mt-4 py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          My Profile
        </h2>
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "block" : "hidden"
          } lg:block lg:w-1/4 space-y-4 border border-gray-200 rounded-xl p-4 h-fit`}
          style={{
            boxShadow: "2px -1px 7px rgba(0, 0, 0, 0.07)",
          }}
        >
          {Object.keys(sections).map((key) => (
            <button
              key={key}
              className={`w-full text-left p-3 rounded-lg transition ${
                activeSection === key
                  ? "bg-[#960b22] hover:bg-red-700 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => {
                setActiveSection(key);
                setIsSidebarOpen(false);
              }}
            >
              {sectionTitles[key]}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 w-full">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
            {sectionTitles[activeSection]}
          </h3>
          {sections[activeSection]}
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default ProfilePage;
