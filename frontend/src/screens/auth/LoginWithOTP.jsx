import { RESET, loginWithCode, sendLoginCode } from "@/redux/slices/authSlice";
import { Loader, LogoComponent } from "@/routes";
import { Input } from "@material-tailwind/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const LoginWithOTP = ({ cover }) => {
  const router = useRouter();
  const { email } = router.query;
  const dispatch = useDispatch();
  const navigate = useRouter();

  const [loginCode, setLoginCode] = useState("");

  const { isLoading, isSuccess, isLoggedIn } = useSelector(
    (state) => state.auth
  );

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
      navigate.push("/");
    }
    dispatch(RESET());
  }, [dispatch, isLoggedIn, isSuccess, navigate]);

  return (
    <>
      <div className="login h-[100vh] mt-[3rem]">
        <div className="flex w-full justify-center items-center h-full md:gap-[2rem]">
          <div className="left md:w-1/2 lg:w-2/3">
            <div className="w-full hidden md:block pl-[1rem]">
              <img src={cover} alt="cover" className=" w-full  object-cover" />
            </div>
          </div>
          <div className="right md:w-1/2 lg:w-1/3  md:py-10 md:px-[1rem]">
            <div className="w-full h-full flex justify-center items-center flex-col">
              <div className="text-center">
                <LogoComponent />
              </div>
              <h3 className="text-lg text-center mt-12 font-medium">
                Login with OTP
              </h3>
              {isLoading && <Loader />}
              <form
                onSubmit={loginUserWithCode}
                className="flex flex-col gap-5 my-5 w-full">
                <Input
                  name="logincode"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  label="Enter OTP"
                  color="red"
                  size="lg"
                />
                <button type="submit" className="primary-btn rounded-lg">
                  Login
                </button>
                <p
                  onClick={senduserLoginCode}
                  className="block my-4 text-indigo-500 cursor-pointer">
                  Resend Code
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
