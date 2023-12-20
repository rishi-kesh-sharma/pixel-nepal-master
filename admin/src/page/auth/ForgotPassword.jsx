import { Button, Input, Typography } from "@material-tailwind/react";
import React, { useState } from "react";
import { AuthLoginLogo } from "./Login";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { validateEmail } from "../../redux/services/authService";
import { RESET, forgotPassword } from "../../redux/slices/authSlice";
import { Loader } from "../../routers";

export const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState();

  const forgot = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error("Email field is required");
    }
    if (!validateEmail(email)) {
      return toast.error("Email is not valid");
    }

    const userData = {
      email,
    };

    await dispatch(forgotPassword(userData));
    await dispatch(RESET());
  };

  return (
    <>
      <section className="login h-[100vh] flex justify-between items-center  ">
        <div className="w-1/2 h-[52vh] m-auto bg-white rounded-lg flex justify-between items-center">
          <div className="w-2/5 h-full bg-secondary rounded-l-lg p-5 flex justify-center items-center text-center gap-3 flex-col text-white">
            <AuthLoginLogo />

            <Typography variant="h6" className="font-normal">
              Forgot Password
            </Typography>
            <Typography variant="small" className="font-normal text-gray-300">
              Signup to create, discover and connect with the global community
            </Typography>
          </div>
          <div className="w-3/5 p-5 pt-12">
            <Typography variant="h6" className="font-normal">
              Forgot Password
            </Typography>
            <Typography variant="small" className="font-normal text-gray-500 mb-5">
              Signin to create, discover and connect with the global community
            </Typography>

            {isLoading && <Loader />}
            <form onSubmit={forgot}>
              <div className="input">
                <label htmlFor="email" className="text-sm">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1 !border !border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                  labelProps={{
                    className: "hidden",
                  }}
                  containerProps={{ className: "min-w-[100px]" }}
                />
              </div>
              <br />
              <Button type="submit" className="w-full" color="indigo">
                Request reset link
              </Button>
            </form>
            <div className="py-8">
              <Typography variant="small">Did you remembered your password?</Typography>
              <br />
              <Typography variant="small">
                Try to
                <NavLink to="/login" className="capitalize text-secondary">
                  &nbsp; Signin
                </NavLink>
              </Typography>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
