import axios from 'axios';

let baseDomain;

if (process.env.PORT) {
  baseDomain = 'http://localhost:' + process.env.PORT;
} else {
  baseDomain = location.protocol + '//' + location.host;
}
  
const baseURL = `${baseDomain}/backend/`;

const axiosInstance = axios.create({
  baseURL
});

axios.interceptors.response.use((response) => {
  return response;
}, function (error) {
  return Promise.reject(error.response);
});

export default axiosInstance;
