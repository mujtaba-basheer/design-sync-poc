import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { config } from "dotenv";
import { UserDto } from "../index.d";
config();

export const authHandler: RequestHandler = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer ")) {
      const [, token] = authorization.split(" ");
      const payload = verify(
        token,
        process.env.JWT_SECRET as string
      ) as UserDto;
      // @ts-ignore
      req.user = payload;

      next();
    } else
      res.status(401).json({
        success: false,
        message: "Unauthorized!",
      });
  } catch (error) {
    return res.json({
      status: false,
      message: "Invalid token!",
    });
  }
};
