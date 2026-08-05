// import { motion } from "framer-motion";
// import { FiHeart } from "react-icons/fi";
// import { FaHeart } from "react-icons/fa";
// import { useFavorites } from "../../hooks/useFavorites";

// const FavoriteButton = ({ songId }) => {
//   const { isFavorite, toggleFavorite } = useFavorites(songId);

//   return (
//     <motion.button
//       whileTap={{ scale: 0.8 }}
//       whileHover={{ scale: 1.15 }}
//       onClick={(e) => {
//         e.stopPropagation();
//         toggleFavorite();
//       }}
//       className="
//         absolute
//         top-2
//         right-2
//         z-20
//         flex
//         h-9
//         w-9
//         items-center
//         justify-center
//         rounded-full
//         bg-black/60
//         backdrop-blur-xl
//       "
//     >
//       {isFavorite ? (
//         <FaHeart className="text-red-500" size={16} />
//       ) : (
//         <FiHeart className="text-white" size={16} />
//       )}
//     </motion.button>
//   );
// };

// export default FavoriteButton;


import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useFavorites } from "../../hooks/useFavorites";

const FavoriteButton = ({ songId }) => {
  const { isFavorite, toggleFavorite } = useFavorites(songId);

  const handleClick = async (e) => {
    e.stopPropagation();

    try {
      await toggleFavorite();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      aria-label={
        isFavorite ? "Remove from favorites" : "Add to favorites"
      }
      className="
        absolute
        top-2
        right-2
        z-20
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        bg-black/60
        backdrop-blur-xl
        transition-colors
        duration-200
        hover:bg-black/80
      "
    >
      {isFavorite ? (
        <FaHeart
          size={16}
          className="text-red-500"
        />
      ) : (
        <FiHeart
          size={16}
          className="text-white"
        />
      )}
    </motion.button>
  );
};

export default FavoriteButton;