export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface IHasId {
  id: string;
}

export enum Databases {
  FARMS_LIST = 'farms_list',
  DATA = 'data',
}
