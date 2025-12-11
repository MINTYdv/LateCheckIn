
interface CountryFlagProps {
  code: string;
  size?: string;
}

export default function CountryFlag({code, size = "w-6 h-6"}: CountryFlagProps) {
  if (!code) return null;

  return (
    <span
      className={`fi fi-${code.toLowerCase()} rounded-full ${size}`}
      style={{
          width: size,
          height: size,
          borderRadius: "50%",
          display: "inline-block",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} 
    ></span>
  );
}