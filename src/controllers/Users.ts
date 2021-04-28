import { Request, Response, Router, Next } from 'express';

import { CustomerType } from '../interfaces/User';

import { orm, User } from '../models';

export default class Users {
  public path: string = '/users';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private allUsers(req: Request, res: Response) {
    const { users } = orm.readDatabase();
    const { limit, start } = req.query;

    return res.json({ count: users.length, users: start || limit ? users.slice(limit, start) : users });
  }

  private async oneUser(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const user = await User.getWithRelations(userId);
      return res.json({ user });
    } catch (e) {
      console.error(`Failed to get user with the following error: ${e.message}`);
      return res.status(404).send('User was not found');
    }
  }

  private async createUserMiddleware(req: Request, res: Response, next: Next) {
    const requiredFields = ['name', 'customerType'];
    const validCustomerTypes = Object.keys(CustomerType);

    try {
      const { body } = req;
      const sentFields = Object.keys(body);

      if (!requiredFields.every((value) => sentFields.includes(value))) {
        return res.status(406).send('You must define name and customer type when creating a user');
      }

      if (!validCustomerTypes.includes(body.customerType)) {
        return res
          .status(406)
          .send(`Defined customer type is invalid, the valid ones are: ${validCustomerTypes.toString()}`);
      }

      if (await User.doesUserExistsByName(body.name)) {
        return res.status(409).send(`User with the name ${body.name} already exists`);
      }
    } catch (e) {
      console.error(e.message);
      return res.status(422).send('Invalid request');
    }

    next();
  }

  private async createUser(req: Request, res: Response) {
    const { name, customerType } = req.body;
    const user = await User.create({ name, customerType });

    return res.json({ user });
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.allUsers);
    this.router.post(`${this.path}`, this.createUserMiddleware, this.createUser);

    this.router.get(`${this.path}/:userId`, this.oneUser);
  }
}
