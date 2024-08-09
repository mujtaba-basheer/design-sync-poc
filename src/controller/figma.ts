import { RequestHandler } from "express";
import store from "../store";
import { config } from "dotenv";
import short from "short-uuid";
import {
  getFigmaAccessCode,
  getFigmaFile,
  getFigmaFileComments,
} from "../utils/figma";
import { query } from "../db";
import { FigmaAuthResponse, FigmaCredsEntity, UserDto } from "../index.d";
import client from "../store";
config();

export const getFile: RequestHandler = async (req, res) => {
  try {
    const { file_id } = req.query;
    if (!file_id) {
      return res.status(400).json({
        success: false,
        message: "param file_id missing!",
      });
    }

    // @ts-ignore
    const { email } = req.user as UserDto;

    const getUserRawQuery = `
    SELECT figma_user_id
    FROM users
    WHERE email = $1;
    `;
    const getUserQueryResp = await query(getUserRawQuery, [email]);
    const { figma_user_id } = getUserQueryResp.rows[0] as UserDto;

    if (figma_user_id) {
      const getFigmaCredsRawQuery = `
      SELECT *
      FROM figma_creds
      WHERE user_id = $1;
      `;

      const { rows } = await query(getFigmaCredsRawQuery, [figma_user_id]);
      const { access_token } = rows[0] as FigmaCredsEntity;

      const file = await getFigmaFile(access_token, file_id as string);
      res.json({
        success: true,
        data: file,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "You haven't connected your Figma account yet!",
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      error,
    });
  }
};

export const getFileComments: RequestHandler = async (req, res) => {
  try {
    const { file_id } = req.query;
    if (!file_id) {
      return res.status(400).json({
        success: false,
        message: "param file_id missing!",
      });
    }

    // @ts-ignore
    const { email } = req.user as UserDto;

    const getUserRawQuery = `
    SELECT figma_user_id
    FROM users
    WHERE email = $1;
    `;
    const getUserQueryResp = await query(getUserRawQuery, [email]);
    const { figma_user_id } = getUserQueryResp.rows[0] as UserDto;

    if (figma_user_id) {
      const getFigmaCredsRawQuery = `
      SELECT *
      FROM figma_creds
      WHERE user_id = $1;
      `;

      const { rows } = await query(getFigmaCredsRawQuery, [figma_user_id]);
      const { access_token } = rows[0] as FigmaCredsEntity;

      const comments = await getFigmaFileComments(
        access_token,
        file_id as string
      );
      res.json({
        success: true,
        data: comments,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "You haven't connected your Figma account yet!",
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      error,
    });
  }
};

export const getComments: RequestHandler = async (req, res) => {
  let authUrl = "https://www.figma.com/oauth?";

  const state = short.generate();
  await store.set(state, "");

  authUrl += `client_id=${process.env.FIGMA_CLIENT_ID}`;
  authUrl += `&redirect_uri=${encodeURIComponent(
    process.env.FIGMA_REDIRECT_URI as string
  )}`;
  authUrl += "&scope=files:read";
  authUrl += `&state=${encodeURIComponent(state)}`;
  authUrl += "&response_type=code";

  res.redirect(authUrl);
};

export const oauth2Callback: RequestHandler = async (req, resp) => {
  try {
    const { state, code } = req.query;

    // @ts-ignore
    const { email } = req.user as UserDto;

    const storedState = await store.get(`${email}:state`);
    if (storedState === null || storedState !== state) {
      resp.statusCode = 401;
      return resp.json({
        success: false,
        message: "Invalid URL",
      });
    }

    const accessCode: Awaited<FigmaAuthResponse> = await getFigmaAccessCode(
      code as string
    );
    const { user_id, refresh_token, access_token } = accessCode;

    const getRawQuery = `
    SELECT *
    FROM figma_creds
    WHERE user_id = $1;
    `;

    const { rowCount } = await query(getRawQuery, [user_id + ""]);
    if (rowCount) {
      const updateRawQuery = `
      UPDATE figma_creds
      SET access_token = $1, refresh_token = $2, updated_at = NOW()
      WHERE user_id = $3;
      `;

      await query(updateRawQuery, [access_token, refresh_token, user_id + ""]);
    } else {
      const insertFigmaCredsRawQuery = `
      INSERT INTO figma_creds
      (access_token, refresh_token, user_id)
      VALUES ($1, $2, $3);
      `;

      await query(insertFigmaCredsRawQuery, [
        access_token,
        refresh_token,
        user_id + "",
      ]);

      const updateFigmaUserIdRawQuery = `
      UPDATE users
      SET figma_user_id = $1
      WHERE email = $2;
      `;

      await query(updateFigmaUserIdRawQuery, [user_id, email]);
    }

    await client.del(`${email}:state`);

    resp.json({
      success: true,
      data: { user_id, email },
    });
  } catch (error) {
    resp.setHeader("Content-Type", "text/html");
    resp.send(error);
  }
};

export const authenticate: RequestHandler = async (req, res) => {
  // @ts-ignore
  const { email } = req.user as UserDto;

  let authUrl = "https://www.figma.com/oauth?";

  const state = short.generate();
  await store.set(`${email}:state`, state);

  authUrl += `client_id=${process.env.FIGMA_CLIENT_ID}`;
  authUrl += `&redirect_uri=${encodeURIComponent(
    process.env.FIGMA_REDIRECT_URI as string
  )}`;
  authUrl += "&scope=files:read";
  authUrl += `&state=${encodeURIComponent(state)}`;
  authUrl += "&response_type=code";

  res.json({
    success: true,
    data: { authUrl },
  });
};
