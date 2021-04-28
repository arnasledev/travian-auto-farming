import fs from 'fs';
import path from 'path';

import type { Databases } from '../interfaces/General';
import type { IFarmList } from '../interfaces/FarmList';
import type { IData } from '../interfaces/Data';

import FarmList from './FarmList';

const databasePath = path.resolve(`${__dirname}/../../database.json`);

const databaseInit = () => {
  if (!fs.existsSync(databasePath)) {
    const database = { farms_list: [], data: [] };

    fs.writeFileSync(databasePath, JSON.stringify(database));
    console.log('Database was created');
  }
};

const readDatabase = () => {
  if (!fs.existsSync(databasePath)) {
    throw new Error('Database does not exists');
  }

  const data = fs.readFileSync(databasePath, 'utf8');
  return JSON.parse(data);
};

const writeToDatabase = async (database: Databases, data: IFarmList[] | IData[]) => {
  const dbData = readDatabase();

  return fs.writeFileSync(
    databasePath,
    JSON.stringify({
      ...dbData,
      [database]: [...dbData[database], ...data],
    })
  );
};

const doesRecordsExists = (): boolean => {
  let database;

  try {
    database = readDatabase();
  } catch (e) {
    return false;
  }

  if (!database.farms_list.length) {
    return false;
  }

  return true;
};

const orm = {
  databaseInit,
  databasePath,
  writeToDatabase,
  readDatabase,
  doesRecordsExists,
};

export { orm, FarmList };
