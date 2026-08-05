// import clsx from "clsx";

// const IconButton = ({
//   icon: Icon,
//   onClick,
//   className = "",
// }) => {
//   return (
//     <button
//       onClick={onClick}
//       className={clsx(
//         "flex h-11 w-11 items-center justify-center",
//         "rounded-full",
//         "border border-white/10",
//         "bg-white/5",
//         "transition-all duration-300",
//         "hover:scale-105",
//         "hover:bg-white/10",
//         className
//       )}
//     >
//       <Icon size={18} />
//     </button>
//   );
// };

// export default IconButton;


const IconButton = ({
    children,
    onClick,
    className=""
}) => {
    return (

        <button
            onClick={onClick}
            className={`

            flex

            h-10

            w-10

            items-center

            justify-center

            rounded-full

            bg-black/45

            backdrop-blur-xl

            border border-white/10

            transition

            hover:scale-110

            ${className}

            `}
        >

            {children}

        </button>

    )
}

export default IconButton;