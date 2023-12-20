import { FaRegChartBar, FaUserEdit } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import { CiGrid41 } from "react-icons/ci";

const menu = [
  {
    title: "Dashboard",
    icon: <CiGrid41 size={20} />,
    path: "/",
  },
  {
    title: "Profile",
    icon: <AiOutlineUser size={20} />,
    path: "/profile",
  },
  {
    title: "Account",
    icon: <FaRegChartBar />,
    childrens: [
      {
        title: "Profile",
        path: "/profile",
        icon: <AiOutlineUser />,
      },
      {
        title: "Edit Profile",
        path: "/edit-profile",
        icon: <FaUserEdit />,
      },
    ],
  },
];

export default menu;
