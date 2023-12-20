import React, { useEffect, useState } from "react";
import { Avatar, Button, Input, Radio, Typography } from "@material-tailwind/react";
import { AiOutlineCheckCircle, AiOutlineCloudUpload, AiOutlinePlus, AiOutlineUser } from "react-icons/ai";
import { BiPhoneCall } from "react-icons/bi";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import { BsArrowRight } from "react-icons/bs";
import MasonryLayout from "react-layout-masonry";
import {
  InputPassword,
  LikeAndDislikeComponent,
  Loader,
  Shadow,
  UpdateProfile,
  VerifiedNotification,
} from "../../routers";
import { useDispatch, useSelector } from "react-redux";
import { RESET, changePassword, getUserProfile, logout, updateUserCover } from "../../redux/slices/authSlice";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { sendAutomatedEmail } from "../../redux/slices/emailSlice";
import { getFavoriteList } from "../../redux/slices/favoriteSlice";
import { getAllResourceCreatedByUser } from "../../redux/slices/resources/resourceSlice";

const initialSate = {
  oldPassword: "",
  password: "",
  confirmPassword: "",
};

export const ProfileComponent = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState("");
  const [userCoverURL, setUserCoverURL] = useState("");

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const handleImageChange = (e) => {
    setCoverImage(e.target.files[0]);
    // Automatically update the cover photo when a new image is selected
    const reader = new FileReader();
    reader.onload = (event) => {
      const newCoverImage = event.target.result;
      const coverImageElement = document.querySelector(".cover-img img");
      if (coverImageElement) {
        coverImageElement.src = newCoverImage;
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };
  const saveCover = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (coverImage) {
        formData.append("cover", coverImage);
      }

      const response = await dispatch(updateUserCover(formData));

      const updatedCoverURL = response.data.coverURL;
      setUserCoverURL(updatedCoverURL);

      navigate("/profile");
    } catch (error) {
      toast.error(error);
    }
  };

  const handleTabClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };
  const tabs = [
    { name: "About", component: <AboutComponent userdata={user} /> },
    { name: "Edit Profile", component: <UpdateProfile /> },
    { name: "Posts Gallary", component: <PostsGallaryComponent /> },
    { name: "Friends", component: <FriendsComponent /> },
    { name: "Favorite", component: <FavoritListComponent /> },
    { name: "Liked and Disliked", component: <LikeAndDislikeComponent /> },
    { name: "Update Password", component: <UpdatePasswordComponent /> },
    { name: "Account Setting", component: <AccountSettingComponent userdata={user} /> },
  ];

  return (
    <>
      <Shadow>
        <div className="cover-img h-[330px] relative">
          <div>
            <img
              src={userCoverURL || user?.cover?.filePath}
              className="w-full h-[330px] object-cover rounded-xl"
              alt="cover"
            />
          </div>
          <div className="absolute -bottom-14 left-5">
            <Avatar
              src={user?.avatar?.filePath}
              alt={user?.name}
              size="xxl"
              withBorder={true}
              color="white"
              className="p-1"
            />
          </div>
          <div className="absolute bottom-5 right-5">
            <div className="flex gap-1 items-center">
              <Button color="green" className="flex items-center gap-3 rounded-full font-normal">
                <AiOutlinePlus size={18} />
                Follow
              </Button>
              {isLoading && <Loader />}
              <form onSubmit={saveCover} className="flex items-center gap-3 font-normal uppercase">
                <input type="file" id="file" name="cover" onChange={handleImageChange} />
                <label htmlFor="file" className="cover-upload text-[12px]  flex items-center gap-3 font-normal">
                  <AiOutlineCloudUpload size={18} />
                  Cover
                </label>
                {coverImage && (
                  <Button type="submit" color="indigo" className="font-normal rounded-full">
                    Save
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>
        <div className="details pt-16">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h5" color="black" className="font-normal ml-5 capitalize">
                {user?.name}
              </Typography>
            </div>
            <div className="flex justify-between gap-8 items-center -mt-8">
              <div className="flex justify-center flex-col items-center">
                <Typography variant="h4" color="indigo">
                  26
                </Typography>
                <Typography variant="small" color="black">
                  PROJECTS
                </Typography>
              </div>
              <div className="flex justify-center flex-col items-center">
                <Typography variant="h4" color="indigo">
                  33
                </Typography>
                <Typography variant="small" color="black">
                  FOLLOWERS
                </Typography>
              </div>
              <div className="flex justify-center flex-col items-center">
                <Typography variant="h4" color="indigo">
                  136
                </Typography>
                <Typography variant="small" color="black">
                  FOLLOWING
                </Typography>
              </div>
            </div>
          </div>
        </div>
        {!user?.isVerified && <VerifiedNotification />}
        <div className="w-full bg-indigo-50 mt-8 flex items-center gap-5 p-4 rounded-md">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab-button text-sm ${activeTab === index ? "text-indigo-500" : "text-black"}`}
              onClick={() => handleTabClick(index)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </Shadow>
      <br />

      <div className="tab-content"> {tabs[activeTab].component}</div>
    </>
  );
};
export const AboutComponent = ({ userdata }) => {
  return (
    <Shadow>
      <div className="flex flex-col gap-7 border border-gray-200 rounded-lg">
        <div className="p-4">
          <h2 className="text-black font-semibold mb-5">Basic Info</h2>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-orange-50 rounded-full text-orange-500 flex justify-center items-center">
                <AiOutlineUser size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] text-gray-500">Full Name</span>
                <span className="text-sm text-black capitalize">{userdata?.name}</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-full text-purple-500 flex justify-center items-center">
              <BsArrowRight size={20} />
            </div>
            <div className="flex items-center flex-row-reverse gap-5">
              {userdata?.isVerified === true ? (
                <div className="w-10 h-10 bg-red-50 rounded-full text-red-500 flex justify-center items-center">
                  <RxCross2 size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 bg-green-50 rounded-full text-green-500 flex justify-center items-center">
                  <AiOutlineCheckCircle size={20} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[12px] text-gray-500">Is Verified</span>
                <span className="text-sm text-black">{userdata?.isVerified === true ? "No" : "Yes"}</span>
              </div>
            </div>

            <div className="w-10 h-10 bg-purple-50 rounded-full text-purple-500 flex justify-center items-center">
              <BsArrowRight size={20} />
            </div>
            <div className="flex items-center gap-5">
              {userdata?.isVerified === "admin" ? (
                <div className="w-10 h-10 bg-red-50 rounded-full text-red-500 flex justify-center items-center">
                  <RxCross2 size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 bg-green-50 rounded-full text-green-500 flex justify-center items-center">
                  <AiOutlineCheckCircle size={20} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[12px] text-gray-500">Is Admin</span>
                <span className="text-sm text-black capitalize">{userdata?.role}</span>
              </div>
            </div>

            <div className="w-10 h-10 bg-purple-50 rounded-full text-purple-500 flex justify-center items-center">
              <BsArrowRight size={20} />
            </div>
            <div className="flex items-center flex-row-reverse gap-5">
              {userdata?.isBlocked === false ? (
                <div className="w-10 h-10 bg-red-50 rounded-full text-red-500 flex justify-center items-center">
                  <RxCross2 size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 bg-green-50 rounded-full text-green-500 flex justify-center items-center">
                  <AiOutlineCheckCircle size={20} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[12px] text-gray-500">Is Blocked</span>
                <span className="text-sm text-black">{userdata?.isBlocked === false ? "No" : "Yes"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-b border-gray-200 pb-5">
          <h2 className="text-black font-semibold mb-5">CONTACT</h2>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-purple-50 rounded-full text-purple-500 flex justify-center items-center">
                <BiPhoneCall size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] text-gray-500"> Mobile</span>
                <span className="text-sm text-black"> {userdata?.phone}</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full text-green-500 flex justify-center items-center">
              <BsArrowRight size={20} />
            </div>
            <div className="flex items-center flex-row-reverse gap-5">
              <div className="w-10 h-10 bg-red-50 rounded-full text-red-500 flex justify-center items-center">
                <MdOutlineMarkEmailUnread size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] text-gray-500">Email</span>
                <span className="text-sm text-black">{userdata?.email}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <h2 className="text-black font-semibold">BIODATA</h2>
          <p className="text-sm text-gray-500 mt-3">{userdata?.bio}</p>
        </div>
      </div>
    </Shadow>
  );
};
export const PostsGallaryComponent = () => {
  const dispatch = useDispatch();
  const { resources, isError, message } = useSelector((state) => state.resource);

  useEffect(() => {
    dispatch(getAllResourceCreatedByUser());

    if (isError) {
      toast.error(message);
    }
  }, [isError, message, dispatch]);
  return (
    <Shadow>
      <div className="p-4 post-list border border-gray-200 rounded-lg">
        <MasonryLayout columns={{ 640: 1, 768: 2, 1024: 3, 1280: 4 }} gap={20}>
          {resources.map((item) => (
            <div className="card" key={item._id}>
              <div className="img">
                <img src={item?.thumbnail?.filePath} alt={item.title} className="w-full h-full rounded-lg" />
              </div>
            </div>
          ))}
        </MasonryLayout>
      </div>
    </Shadow>
  );
};
export const FriendsComponent = () => {
  const dummyData = [];

  for (let id = 1; id <= 50; id++) {
    const name = `Name ${id}`;
    const position = `Web Designer ${id}`;
    const description = "Lorem ipsum dolor sit amet.";

    // Generate random width and height values between 300 and 800
    const width = Math.floor(Math.random() * 500) + 300;
    const height = Math.floor(Math.random() * 500) + 300;

    const cover = `https://source.unsplash.com/${width}x${height}/?portrait,people&${id}`;

    dummyData.push({
      id,
      name,
      position,
      description,
      cover,
    });
  }
  return (
    <Shadow>
      <div className="p-4 post-list grid grid-cols-4 gap-5">
        {dummyData.map((item) => (
          <div className="card p-5 py-8 border border-gray-200 rounded-lg flex text-center items-center justify-center flex-col">
            <div className="img w-16 h-16">
              <img src={item.cover} alt={item.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <h3 className=" mt-3 text-black font-semibold">{item.name}</h3>
            <span className="text-sm">{item.position}</span>
            <p className="text-[12px]">{item.description}</p>
          </div>
        ))}
      </div>
    </Shadow>
  );
};
export const FavoritListComponent = () => {
  const dispatch = useDispatch();
  const { favorites, isError, message } = useSelector((state) => state.favorite);

  useEffect(() => {
    dispatch(getFavoriteList());

    if (isError) {
      toast.error(message);
    }
  }, [isError, message, dispatch]);
  return (
    <Shadow>
      <div className="p-4 post-list border border-gray-200 rounded-lg">
        <MasonryLayout columns={{ 640: 1, 768: 2, 1024: 3, 1280: 4 }} gap={20}>
          {favorites.map((favorite) =>
            favorite.items.map((item) => (
              <div className="card" key={item._id}>
                <div className="img">
                  <img src={item?.thumbnail?.filePath} alt={item.title} className="w-full h-full rounded-lg" />
                </div>
                <h3 className="py-3 text-sm text-gray-500">{item.title}</h3>
                <h3 className="py-3 text-sm text-gray-500">{item._id}</h3>
              </div>
            ))
          )}
        </MasonryLayout>
      </div>
    </Shadow>
  );
};
export const UpdatePasswordComponent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialSate);

  const { isLoading, isSuccess, message, user } = useSelector((state) => state.auth);
  const { password, oldPassword, confirmPassword } = formData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !password || !confirmPassword) {
      return toast.error("All fields are required");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 8) {
      return toast.error("Password length should be 8 or more");
    }

    const userData = {
      oldPassword,
      password,
    };

    const emailData = {
      subject: "Password Change - GorkCoder",
      send_to: user.email,
      reply_to: "noreply@gorkcoder.com",
      template: "changePassword",
      url: "/forgot",
    };
    await dispatch(changePassword(userData));
    await dispatch(sendAutomatedEmail(emailData));
    await dispatch(logout());
    await dispatch(RESET());
  };

  useEffect(() => {
    if (isSuccess && message.includes("Password Change Successful")) {
      dispatch(logout());
      navigate("/login");
    }
  }, [dispatch, navigate, message, isSuccess]);

  return (
    <Shadow>
      <div className="p-4 border border-gray-200 rounded-lg">
        {isLoading && <Loader />}

        <form className="flex flex-col gap-5" onSubmit={handleUpdatePassword}>
          <InputPassword
            placeholder="Current Password"
            required
            name="oldPassword"
            value={oldPassword}
            onChange={handleInputChange}
          />

          <InputPassword
            placeholder="Password"
            required
            name="password"
            value={password}
            onChange={handleInputChange}
          />

          <InputPassword
            placeholder="Confirm Password"
            required
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleInputChange}
          />
          <Button type="submit" color="indigo" className="w-auto">
            Update Passowrd
          </Button>
        </form>
      </div>
    </Shadow>
  );
};
export const AccountSettingComponent = ({ userdata }) => {
  return (
    <Shadow>
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="">
          <h2 className="text-black font-semibold mb-5">ACCOUNT</h2>
          <div className="flex justify-between items-center">
            <div className="w-1/4 text-sm text-gray-500">User Name</div>
            <div className="w-3/4">
              <Input value={userdata.name} color="indigo" className="capitalize" />
            </div>
          </div>
          <div className="flex justify-between items-center my-5">
            <div className="w-1/4 text-sm text-gray-500">Email</div>
            <div className="w-3/4">
              <Input value={userdata.email} color="indigo" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="w-1/4 text-sm text-gray-500">Language</div>
            <div className="w-3/4">
              <Input value="English" color="indigo" />
            </div>
          </div>
          <div className="flex items-center my-5">
            <div className="w-1/4 text-sm text-gray-500">Verify</div>
            <div className="w-3/4">
              {userdata?.isVerified === true ? (
                <Radio name="type" color="indigo" />
              ) : (
                <Radio name="type" color="indigo" defaultChecked />
              )}
            </div>
          </div>
        </div>
      </div>
    </Shadow>
  );
};
