import http from "k6/http";
import { Options } from "k6/options";
import { check, sleep } from "k6";

const baseUrl = __ENV.ESTIMATOR_CDB_BASE_URL ?? "";

if (!baseUrl) {
  throw new Error("Base URL is not defined. Please set the ESTIMATOR_CDB_BASE_URL environment variable.");
}

// Define test options
export let options: Options = {
  scenarios: {
    ramping: {
      executor: "ramping-arrival-rate",
      maxVUs: 125,
      preAllocatedVUs: 5,
      stages: [
        { duration: "5m", target: 100 }, // Ramp up
        { duration: "4m", target: 100 }, // Stay
        { duration: "1m", target: 0 }, // Ramp down
      ],
    },
  },
};

export default function () {
  const res = http.get(`${baseUrl}/en`);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "body contains title": (r) => {
      if (typeof r.body === "string") {
        return r.body.includes("Canada Disability Benefit Estimator");
      }
      return false; // Return false if body is not a string
    },
  });

  sleep(1); // Simulate user think time
}
