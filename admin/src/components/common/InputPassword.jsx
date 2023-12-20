import { Input } from "@material-tailwind/react";
import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export const InputPassword = ({ fieldName, value, name, onChange, onPaste, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div>
      <div className="input">
        <label className="block my-2 text-sm font-medium text-gray-900">{fieldName}</label>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={value}
            name={name}
            onChange={onChange}
            onPaste={onPaste}
            placeholder={placeholder}
            className="mt-1 !border !border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
            labelProps={{
              className: "hidden",
            }}
            containerProps={{ className: "min-w-[100px]" }}
          />
          <div className="icon text-gray-500 absolute top-3 right-3 cursor-pointer" onClick={togglePassword}>
            {showPassword ? <AiFillEyeInvisible size={25} /> : <AiFillEye size={25} />}
          </div>
        </div>
      </div>
    </div>
  );
};
