import axios from "axios";

export const API_URL = `${process.env.REACT_APP_BACKEND_URL}/resource`;

//  created by user
const getAllResourceCreatedByUser = async () => {
  const response = await axios.get(API_URL + "/user/resource");
  return response.data;
};
const getAllLikedAndDislikesResoucesByYou = async () => {
  const response = await axios.get(API_URL + "/user/likes");
  return response.data;
};

const resourceService = {
  getAllResourceCreatedByUser,
  getAllLikedAndDislikesResoucesByYou,
};

export default resourceService;
