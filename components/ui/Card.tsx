import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white
        border border-gray-200
        rounded-xl
        shadow-sm
        p-6
        transition
        ${hover ? "hover:shadow-md" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}