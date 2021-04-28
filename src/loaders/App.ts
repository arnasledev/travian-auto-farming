import bodyParser from 'body-parser';
import express from 'express';

import { orm } from '../models';
import Builder from '../controllers/Builder';

import type { IApp } from '../interfaces/App';
import Controller from '../interfaces/Controller';

export default class App implements IApp {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  public async listen() {
    this.app.listen(process.env.API_PORT || 3009, () => {
      console.log(`App listening on the port ${process.env.API_PORT || 3009}`);
    });
  }

  public async loadData() {
    orm.databaseInit();

    if (!orm.doesRecordsExists()) {
      console.log('database or users records does not exists, need to create new ones');

      const usersCount = 3;
      const builder = new Builder(usersCount);

      (async () => {
        await builder.makeDatabase();
      })();
    }
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  private initializeControllers(controllers: Controller[]) {
    this.app.get('/', (_, res) => res.send('Hello, the router is working'));

    controllers.forEach((controller) => {
      this.app.use(controller.router);
    });
  }
}
