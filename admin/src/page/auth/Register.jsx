import React, { useEffect, useState } from "react";
import { Button, Input, Typography } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import { AuthLoginLogo } from "./Login";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BsCheckAll } from "react-icons/bs";
import { toast } from "react-toastify";
import { validateEmail } from "../../redux/services/authService";
import { RESET, register, sendVerificationEmail } from "../../redux/slices/authSlice";
import { InputPassword, Loader } from "../../routers";

const initialSate = {
  name: "",
  password: "",
  email: "",
  confirmPassword: "",
};

export const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isLoggedIn } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(initialSate);
  const [upperCase, setUpperCase] = useState(false);
  const [number, setNumber] = useState(false);
  const [specialChar, setSpecialChar] = useState(false);
  const [passwordLength, setPasswordLength] = useState(false);

  const { name, password, email, confirmPassword } = formData;

  const wrongIcon = <BsCheckAll size={18} />;
  const checkIcon = <BsCheckAll size={18} className="text-green-500" />;

  const switchIcon = (condition) => {
    if (condition) {
      return checkIcon;
    }
    return wrongIcon;
  };

  useEffect(() => {
    //check lowercase and uppercase
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
      setUpperCase(true);
    } else {
      setUpperCase(false);
    }
    //check for number
    if (password.match(/([0-9])/)) {
      setNumber(true);
    } else {
      setNumber(false);
    }
    // Check for special character
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
      setSpecialChar(true);
    } else {
      setSpecialChar(false);
    }
    // Check for PASSWORD LENGTH
    if (password.length > 8) {
      setPasswordLength(true);
    } else {
      setPasswordLength(false);
    }
  }, [password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error("All fields are required");
    }
    if (password.length < 8) {
      return toast.error("Password length should be 8 or more");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (!validateEmail(email)) {
      return toast.error("Email is not valid");
    }
    const userData = {
      name,
      email,
      password,
    };
    await dispatch(register(userData));
    // add its in last
    await dispatch(sendVerificationEmail());
  };

  useEffect(() => {
    if (isSuccess && isLoggedIn) {
      navigate("/");
    }

    dispatch(RESET());
  }, [dispatch, isLoggedIn, isSuccess, navigate]);

  return (
    <>
      <section className="login h-[100vh] flex justify-between items-center  ">
        <div className="w-1/2 h-[88vh] m-auto bg-white rounded-lg flex justify-between items-center">
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
              Signup for Free
            </Typography>
            <Typography variant="small" className="font-normal text-gray-500 mb-5">
              Signin to create, discover and connect with the global community
            </Typography>
            {isLoading && <Loader />}
            <form onSubmit={registerUser}>
              <div className="input">
                <label htmlFor="email" className="text-sm">
                  Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="mt-1 !border !border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                  labelProps={{
                    className: "hidden",
                  }}
                  containerProps={{ className: "min-w-[100px]" }}
                />
              </div>
              <div className="input mt-5">
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
              <div className="input my-5">
                <label htmlFor="email" className="text-sm">
                  Confirm Password
                </label>
                <InputPassword
                  placeholder="Confirm Password"
                  required
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  /* onPaste={(e) => {
                    e.preventDefault();
                    toast.error("Cann't paste into input field");
                    return false;
                  }} */
                />
              </div>
              <ul className="box my-3 border border-indigo-300 p-3 rounded-lg">
                <li className={`text-[12px] ${upperCase ? "text-green-500" : "text-gray-500"} flex items-center gap-2`}>
                  {switchIcon(upperCase)}
                  Lowercase & Uppercase
                </li>
                <li className={`text-[12px] ${number ? "text-green-500" : "text-gray-500"} flex items-center gap-2`}>
                  {switchIcon(number)}
                  Number (0-9)
                </li>
                <li className={`text-[12px] ${specialChar ? "text-green-500" : "text-gray-500"} flex items-center gap-2`}>
                  {switchIcon(specialChar)}
                  Special Character (!@#$%^&*)
                </li>
                <li className={`text-[12px] ${passwordLength ? "text-green-500" : "text-gray-500"} flex items-center gap-2`}>
                  {switchIcon(passwordLength)}
                  At least 8 Character
                </li>
              </ul>

              <Button type="submit" className="w-full" color="indigo">
                Create Account
              </Button>
            </form>

            <div className="py-8">
              <Typography variant="small">
                Already have an account?
                <NavLink to="/login" className="capitalize text-secondary">
                  &nbsp; Sign In
                </NavLink>
              </Typography>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
