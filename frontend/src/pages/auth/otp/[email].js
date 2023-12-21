import { LoginWithOTP } from "@/routes";
import Head from "next/head";
import React from "react";

const loginwithotp = () => {
  return (
    <div className="overflow-x-hidden">
      <Head>
        <title>Login with OTP - Pixel Nepal </title>
      </Head>
      <LoginWithOTP cover="/images/auth/l10.jpg" />
    </div>
  );
};

export default loginwithotp;
