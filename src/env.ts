import dotenv from 'dotenv';

dotenv.config();

const _ID = process.env.ID;
const _PASSWORD = process.env.PASSWORD;

if (typeof _ID === 'undefined' || typeof _PASSWORD === 'undefined') {
  throw new TypeError(`ID and PASSWORD have to both exist in .env file`);
}

export const ID = _ID;
export const PASSWORD = _PASSWORD;
