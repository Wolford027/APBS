import axios from 'axios';

const LOCAL_API_BASE_URL = 'http://localhost:8800';
const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '');

if (process.env.NODE_ENV === 'production' && !configuredApiBaseUrl) {
  console.error('REACT_APP_API_BASE_URL is not set. Backend requests will still use localhost and fail in production.');
}

if (process.env.NODE_ENV === 'production' && configuredApiBaseUrl) {
  console.info(`Using backend API base URL: ${configuredApiBaseUrl}`);
}

axios.interceptors.request.use((config) => {
  if (
    configuredApiBaseUrl &&
    typeof config.url === 'string' &&
    config.url.startsWith(LOCAL_API_BASE_URL)
  ) {
    config.url = config.url.replace(LOCAL_API_BASE_URL, configuredApiBaseUrl);
  }

  return config;
});
