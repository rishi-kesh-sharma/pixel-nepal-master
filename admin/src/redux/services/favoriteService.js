import axios from "axios";

export const API_URL = `${process.env.REACT_APP_BACKEND_URL}/favorite/`;

//  for specific user
const getFavoriteList = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const favoriteService = {
  getFavoriteList,
};

export default favoriteService;
