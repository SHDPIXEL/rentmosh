    import { useNavigate } from "react-router-dom";

    const CategoryCard = ({id, title, image, bgColor = "bg-indigo-600" }) => {
        const navigate = useNavigate();

        const handleClick = () => {
            navigate(`/category/${id}/${title.toLowerCase()}`);
        }; 

        return (
            <div
                onClick={handleClick} 
                className={`group relative flex-shrink-0 w-36 h-40 md:w-48 md:h-52 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm ${bgColor} cursor-pointer`}
            >
                {/* Title Section */}
                <div className="absolute top-0 left-0 p-3 md:p-4 z-10">
                    <h3 className="text-sm md:text-lg font-semibold text-white">{title}</h3>
                </div>

                {/* Image Container */}
                <div className="absolute bottom-0 w-full h-32 md:h-40 bg-white rounded-t-2xl p-2 md:p-3 border border-gray-200 transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full flex items-center justify-center">
                        <img 
                            src={image} 
                            alt={title} 
                            className="max-w-full max-h-full object-contain" 
                        />
                    </div>
                </div>
            </div>
        );
    };

    export default CategoryCard;
