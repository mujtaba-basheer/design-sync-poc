export type FigmaAuthResponse = {
  user_id: number;
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type GetFigmaAccessCode = (code: string) => Promise<FigmaAuthResponse>;

export type GetFigmaFile = (
  token: string,
  key: string
) => Promise<FigmaGetFileResponse>;

export type GetFigmaFileComments = (
  token: string,
  key: string
) => Promise<FigmaGetFileCommentsResponse>;

export type SignupReqBody = {
  email: string;
  password: string;
};

export type LoginReqBody = {
  email: string;
  password: string;
};

export type UserEntity = {
  email: string;
  password: string;
  figma_user_id?: string;
};

export type UserDto = {
  email: string;
  figma_user_id?: string;
};

export type FigmaGetFileResponse = any;

export type FigmaGetFileCommentsResponse = any;

export type FigmaCredsEntity = {
  user_id: string;
  access_token: string;
  refresh_token: string;
};
