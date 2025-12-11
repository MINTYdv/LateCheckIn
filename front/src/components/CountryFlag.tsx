interface CountryFlagProps {
  code: string;      // ISO country code, e.g., "FR"
  size?: string;     // Tailwind classes, e.g., "w-6 h-6"
}

export default function CountryFlag({ code, size = "w-6 h-6" }: CountryFlagProps) {
  if (!code) return null;

  return (
    <span
      className={`fi fi-${code.toLowerCase()} rounded-full ${size}`}
      style={{
        display: "inline-block",
        borderRadius: "50%",
        backgroundSize: "cover",       // zoom to fill the circle
        backgroundPosition: "center",  // center the flag
      }}
    />
  );
}