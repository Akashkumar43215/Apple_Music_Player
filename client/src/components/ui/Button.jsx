import clsx from "clsx";

const Button = ({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-brand text-white shadow-glow hover:scale-[1.03] hover:brightness-110",

    glass:
      "glass text-white hover:bg-white/10",

    danger:
      "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;