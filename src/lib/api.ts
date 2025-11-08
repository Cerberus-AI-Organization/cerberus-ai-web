
const isDev = import.meta.env.DEV;

let url:string = import.meta.env.CERBERUS_API_URL || "";

if (!isDev) {
  url = window.APP_CONFIG.API_URL;
  console.log("Running in production mode with API_URL: [", url, "]");
} else {
  console.log("Running in development mode with API_URL: [", url, "]");
}

export const API_URL = url;

if (!API_URL) throw new Error("API_URL is not defined");