import * as https from "node:https";
import { config } from "dotenv";
import { stringify } from "node:querystring";
import {
  FigmaAuthResponse,
  FigmaGetFileResponse,
  GetFigmaAccessCode,
  GetFigmaFile,
  GetFigmaFileComments,
} from "../index.d";
config();

export const getFigmaAccessCode: GetFigmaAccessCode = async (code) => {
  const body = {
    client_id: process.env.FIGMA_CLIENT_ID,
    client_secret: process.env.FIGMA_CLIENT_SECRET,
    redirect_uri: process.env.FIGMA_REDIRECT_URI,
    code,
    grant_type: "authorization_code",
  };

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "www.figma.com",
        path: "/api/oauth/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      (resp) => {
        let chunks: Buffer[] = [];

        resp.on("data", function (chunk) {
          chunks.push(chunk);
        });

        resp.on("end", function () {
          const body = Buffer.concat(chunks);
          if (resp.statusCode === 200)
            resolve(
              JSON.parse(body.toString()) as unknown as FigmaAuthResponse
            );
          else reject(body);
        });

        resp.on("error", reject);
      }
    );

    req.write(stringify(body));
    req.end();
  });
};

export const getFigmaFile: GetFigmaFile = async (
  token: string,
  key: string
) => {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.figma.com",
        path: `/v1/files/${key}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (resp) => {
        let chunks: Buffer[] = [];

        resp.on("data", function (chunk) {
          chunks.push(chunk);
        });

        resp.on("end", function () {
          const body = Buffer.concat(chunks);
          if (resp.statusCode === 200)
            resolve(
              JSON.parse(body.toString()) as unknown as FigmaGetFileResponse
            );
          else reject(JSON.parse(body.toString()));
        });

        resp.on("error", reject);
      }
    );

    req.end();
  });
};

export const getFigmaFileComments: GetFigmaFileComments = async (
  token: string,
  key: string
) => {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.figma.com",
        path: `/v1/files/${key}/comments`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (resp) => {
        let chunks: Buffer[] = [];

        resp.on("data", function (chunk) {
          chunks.push(chunk);
        });

        resp.on("end", function () {
          const body = Buffer.concat(chunks);
          if (resp.statusCode === 200)
            resolve(
              JSON.parse(body.toString()) as unknown as FigmaGetFileResponse
            );
          else reject(JSON.parse(body.toString()));
        });

        resp.on("error", reject);
      }
    );

    req.end();
  });
};
