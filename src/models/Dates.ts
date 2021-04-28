import type { ITimestamps } from '../interfaces/General';

export default class Dates implements ITimestamps {
  constructor(
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null
  ) {}
}
