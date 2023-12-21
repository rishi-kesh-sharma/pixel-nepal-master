import React, { useState } from "react";
import { LogoText } from "../SearchHeader";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";
import { UserProfileAfterLogin } from "../Header";
import { Drawer, IconButton, List, Typography } from "@material-tailwind/react";
import { RxHamburgerMenu } from "react-icons/rx";

export const SellContentHeader = () => {
  const linkData = [
    {
      id: 1,
      name: "community",
      path: "/contributor/community",
    },
    {
      id: 2,
      name: "trends ",
      path: "/contributor/trends",
    },
    {
      id: 3,
      name: "blog",
      path: "/contributor/blog",
    },
    {
      id: 4,
      name: "help",
      path: "/contributor/help",
    },
  ];

  const userlogin = true;

  return (
    <div className="relative">
      <div className=" hidden md:block h-[80px]  shadow-md  w-[600px] md:w-full ">
        <div className="bg-white z-50 py-2.5 relative h-full w-full my-container  ">
          <div className="sticky top-0 left-0 right-0 flex items-center justify-between h-full">
            <div className="flex items-center gap-16 md:gap-10 w-full justify-between  ">
              <div className="logo flex gap-1 items-center justify-between">
                <LogoText />
                {/* <h3 className="font-normal text-2xl">Contributor</h3> */}
              </div>
              <div className="nav">
                <ul className="flex items-center gap-5 capitalize">
                  {linkData.map((link) => (
                    <li key={link.id}>
                      <Link href={link.path}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="account gap-3 hidden md:flex">
              {userlogin ? (
                <>
                  <UserProfileAfterLogin />
                </>
              ) : (
                <>
                  <Link href="/contributor/login">
                    <button className="primary-outline-btn px-6 py-2.5 rounded-md flex items-center gap-2">
                      <AiOutlineUserAdd size={18} />
                      <span>Login</span>
                    </button>
                  </Link>
                  <Link href="/contributor/register">
                    <button className="primary-btn px-8 py-2.5 rounded-md">
                      Sign up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <HeaderMobile linkData={linkData} />
    </div>
  );
};

const HeaderMobile = ({ linkData }) => {
  return (
    <header className="bg-indigo-500 md:hidden sticky top-0 left-0 right-0 z-50">
      <div className="flex justify-between py-[1rem] h-[3rem] max-w-[90%] mx-auto">
        <div className="logo flex text-white">
          <Typography
            as="a"
            href="#"
            variant="h5"
            className="mr-4 font-normal cursor-pointer capitalize">
            pixel Nepal
          </Typography>
        </div>
        <SidebarMobile linkData={linkData} />
      </div>
    </header>
  );
};
function SidebarMobile({ linkData }) {
  const [openRight, setOpenRight] = useState(false);

  const openDrawerRight = () => setOpenRight(true);
  const closeDrawerRight = () => setOpenRight(false);

  return (
    <div className="relative z-50 ">
      <div className="flex  flex-wrap gap-4 ">
        <RxHamburgerMenu
          className="text-2xl text-white "
          onClick={openDrawerRight}
        />
      </div>
      <Drawer
        placement="right"
        open={openRight}
        onClose={closeDrawerRight}
        className="p-4">
        <div className=" absolute top-0 right-0">
          <IconButton
            className=""
            variant="text"
            color="blue-gray"
            onClick={closeDrawerRight}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5 text-red-600">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>
        <div className="mt-8">
          <NavListMobile linkData={linkData} />
        </div>{" "}
      </Drawer>
    </div>
  );
}
function NavListMobile({ linkData }) {
  return (
    <List className="  px-0 py-0   flex flex-col md:flex-row gap-2 md:items-center text-sm lg:text-white ">
      {linkData.map((link) => (
        <Link
          href={link.path}
          className="border p-2 rounded-md hover:bg-primary hover:text-secondary">
          {link?.name}
        </Link>
      ))}
    </List>
  );
}
