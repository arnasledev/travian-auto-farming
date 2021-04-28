import faker from 'faker';

import { IFarmList } from '../interfaces/FarmList';
import { Databases } from '../interfaces/General';

import Dates from './Dates';
import { orm } from './';

interface IUserClass {}

export default class FarmsList extends Dates implements IFarmList, IUserClass {
  constructor(
    public id: string = faker.datatype.uuid(),
    public name: string,
    public lastRaid: Date = null,
    public timeoutBetweenRaids: number,
    public timeRange: IFarmList['timeRange']
  ) {
    super();
  }

  static async create({
    name,
    timeoutBetweenRaids,
    timeRange,
  }: {
    name: string;
    timeoutBetweenRaids: number;
    timeRange: IFarmList['timeRange'];
  }) {
    const farmList = new this(undefined, name, null, timeoutBetweenRaids, timeRange);

    await orm.writeToDatabase(Databases.FARMS_LIST, [farmList]);
    return farmList;
  }

  static async findAll(): Promise<IFarmList[]> {
    const { farms_list } = await orm.readDatabase();

    return farms_list;
  }

  static async findById(id: string): Promise<IFarmList> {
    const { farms_list } = await orm.readDatabase();
    const farm = farms_list.find((farm) => farm.id === id);

    if (!farm) {
      throw new Error(`Farm by specified id ${id} was not found`);
    }

    return farm;
  }

  static async findByName(name: string): Promise<IFarmList> {
    const { farms_list } = await orm.readDatabase();
    const farm = farms_list.find((farm) => farm.name === name);

    if (!farm) {
      throw new Error(`Farm by specified name ${name} was not found`);
    }

    return farm;
  }
}
