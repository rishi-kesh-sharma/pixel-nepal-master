import React from "react";

export const TitleHeading = ({ title1, title2,className }) => {
  return (
    <>
      <h2 className={`text-3xl font-medium leading-10 ${className}`}>
        {title1} <br className="hidden md:block" /> {title2}
      </h2>
    </>
  );
};
