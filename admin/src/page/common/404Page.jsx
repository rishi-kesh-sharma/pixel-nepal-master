import { Button, Typography } from "@material-tailwind/react";
import React from "react";
import { NavLink } from "react-router-dom";

export const Page404 = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center text-center h-[100vh] w-full bg-secondary text-white">
        <Typography variant="h1" className="text-[150px]">
          404
        </Typography>
        <Typography variant="h2">Oops.The Page you are looking for doesn't exit..</Typography>
        <Typography>You may have mistyped the address or the page may have moved. Try searching below.</Typography>
        <br />
        <NavLink to="/">
          <Button color="light-gray">Back to Home</Button>
        </NavLink>
      </div>
    </>
  );
};
