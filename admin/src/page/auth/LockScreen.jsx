import React from "react";
import { Avatar, Button, Input, Typography } from "@material-tailwind/react";
import { AuthLoginLogo } from "./Login";

export const LockScreen = () => {
  return (
    <>
      <section className="login h-[100vh] flex justify-between items-center  ">
        <div className="w-1/2 h-[50vh] m-auto bg-white rounded-lg flex justify-between items-center">
          <div className="w-2/5 h-full bg-secondary rounded-l-lg p-5 flex items-center justify-center text-center gap-3 flex-col text-white">
            <AuthLoginLogo />
            <Typography variant="h6" className="font-normal">
              Unlock
            </Typography>
            <Typography variant="small" className="font-normal text-gray-300">
              Enter your password to access the admin.
            </Typography>
          </div>
          <div className="w-3/5 p-5 flex items-left flex-col">
            <Typography variant="h6" className="font-normal">
              Lockscreen
            </Typography>
            <Typography variant="small" className="font-normal text-gray-500 mb-5">
              Unlock your screen by entering password
            </Typography>

            <form>
              <div className="profile flex items-center gap-3">
                <Avatar size="lg" src="https://react.spruko.com/vue/spruha/preview/assets/1-81ab441a.jpg" />
                <span>SONIA TAYLOR</span>
              </div>
              <div className="input my-5">
                <Input
                  type="email"
                  placeholder="Enter your password"
                  className="mt-1 !border !border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                  labelProps={{
                    className: "hidden",
                  }}
                  containerProps={{ className: "min-w-[100px]" }}
                />
              </div>
              <Button className="w-full" color="indigo">
                Sign In
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
