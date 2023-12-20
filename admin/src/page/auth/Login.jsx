import { Button, Input, Typography } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import LoginImg from "../../components/assest/images/auth/login.svg";
import logoImg from "../../components/assest/images/logo3.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { validateEmail } from "../../redux/services/authService";
import { RESET, login, sendLoginCode } from "../../redux/slices/authSlice";
import { InputPassword, Loader } from "../../routers";

const initialState = {
  password: "",
  email: "",
};

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);

  const { isLoading, isSuccess, isError, isLoggedIn, twoFactor, user } = useSelector((state) => state.auth);
  const { password, email } = formData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const loginUser = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("All fields are required");
    }
    if (!validateEmail(email)) {
      return toast.error("Email is not valid");
    }
    const userData = {
      email,
      password,
    };
    await dispatch(login(userData));
  };

  useEffect(() => {
    if (isSuccess && isLoggedIn && user?.role === "admin") {
      navigate("/");
      toast.success("Login Success");
    }
    // if (user?.role === "admin") {}
    /* else if (user?.role !== "admin" && !userNotAdminToastShown) {
        setFormData(initialState);
        setUserNotAdminToastShown(true);
      } */

    // login with otp
    if (isError && twoFactor) {
      dispatch(sendLoginCode(email));
      navigate(`/loginwithotp/${email}`);
    }
    // ---end here
    dispatch(RESET());
  }, [dispatch, isLoggedIn, email, isSuccess, navigate, isError, twoFactor, user?.role]);

  return (
    <>
      <section className="login h-[100vh] flex justify-between items-center  ">
        <div className="w-1/2 h-[52vh] m-auto bg-white rounded-lg flex justify-between items-center">
          <div className="w-2/5 h-full bg-secondary rounded-l-lg p-5 flex justify-center items-center text-center gap-3 flex-col text-white">
            <AuthLoginLogo />
            <Typography variant="h6" className="font-normal">
              Create Your Account
            </Typography>
            <Typography variant="small" className="font-normal text-gray-300">
              Signup to create, discover and connect with the global community
            </Typography>
          </div>
          <div className="w-3/5 p-5 pt-12">
            <Typography variant="h6" className="font-normal">
              Signin to Your Account
            </Typography>
            <Typography variant="small" className="font-normal text-gray-500 mb-5">
              Signin to create, discover and connect with the global community
            </Typography>
            {isLoading && <Loader />}
            <form onSubmit={loginUser}>
              <div className="input">
                <label htmlFor="email" className="text-sm">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="mt-1 !border !border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                  labelProps={{
                    className: "hidden",
                  }}
                  containerProps={{ className: "min-w-[100px]" }}
                />
              </div>
              <div className="input my-5">
                <label htmlFor="email" className="text-sm">
                  Password
                </label>
                <InputPassword placeholder="Password" required name="password" value={password} onChange={handleInputChange} />
              </div>
              <Button type="submit" className="w-full" color="indigo">
                Sign In
              </Button>
            </form>

            <div className="py-8">
              <NavLink to="/forgot-password" className="text-sm capitalize text-secondary">
                forgot password
              </NavLink>

              <Typography variant="small">
                Don't have an account?
                <NavLink to="/register" className="capitalize text-secondary">
                  &nbsp; Register Here
                </NavLink>
              </Typography>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const AuthLoginLogo = () => {
  return (
    <>
      <div className="flex justify-between items-center gap-2">
        <div className="h-10">
          <img src={logoImg} alt="logoImg" className="w-full h-full object-contain" />
        </div>
        <Typography variant="h4">Pixel Nepal</Typography>
      </div>
      <div className="h-28 my-8">
        <img src={LoginImg} alt="LoginImg" className="w-full h-full object-contain" />
      </div>
    </>
  );
};
