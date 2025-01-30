import { v4 as uuidv4 } from 'uuid';

export function generateUniqueId(lenght: number): string {
  const id = uuidv4().replace(/-/g, '').slice(0, lenght);
  return id;
}
