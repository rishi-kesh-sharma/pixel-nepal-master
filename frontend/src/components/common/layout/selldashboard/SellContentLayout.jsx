import { Footer } from "@/components/footer/Footer";
import { SellContentHeader } from "@/routes";
import React from "react";

export const SellContentLayout = ({ children }) => {
  return (
    <div className="overflow-x-hidden">
      <SellContentHeader />
      <main className="md:w-full">{children}</main>
      <Footer />
    </div>
  );
};
