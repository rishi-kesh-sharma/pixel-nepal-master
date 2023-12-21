import { Explore, Hero } from "@/routes";
import React from "react";

export const HomeScreen = () => {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <Explore />
    </div>
  );
};
