import React, { useState } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import menu from "../assest/data";
import LogoImg from "../assest/images/logo2.png";
import { SidebarItem } from "./SidebarItem";

export const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <section className="layout">
      <div className="sidebar  bg-primary" style={{ width: isOpen ? "290px" : "70px" }}>
        <div className="flex justify-between items-center h-[8vh] px-3 border-b border-gray-800 sticky top-0 left-0 w-full z-50 bg-primary">
          <div className="w-8 h-8 " style={{ display: isOpen ? "block" : "none" }}>
            <img src={LogoImg} alt="LogoImg" onClick={goHome} />
          </div>
          <div className="text-white cusp" style={{ marginLeft: isOpen ? "100px" : "0px" }}>
            <HiMenuAlt3 onClick={toggle} size={25} />
          </div>
        </div>
        <br />
        <br />
        {menu.map((item, index) => {
          return <SidebarItem key={index} item={item} isOpen={isOpen} />;
        })}
      </div>

      <main
        style={{
          paddingLeft: isOpen ? "290px" : "70px",
          transition: "all .5s",
        }}
      >
        {children}
      </main>
    </section>
  );
};
