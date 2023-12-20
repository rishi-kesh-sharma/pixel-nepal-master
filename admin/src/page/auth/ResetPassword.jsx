import React, { useEffect, useState } from "react";
import { Button, Typography } from "@material-tailwind/react";
import { AuthLoginLogo } from "./Login";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { RESET, resetPassword } from "../../redux/slices/authSlice";
import { InputPassword, Loader } from "../../routers";

const initialState = {
  password: "",
  confirmPassword: "",
};

export const ResetPassword = () => {
  const [formData, setFormData] = useState(initialState);
  const { password, confirmPassword } = formData;
  const { resetToken } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isSuccess, message } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const reset = async (e) => {
    e.preventDefault();
    if (!confirmPassword || !password) {
      return toast.error("All fields are required");
    }
    if (password.length < 8) {
      return toast.error("Password length should be 8 or more");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const userData = {
      password,
    };

    await dispatch(resetPassword({ userData, resetToken }));
    await dispatch(RESET());
  };

  useEffect(() => {
    if (isSuccess && message.includes("Password Reset Successful")) {
      navigate("/login");
    }
  }, [dispatch, navigate, message, isSuccess]);

  return (
    <>
      <section className="login h-[100vh] flex justify-between items-center  ">
        <div className="w-1/2 h-[62vh] m-auto bg-white rounded-lg flex justify-between items-center">
          <div className="w-2/5 h-full bg-secondary rounded-l-lg p-5 flex items-center justify-center text-center gap-3 flex-col text-white">
            <AuthLoginLogo />
            <Typography variant="h6" className="font-normal">
              Reset Your Password
            </Typography>
            <Typography variant="small" className="font-normal text-gray-300">
              Signup to create, discover and connect with the global community
            </Typography>
          </div>
          <div className="w-3/5 p-5">
            <Typography variant="h6" className="font-normal">
              Reset Your Password
            </Typography>
            <Typography variant="small" className="font-normal text-gray-500 mb-5">
              It's free to signup and only takes a minute.
            </Typography>

            {isLoading && <Loader />}
            <form onSubmit={reset}>
              <div className="input">
                <label htmlFor="ConfirmPassword" className="text-sm">
                  Confirm Password
                </label>
                <InputPassword placeholder="Password" required name="password" value={password} onChange={handleInputChange} />
                <br />
              </div>
              <div className="input my-5">
                <label htmlFor="email" className="text-sm">
                  New Password
                </label>
                <InputPassword
                  placeholder="Confirm Password"
                  required
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  //onPaste={(e) => {
                  //  e.preventDefault()
                  //  toast.error("Cannot paste into input field")
                  //  return false
                  //}}
                />
              </div>

              <Button type="submit" className="w-full" color="indigo">
                Reset Password
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
