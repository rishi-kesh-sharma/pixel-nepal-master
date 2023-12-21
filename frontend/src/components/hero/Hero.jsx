import React from "react";
import {
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Checkbox,
  Button,
} from "@material-tailwind/react";
import { BiSearch } from "react-icons/bi";
import { BsUiChecksGrid } from "react-icons/bs";
import { IoImagesOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import Link from "next/link";

export const Hero = () => {
  return (
    <div className="bg-indigo-500 pb-[2rem]  ">
      <div className="my-container m-auto">
        <section className="my-container">
          <div className="  flex flex-col gap-[2rem] md:w-4/5  py-12 m-auto text-white text-center">
            <h2 className="text-4xl font-semibold lg:leading-loose">
              All the assets you need, in one place
            </h2>
            <h4 className="text-xl">
              Find and download the best high-quality photos, vectors, videos,
              and mockups
            </h4>
            <div className="">
              <SearchBox color="bg-white" shadow="shadow-lg" />
            </div>
          </div>
          <div className="card_content py-[2rem] flex justify-center items-center">
            <div className="cards grid md:grid-cols-3 gap-8 md:gap-3">
              <Card title="Vectors" image="images/vector.jpg" />
              <Card title="photo" image="images/photo.jpeg" />
              <Card title="video" image="images/photo.avif" />
              <Card title="PSD" image="images/psd.jpg" />
              <Card title="Template" image="images/temp.avif" />
            </div>
          </div>
        </section>
        <div className=" my-container bg-indigo-100 p-3 md:p-6  m-auto rounded-md ">
          <div className="md:w-4/5 m-auto  flex flex-col md:flex-row items-center justify-center gap-5 ">
            <p className="text-center">
              Create an account to enjoy more free downloads
            </p>
            <Button className="h-[3rem] text-sm font-medium " color="indigo">
              Sign up for free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SearchBox = ({ color, shadow }) => {
  return (
    <div className="flex max-w-[700px] m-auto w-full md:w-auto flex-col md:flex-row  md:justify-between md:items-center gap-2 md:gap-0 ">
      <div
        className={`${color} relative flex flex-row md:flex-row w-full rounded-md border border-gray-300 ${shadow} md:rounded-tr-none md:rounded-br-none md:border-r-0`}>
        <Menu placement="bottom-start">
          <MenuHandler>
            <button
              variant="text"
              className="flex h-14 w-56 items-center justify-between gap-2 text-black px-5 text-sm  border-r border-gray-300">
              <div className="flex items-center gap-3">
                <BsUiChecksGrid size={15} />
                Assets
              </div>
              <div className="">
                <MdKeyboardArrowDown size={20} />
              </div>
            </button>
          </MenuHandler>
          <MenuList className="w-40 p-0 py-3 h-auto">
            <MenuItem className="flex items-center gap-3">
              <BsUiChecksGrid size={15} />
              Assets
            </MenuItem>
            <MenuItem className="flex items-center gap-3">
              <BsUiChecksGrid size={15} />
              Collection
            </MenuItem>
            <MenuItem className="flex items-center gap-3">
              <BsUiChecksGrid size={15} />
              Vector
            </MenuItem>
            <MenuItem className="flex items-center gap-3">
              <BsUiChecksGrid size={15} />
              Photo
            </MenuItem>
            <MenuItem className="flex items-center gap-3">
              <BsUiChecksGrid size={15} />
              AI Images
            </MenuItem>
            <MenuItem className="flex items-center gap-3">
              <BsUiChecksGrid size={15} />
              Video
            </MenuItem>
            <MenuItem className="flex items-center gap-3">
              <BsUiChecksGrid size={15} />
              PSD
            </MenuItem>
            <MenuItem className="flex items-center gap-3">
              <BsUiChecksGrid size={15} />
              Icons
            </MenuItem>
            <hr className="my-2" />
            <MenuItem className="flex items-center gap-3">
              <input type="checkbox" />
              <span>Free</span>
            </MenuItem>
            <MenuItem className="flex items-center gap-3">
              <Checkbox
                label="Premium"
                id="vertical-list-react"
                ripple={false}
                className="hover:before:opacity-0"
                containerProps={{
                  className: "p-0 pr-3",
                }}
              />
            </MenuItem>
          </MenuList>
        </Menu>
        <Input
          type="text"
          placeholder="Search all assets"
          className=" border-none md:w-full pt-6"
          labelProps={{
            className: "before:content-none after:content-none",
          }}
          containerProps={{
            className: "min-w-0",
          }}
          icon={
            <Link className="hidden" href="/search">
              <BiSearch size={25} className="mt-2" />
            </Link>
          }
        />
      </div>
      <div
        className={`${color} md:w-56 flex justify-center md:justify-start h-14 md:h-[3.58rem] items-center gap-2 text-black px-5 text-sm rounded-md md:rounded-tl-none md:rounded-bl-none md:rounded border border-gray-300 md:border-l-0 ${shadow}`}>
        <button className="flex items-center justify-center gap-3 md:border-l-0">
          <IoImagesOutline size={20} />
          <span className="text-[12px] text-center md:text-start">
            Search By Images
          </span>
        </button>
      </div>
    </div>
  );
};

export const Card = ({ title, image }) => {
  return (
    <div className="card text-center">
      <div className="image w-60 h-40 md:w-56 overflow-hidden border-[3px] border-[rgba(255,255,255,0.6)] rounded-xl">
        {image && (
          <img
            src={image}
            alt="title"
            className="object-cover w-full h-full p-1 rounded-xl transition ease-in-out duration-300 hover:scale-125 hover:rotate-6"
          />
        )}
      </div>
      <h2 className="capitalize mt-5 text-white">{title}</h2>
    </div>
  );
};
