import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import resourceService from "../../services/resources/resourceService";

const initialState = {
  resource: null,
  resources: [],
  likeResource: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const getAllResourceCreatedByUser = createAsyncThunk("resource/ofuser", async (_, thunkAPI) => {
  try {
    return await resourceService.getAllResourceCreatedByUser();
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getAllLikedAndDislikesResoucesByYou = createAsyncThunk(
  "auth/get-liked-and-disliked-resouces",
  async (_, thunkAPI) => {
    try {
      return await resourceService.getAllLikedAndDislikesResoucesByYou();
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllResourceCreatedByUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllResourceCreatedByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.resources = action.payload;
      })
      .addCase(getAllResourceCreatedByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload);
      })
      // Resource like by you
      .addCase(getAllLikedAndDislikesResoucesByYou.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllLikedAndDislikesResoucesByYou.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.likeResource = action.payload;
      })
      .addCase(getAllLikedAndDislikesResoucesByYou.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        toast.error(action.payload);
      });
  },
});

export const selectIsLoading = (state) => state.resource.isLoading;
export const selectresource = (state) => state.resource.resource;

export default resourceSlice.reducer;
