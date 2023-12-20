import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles/main.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getLogInStatus, getUserProfile, selectIsLoggedIn, selectUser } from "./redux/slices/authSlice";
import { useEffect } from "react";
import { Dashboard, ForgotPassword, Layout, LockScreen, Login, LoginWithOTP, Page404, Profile, Register, ResetPassword } from "./routers";

axios.defaults.withCredentials = true;

function App() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(getLogInStatus());
    if (isLoggedIn && user === null) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isLoggedIn, user]);
  return (
    <>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          {/* ------ Auth ----------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/resetpassword/:resetToken" element={<ResetPassword />} />
          <Route path="/loginwithotp/:email" element={<LoginWithOTP />} />
          <Route path="/lock-screen" element={<LockScreen />} />
          <Route path="/*" element={<Page404 />} />
          {/* ------ Auth ----------- */}

          {/* ------ Auth User  ----------- */}
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />

          {/* ------ Auth User  ----------- */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
