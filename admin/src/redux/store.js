import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import emailReducer from "./slices/emailSlice";
import resourceReducer from "./slices/resources/resourceSlice";
import favoriteReducer from "./slices/favoriteSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    email: emailReducer,
    resource: resourceReducer,
    favorite: favoriteReducer,
  },
});
