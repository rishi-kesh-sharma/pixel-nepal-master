import { Avatar } from "@material-tailwind/react";
import React from "react";
import ReactApexChart from "react-apexcharts";
import { VscPreview } from "react-icons/vsc";
import dasImg from "../../components/assest/images/work3.png";
import { Shadow } from "../../components/design/Shadow";
import { Caption, CardSm, Description, LineChart, RadialBar, TitleMd, TitleS, TitleSm } from "../../routers";
const imgSrc = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80";

export const Dashboard = () => {
  return (
    <>
      <section className="dashboard">
        <div className="containers">
          <TitleMd>Welcome to Dashboard</TitleMd>
          <div className="flex justify-between mt-8 w-full">
            <div className="w-2/3">
              <HomeImg />
              <div className="grid grid-cols-3 gap-5 my-8">
                <CardSm title="Total revenue" caption="previous months vs this months" total="$5,900" subtitle="55% Higher" icon={<VscPreview size={22} />} />
                <CardSm title="Total revenue" caption="previous months vs this months" total="$5,900" subtitle="55% Higher" icon={<VscPreview size={22} />} />
                <CardSm title="Total revenue" caption="previous months vs this months" total="$5,900" subtitle="55% Higher" icon={<VscPreview size={22} />} />
              </div>
              <LineChart />
              <div className="grid grid-cols-2 gap-5">
                <RadialBar title="Total Reservations" caption="Projects where development work is on completion" data={70} />
                <RadialBar title="Pending Reservations" caption="Projects where development work is on completion" data={50} />
              </div>
            </div>
            <div className="w-1/3 ml-8">
              <RecentUser />
              <TotalRoom />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const HomeImg = () => {
  return (
    <div className="bg-secondary rounded-lg flex items-center shadow-md drop-shadow-md">
      <img src={dasImg} alt="dasImg" />
      <div className="text p-6">
        <h1 className="text-xl font-medium text-white">Sunil BK</h1>
        <p className="text-s mt-2 leading-5">You have two projects to finish, you had completed from your montly level, Keep going to your level </p>
      </div>
    </div>
  );
};

export const RecentUser = () => {
  return (
    <Shadow>
      <TitleSm>Recent guest </TitleSm>
      <Caption>Projects where development work is on completion</Caption>
      <UserProfile />
      <UserProfile />
      <UserProfile />
      <UserProfile />
    </Shadow>
  );
};

export const UserProfile = () => {
  return (
    <>
      <div className="mt-5 flex items-center justify-between mb-3">
        <Avatar src={imgSrc} alt="avatar" variant="circular" />
        <div>
          <TitleS>Flicker</TitleS>
          <Description>App Development</Description>
        </div>
        <Caption>4 Apr 2023</Caption>
      </div>
    </>
  );
};

export const TotalRoom = () => {
  const dataLine = {
    series: [
      {
        name: "Room",
        data: [5, 10, 15, 8],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      grid: {
        show: false,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      fill: {
        colors: ["#6259ca"],
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          columnWidth: "20%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: {
        show: false,
      },
      xaxis: {
        categories: [["Clean"], ["Dirty"], ["Maintenance", "Block"], ["Occupied"]],
      },
    },
  };

  return (
    <div className="mt-8">
      <Shadow>
        <TitleSm>room count </TitleSm>
        <Caption>Projects where development work is on completion</Caption>
        <ReactApexChart options={dataLine.options} series={dataLine.series} type="bar" height={250} />
      </Shadow>
    </div>
  );
};
