import { Button, Typography } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { AuthLoginLogo } from "./Login";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RESET, loginWithCode, sendLoginCode } from "../../redux/slices/authSlice";
import { Loader } from "../../routers";

export const LoginWithOTP = () => {
  const [loginCode, setLoginCode] = useState("");
  const { email } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isSuccess, isLoggedIn } = useSelector((state) => state.auth);

  const senduserLoginCode = async () => {
    await dispatch(sendLoginCode(email));
    await dispatch(RESET());
  };

  const loginUserWithCode = async (e) => {
    e.preventDefault();
    if (loginCode === "") {
      return toast.error("Please enter OTP Code");
    }
    if (loginCode.length !== 6) {
      return toast.error("OTP code must be 6 characters");
    }

    const code = {
      loginCode,
    };
    await dispatch(loginWithCode({ code, email }));
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
        <div className="w-1/2 h-[52vh] m-auto bg-white rounded-lg flex justify-between items-center">
          <div className="w-2/5 h-full bg-secondary rounded-l-lg p-5 flex justify-center items-center text-center gap-3 flex-col text-white">
            <AuthLoginLogo />
            <Typography variant="h6" className="font-normal">
              Login With OTP Code
            </Typography>
            <Typography variant="small" className="font-normal text-gray-300">
              Signup to create, discover and connect with the global community
            </Typography>
          </div>
          <div className="w-3/5 p-5 pt-12">
            <Typography variant="h6" className="font-normal">
              Login With OTP Code
            </Typography>
            <Typography variant="small" className="font-normal text-gray-500 mb-5">
              Signin to create, discover and connect with the global community
            </Typography>

            {isLoading && <Loader />}
            <form onSubmit={loginUserWithCode}>
              <div className="input my-5 gap-4 flex justify-between">
                <input name="logincode" value={loginCode} onChange={(e) => setLoginCode(e.target.value)} type="text" className="border border-secondary p-2 rounded-md outline-none w-full text-center text-secondary text-xl font-semibold" />
              </div>
              <Button type="submit" className="w-full" color="indigo">
                Sign In
              </Button>
              <p onClick={senduserLoginCode} className="block my-4 text-indigo-500 cursor-pointer">
                Resend Code
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
