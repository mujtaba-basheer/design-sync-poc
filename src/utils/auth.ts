import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { sign } from "jsonwebtoken";
import { UserDto } from "../index.d";

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");

  return new Promise((resolve, reject) => {
    scrypt(password, salt, 16, (err, buff) => {
      if (err) return reject(err);
      resolve(`${buff.toString("hex")}.${salt}`);
    });
  });
};

export const comparePassword = (password: string, storedPassword: string) => {
  const [hashedPassword, salt] = storedPassword.split(".");

  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");

  return new Promise((resolve, reject) => {
    scrypt(password, salt, 16, (err, buff) => {
      if (err) return reject(err);
      resolve(timingSafeEqual(hashedPasswordBuf, buff));
    });
  });
};

export const signJwtToken = (payload: UserDto) => {
  return sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: Math.floor(Date.now() / 1000) + 60 * 60,
  });
};
