import type { ITimestamps, IHasId } from './General';

export interface IFarmList extends ITimestamps, IHasId {
  name: string;
  lastRaid: Date;
  timeoutBetweenRaids: number;
  timeRange: {
    from: number;
    to: number;
  };
}
