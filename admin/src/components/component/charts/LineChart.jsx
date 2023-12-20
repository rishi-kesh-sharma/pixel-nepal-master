import ReactApexChart from "react-apexcharts";
import { Shadow } from "../../design/Shadow";
import { Caption, TitleSm } from "../../design/Title";

export const LineChart = () => {
  const dataChart = {
    series: [
      {
        name: "Total Budget",
        data: [31, 40, 28, 51, 42, 80, 70, 80, 50, 30, 48, 50],
      },
      {
        name: "Amount Used",
        data: [11, 32, 45, 32, 34, 52, 41, 30, 50, 80, 30, 50],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
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
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "months",
        categories: ["JAN", "FEB", "MAR", "API", "MAY", "JUN", "JULY", "AUG", "SEP", "OCT", "NOV", "DEC"],
      },
      yaxis: {
        show: false,
      },
      tooltip: {
        x: {
          format: "MM",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-5 shadow-md">
      <TitleSm>Project Budget</TitleSm>
      <span className="text-s capitalize">The Project Budget is a tool used by project managers to estimate the total cost of a project</span>
      <ReactApexChart options={dataChart.options} series={dataChart.series} type="line" height={350} />
    </div>
  );
};

export const RadialBar = ({ data, title, caption }) => {
  const dataBar = {
    series: [data],
    options: {
      chart: {
        height: 250,
        type: "radialBar",
      },
      fill: {
        colors: ["#6259ca"],
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: "60%",
          },
          dataLabels: {
            show: true,
            style: {
              fontSize: "140px",
              fontWeight: "bold",
            },
            name: {
              show: false,
            },
            value: {
              fontSize: "20px",
              fontWeight: "bold",
            },
          },
        },
      },
    },
  };
  return (
    <div className="mt-8">
      <Shadow>
        <TitleSm> {title} </TitleSm>
        <Caption> {caption}</Caption>
        <ReactApexChart options={dataBar.options} series={dataBar.series} type="radialBar" height={250} />
      </Shadow>
    </div>
  );
};
