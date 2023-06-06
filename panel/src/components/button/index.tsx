interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color: "primary" | "dark" | "danger";
  size: "small" | "large";
  disabled?: boolean;
  formAction?: "submit" | "reset" | "button";
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  color,
  size,
  disabled = false,
  formAction,
}) => {
  const colors = {
    primary: "bg-violet-500 hover:bg-violet-600 disabled:bg-violet-400",
    dark: "bg-gray-800 hover:bg-gray-900 disabled:bg-gray-600",
    danger: "bg-red-500 hover:bg-red-600 disabled:bg-red-300",
  };

  const sizes = {
    small: "px-6 py-2 text-sm",
    large: "px-10 py-3 text-lg",
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg font-semibold text-white no-underline shadow-md transition hover:shadow-lg disabled:cursor-not-allowed ${colors[color]} ${sizes[size]}`}
      onClick={onClick}
      formAction={formAction}
    >
      {children}
    </button>
  );
};

export default Button;
