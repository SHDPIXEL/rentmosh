const Modal = ({ isOpen, onClose, cityList, onCitySelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#00000099] flex items-center justify-center z-50">
            <div className="bg-white md:p-8 p-4 rounded-lg shadow-lg relative mx-3">
                {/* X Icon in the top-right corner */}
                <button
                    onClick={onClose}
                    className="absolute top-7 right-7 text-red-800 text-2xl"
                >
                    &times;
                </button>

                <div className="md:text-lg text-md font-bold text-gray-700 mb-4">Select a City</div>
                <div className="space-y-4 grid grid-cols-2 gap-x-10">
                    {cityList.map((city, index) => (
                        <div 
                        key={index} 
                        onClick={() => onCitySelect(city)}
                        className="flex items-center gap-4 hover:bg-gray-100 rounded-lg p-2">
                            <img
                                src={city.city_image}
                                alt={city.name}
                                className="md:w-16 md:h-16 w-12 h-12 aspect-3/2 rounded-md cursor-pointer"
                            />
                            <div
                                className="text-gray-700 md:text-base text-sm cursor-pointer"
                            >
                                {city.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Modal;
