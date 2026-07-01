import React from "react";

interface HeadingProps {
  title: string;
  highlight?: string;
  className?: string;
  highlightClassName?: string;
}

const Heading: React.FC<HeadingProps> = ({
  title,
  highlight,
  className = "",
  highlightClassName = "",
}) => {
  return (
    <h1
      className={`mt-6 text-4xl md:text-5xl font-bold text-white leading-tight ${className}`}
    >
      {title}

      {highlight && (
        <span
          className={`block mt-2 text-cyan-400 ${highlightClassName}`}
        >
          {highlight}
        </span>
      )}
    </h1>
  );
};

export default Heading;