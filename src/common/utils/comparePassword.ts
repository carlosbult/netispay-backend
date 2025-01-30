import * as bcrypt from 'bcrypt';

export async function comparePassword(data: {
  password: string;
  hashedPassword: string;
}) {
  return await bcrypt.compare(data.password, data.hashedPassword);
}
