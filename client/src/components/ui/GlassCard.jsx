// import clsx from "clsx";

// const GlassCard = ({
//   children,
//   className = "",
//   hover = true,
// }) => {
//   return (
//     <div
//       className={clsx(
//         "relative overflow-hidden rounded-[28px]",
//         "border border-white/10",
//         "bg-white/[0.05]",
//         "backdrop-blur-2xl",
//         "shadow-[0_15px_45px_rgba(0,0,0,.35)]",
//         "transition-all duration-300",
//         hover && "hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,.45)]",
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// };

// export default GlassCard;

const GlassCard = ({
    children,
    className = "",
    hover = true
}) => {
    return (

        <div

            className={`

            rounded-[28px]

            border

            border-white/10

            bg-white/[0.05]

            backdrop-blur-2xl

            shadow-[0_15px_45px_rgba(0,0,0,.35)]

            transition-all

            duration-300

            ${hover ? "hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,.45)]" : ""}

            ${className}

            `}
        >

            {children}

        </div>

    )
}

export default GlassCard;