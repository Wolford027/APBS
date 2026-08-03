import axios from 'axios';

const LOCAL_API_BASE_URL = 'http://localhost:8800';
const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '');

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

