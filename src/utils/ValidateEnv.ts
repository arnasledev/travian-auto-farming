import { cleanEnv, port, str } from 'envalid';

export default () =>
  cleanEnv(process.env, {
    API_PORT: port(),
    AUTH_NAME: str(),
    AUTH_PASSWORD: str(),
  });
