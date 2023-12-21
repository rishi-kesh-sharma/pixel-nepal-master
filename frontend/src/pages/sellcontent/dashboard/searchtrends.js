import { SellContentDashboardHeader } from "@/components/header/SellContentDashboard/SellContentDashboardHeader";
import { SearchTrends } from "@/routes";
import React from "react";

const searchtrends = () => {
  return (
    <>
      <SellContentDashboardHeader />
      <div className="my-container">
        <SearchTrends />
      </div>
    </>
  );
};

export default searchtrends;
