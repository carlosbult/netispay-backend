import { IBase64Banesco } from 'src/interfaces/base64.interface';

export function base64Encode(data: IBase64Banesco) {
  const base = JSON.stringify(data, null, ' ');
  const buff = Buffer.from(base);
  const base64data = buff.toString('base64');
  return base64data;
}
