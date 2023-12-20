import React, { useEffect } from "react";
import { ResourceGridCard } from "../../resources/ResourceGridCard";
import { useDispatch, useSelector } from "react-redux";
import { getAllLikedAndDislikesResoucesByYou } from "../../../redux/slices/resources/resourceSlice";
import { toast } from "react-toastify";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { Shadow } from "../../design/Shadow";
import { SlDislike, SlLike } from "react-icons/sl";
import { FiAlertOctagon } from "react-icons/fi";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export const LikeAndDislikeComponent = () => {
  const dispatch = useDispatch();
  const { likeResource, isError, message } = useSelector((state) => state.resource);

  console.log(likeResource);
  console.log(likeResource.likedResources?.length);
  console.log(likeResource.dislikedResources?.length);
  useEffect(() => {
    dispatch(getAllLikedAndDislikesResoucesByYou());

    if (isError) {
      toast.error(message);
    }
  }, [isError, message, dispatch]);
  return (
    <>
      {likeResource?.likedResources?.length === 0 ? (
        <Shadow>
          <Typography>No liked resources </Typography>
        </Shadow>
      ) : (
        <>
          <div className="h-[68vh] mb-8">
            <div className="bg-white shadow-lg rounded-xl p-3">
              <Typography variant="h5" className="text-lg font-normal text-black capitalize flex items-center gap-3">
                <IconButton color="green" className="rounded-full">
                  <SlLike size={23} />
                </IconButton>
                resources
              </Typography>
            </div>

            <div className="grid grid-cols-3 gap-5 my-5">
              {likeResource?.likedResources?.map((resource) => (
                <ResourceGridCard resource={resource} />
              ))}
            </div>
            <DefaultPagination />
          </div>
        </>
      )}

      {likeResource?.dislikedResources?.length === 0 ? (
        <div className="bg-white shadow-lg rounded-xl p-3">
          <Typography variant="h5" className="text-lg font-normal text-black capitalize flex items-center gap-3">
            <IconButton color="red" className="rounded-full">
              <FiAlertOctagon size={23} />
            </IconButton>
            No disliked Resources Found!
          </Typography>
        </div>
      ) : (
        <div className="h-[100vh]">
          <div className="bg-white shadow-lg rounded-xl p-3">
            <Typography variant="h5" className="text-lg font-normal text-black capitalize flex items-center gap-3">
              <IconButton color="red" className="rounded-full">
                <SlDislike size={23} />
              </IconButton>
              resources
            </Typography>
          </div>
          <div className="grid grid-cols-3 gap-5 my-5">
            {likeResource?.dislikedResources?.map((resource) => (
              <ResourceGridCard resource={resource} />
            ))}
          </div>
          <DefaultPagination />
        </div>
      )}
    </>
  );
};

export function DefaultPagination() {
  return (
    <div className="flex justify-center items-center gap-4">
      <Button color="indigo" className="flex items-center gap-2">
        <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" /> Previous
      </Button>
      <div className="flex items-center gap-2">
        <IconButton color="indigo">1</IconButton>
        <IconButton color="indigo">2</IconButton>
        <IconButton color="indigo">3</IconButton>
        <IconButton color="indigo">4</IconButton>
        <IconButton color="indigo">5</IconButton>
      </div>
      <Button color="indigo" className="flex items-center gap-2">
        Next
        <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
      </Button>
    </div>
  );
}
