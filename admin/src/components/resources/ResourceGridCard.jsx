import React from "react";
import { Card, CardHeader, CardBody, Typography, Avatar } from "@material-tailwind/react";
import { AiFillDislike, AiFillEye, AiFillLike } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import { DateFormatter } from "../common/DateFormatter";

export const ResourceGridCard = ({ resource }) => {
  return (
    <>
      <Card className=" shadow-shadow1">
        <CardHeader floated={false} color="blue-gray">
          <div className="h-56">
            <img src={resource?.thumbnail?.filePath} alt="ui/ux review check" className="w-full h-full object-cover" />
          </div>
          <div className="to-bg-black-10 absolute inset-0 h-full w-full bg-gradient-to-tr from-transparent via-transparent to-black/60 " />
          <div className="flex items-center gap-2 !absolute top-4 right-4 rounded-full">
            <div className="flex items-center -space-x-5">
              <Avatar
                size="sm"
                variant="circular"
                alt="natali craig"
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1061&q=80"
                className="border-2 border-white hover:z-10"
              />
              <Avatar
                size="sm"
                variant="circular"
                alt="tania andrew"
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
                className="border-2 border-white hover:z-10"
              />
              <Avatar
                size="sm"
                variant="circular"
                alt="natali craig"
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1061&q=80"
                className="border-2 border-white hover:z-10"
              />
              <div className="relative">
                <div className="flex items-center justify-center cursor-pointer rounded-full bg-secondary text-white w-9 h-9 hover:z-10">
                  <AiFillEye size={22} />
                </div>
              </div>
            </div>
            <Typography className="font-normal"> {resource?.numOfViews}</Typography>
          </div>
          <div className="flex justify-between items-center rounded-full gap-3 !absolute bottom-4 left-4 backdrop-blur-lg bg-[rgba(0,0,0,0.2)] text-inherit">
            <div className="flex items-center justify-center gap-3">
              <button className="flex items-center justify-center cursor-pointer rounded-full border border-gray-900/5 bg-secondary w-10 h-10 text-white transition-colors ">
                <AiFillLike size={20} />
              </button>
              <div className="flex items-center justify-center cursor-pointer rounded-full border border-gray-900/5 bg-gray-900/5 w-10 h-10 text-inherit text-sm transition-colors ">
                {resource?.likedBy?.length}
              </div>
            </div>
            <BsDot />
            <div className="flex items-center justify-center flex-row-reverse gap-3">
              <button className="flex items-center justify-center cursor-pointer rounded-full border border-gray-900/5 bg-secondary w-10 h-10 text-white transition-colors ">
                <AiFillDislike size={22} />
              </button>
              <div className="flex items-center justify-center cursor-pointer rounded-full border border-gray-900/5 bg-gray-900/5 w-10 h-10 text-inherit text-sm  transition-colors ">
                {resource?.dislikedBy?.length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-3 flex items-center justify-between">
            <Typography variant="h5" color="blue-gray" className="font-medium">
              {resource?.title}
            </Typography>
          </div>
          <div className="flex items-center gap-5">
            <div>
              <Avatar variant="circular" alt={resource?.user?._id} src={resource?.user?.avatar?.filePath} />
            </div>
            <div>
              <Typography variant="h6" color="blue-gray">
                {resource?.user?.name}
              </Typography>
              <Typography variant="small" color="gray" className="font-normal">
                <DateFormatter date={resource?.createdAt} />
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
};
