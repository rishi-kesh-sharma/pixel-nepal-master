import React from "react";
import { Header, Sidebar } from "../../routers/index";
// import { Admin } from "../../routers/Protect";

export const Layout = ({ children }) => {
  return (
    <>
      <>
        <Sidebar>
          <Header />
          <main style={{ minHeight: "80vh" }} className="p-8">
            {children}
          </main>
        </Sidebar>
      </>
    </>
  );
};
