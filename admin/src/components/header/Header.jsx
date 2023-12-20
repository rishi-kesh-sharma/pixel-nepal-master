import React from "react";
import { AiOutlineEdit, AiOutlineLogout, AiOutlineSetting } from "react-icons/ai";
import { HiOutlineUserCircle } from "react-icons/hi";
import { MdOutlineExplore } from "react-icons/md";
import { SearchBox } from "../common/SearchBox";
import { Avatar, Typography, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RESET, logout, selectUser } from "../../redux/slices/authSlice";

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const photo = user?.avatar?.filePath || "...";
  const username = user?.name || "...";

  const logoutUser = async () => {
    dispatch(RESET());
    await dispatch(logout());
    navigate("/login");
  };
  return (
    <header className="shadow-sm bg-white flex justify-between items-center h-[8vh] px-8 sticky top-0 left-0 z-10">
      <div className="flex items-center justify-between w-full">
        <div className="w-1/2">
          <SearchBox />
        </div>
        <div className="flex justify-end items-center gap-5 w-1/2">
          <Menu>
            <MenuHandler>
              <AiOutlineSetting className="text-gray-700 roll" size={30} />
            </MenuHandler>
          </Menu>
          <Menu>
            <MenuHandler>
              <Avatar variant="circular" size="sm" alt={username} className="cursor-pointer" src={photo} />
            </MenuHandler>
            <MenuList className="w-80 -ml-6">
              <MenuItem className="text-center items-center flex flex-col">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <Avatar size="md" variant="circular" src={photo} alt={username} />
                </div>
                <Typography variant="h6" color="blue-gray" className="mb-2 flex items-center gap-2 font-medium">
                  {username}
                </Typography>
              </MenuItem>
              <MenuItem className="flex items-center border-b border-gray-200 py-3 border-t transition-all ease-in-out hover:cursor-pointer hover:bg-gray-50">
                <span>
                  <HiOutlineUserCircle size={22} />
                </span>
                <span className="ml-2">My Profile</span>
              </MenuItem>
              <MenuItem className="flex items-center border-b border-gray-200 py-3  transition-all ease-in-out hover:cursor-pointer hover:bg-gray-50">
                <AiOutlineEdit size={22} />
                <Typography className="ml-2">Edit Profile</Typography>
              </MenuItem>
              <MenuItem className="flex items-center border-b border-gray-200 py-3  transition-all ease-in-out hover:cursor-pointer hover:bg-gray-50">
                <AiOutlineSetting size={22} />
                <Typography className="ml-2">Account Setting</Typography>
              </MenuItem>
              <MenuItem className="flex items-center border-b border-gray-200 py-3 transition-all ease-in-out hover:cursor-pointer hover:bg-gray-50">
                <AiOutlineSetting size={22} />
                <Typography className="ml-2">Support</Typography>
              </MenuItem>
              <MenuItem className="flex items-center border-b border-gray-200 py-3  transition-all ease-in-out hover:cursor-pointer hover:bg-gray-50">
                <MdOutlineExplore size={22} />
                <Typography className="ml-2">Activity</Typography>
              </MenuItem>
              <MenuItem onClick={logoutUser} className="flex items-center border-gray-200 py-3  transition-all ease-in-out hover:cursor-pointer hover:bg-gray-50">
                <AiOutlineLogout size={22} />
                <Typography className="ml-2">Sign Out</Typography>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </div>
    </header>
  );
};
