import React, { useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input, Textarea } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { Loader } from "../../common/Loader";
import { Shadow } from "../../design/Shadow";

export const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, user } = useSelector((state) => state.auth);

  const initialState = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    role: user?.role || "",
    isVerified: user?.isVerified || false,
  };

  const [profile, setProfile] = useState(initialState);
  const [avatarImage, setAvatarImage] = useState("");

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };
  const handleImageChange = (e) => {
    setAvatarImage(e.target.files[0]);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", profile?.name);
      formData.append("phone", profile?.phone);
      formData.append("bio", profile?.bio);
      if (avatarImage) {
        formData.append("avatar", avatarImage);
      }

      dispatch(updateUserProfile(formData));

      navigate("/profile");
    } catch (error) {
      toast.error(error);
    }
  };

  useLayoutEffect(() => {
    if (user) {
      setProfile({
        ...profile,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        bio: user?.bio,
        photo: user?.photo,
        role: user?.role,
        isVerified: user?.isVerified,
      });
    }
  }, [user]);
  return (
    <Shadow>
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between">
          <div className="w-1/4">
            <label className="text-sm text-red-500">Email Address</label>
          </div>
          <div className=" w-3/4">
            <Input placeholder={profile.email} error disabled />
          </div>
        </div>
        <br />
        {isLoading && <Loader />}
        <form className="flex flex-col gap-5" onSubmit={saveProfile}>
          <div className="flex justify-between">
            <div className="w-1/4">
              <label className="text-gray-500 text-sm">Username</label>
            </div>
            <div className=" w-3/4">
              <Input placeholder={profile.name} onChange={handleInputChange} color="indigo" name="name" />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="w-1/4">
              <label className="text-gray-500 text-sm">Phone Number</label>
            </div>
            <div className=" w-3/4">
              <Input placeholder={profile.phone} onChange={handleInputChange} color="indigo" name="phone" />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="w-1/4">
              <label className="text-gray-500 text-sm">Bio</label>
            </div>
            <div className=" w-3/4">
              <Textarea placeholder={profile.bio} onChange={handleInputChange} color="indigo" name="bio" />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="w-1/4">
              <label className="text-gray-500 text-sm">Avatar</label>
            </div>
            <div className=" w-3/4">
              <Input type="file" color="indigo" onChange={handleImageChange} name="avatar" />
            </div>
          </div>
          <div className="w-1/4">
            <Button type="submit" color="indigo">
              Update Profile
            </Button>
          </div>
        </form>
      </div>
    </Shadow>
  );
};
