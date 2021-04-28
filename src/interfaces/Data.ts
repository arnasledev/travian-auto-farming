import type { ITimestamps, IHasId } from './General';

export interface IData extends ITimestamps, IHasId {
  name: string;
}
