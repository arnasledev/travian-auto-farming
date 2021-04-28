import { User } from '../models';

export const printRandomUserData = async () => {
  const users = await User.findAll();
  const randomUser = users[Math.floor(Math.random() * users.length)];

  console.dir(await User.getWithRelations(randomUser.id), { depth: null });
};
