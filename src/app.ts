import 'dotenv/config';

import ValidateEnv from './utils/ValidateEnv';
import Users from './controllers/Users';
import App from './loaders/App';

ValidateEnv();

const app = new App([new Users()]);
app
  .listen()
  .then(() => app.loadData())
  .catch((error) => console.error(error));
