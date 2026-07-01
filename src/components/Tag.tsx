import React from "react";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ children, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-all ${className}`}
    >
      {children}
    </span>
  );
};

export default Tag;