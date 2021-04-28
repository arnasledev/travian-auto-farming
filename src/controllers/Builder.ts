import type { IUser } from '../interfaces/User';

import { User} from '../models';

interface IBuilder {
  makeDatabase: () => void;
}

export default class Builder implements IBuilder {
  private users: IUser[] = [];

  constructor(
    private usersCount: number = 10,
  ) {}

  public async makeDatabase() {
    this.users = await this.makeUsers();
  }

  private async makeUsers() {
    console.log(`Making ${this.usersCount} users...`);
    return User.createBulk(this.usersCount);
  }
}
