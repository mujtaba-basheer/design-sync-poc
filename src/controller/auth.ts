import { RequestHandler } from "express";
import { query } from "../db";
import { LoginReqBody, SignupReqBody, UserEntity } from "../index.d";
import { comparePassword, hashPassword, signJwtToken } from "../utils";

export const signup: RequestHandler<any, any, SignupReqBody> = async (
  req,
  res
) => {
  try {
    const { email, password } = req.body;
    const selectRawQuery = `
    SELECT *
    FROM users
    WHERE email = $1
    LIMIT 1;
    `;
    const { rowCount } = await query(selectRawQuery, [email]);
    if (rowCount) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists!",
      });
    }

    const hashedPassword = await hashPassword(password);

    const insertRawQuery = `
    INSERT INTO users
    (email, password)
    VALUES ($1, $2)
    `;

    const insertResp = await query(insertRawQuery, [email, hashedPassword]);

    if (insertResp.rowCount === 1) {
      res.json({
        success: true,
        message: "Signed up successfully!",
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login: RequestHandler<any, any, LoginReqBody> = async (
  req,
  res
) => {
  try {
    const { email, password } = req.body;
    const selectRawQuery = `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1;
      `;
    const { rowCount, rows } = await query(selectRawQuery, [email]);
    if (rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user: UserEntity = rows[0];

    const { password: hashedPassword } = user;

    const isPasswordCorrect = await comparePassword(password, hashedPassword);

    if (isPasswordCorrect) {
      const jwtToken = signJwtToken({ email });

      return res.json({
        success: true,
        data: {
          jwtToken,
        },
      });
    }

    res.status(401).json({
      status: false,
      message: "Incorrect password",
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
