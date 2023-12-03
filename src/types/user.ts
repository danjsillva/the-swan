export enum USER_ROLES {
  ADMIN = "ADMIN",
  USER = "USER",
}

export type IUser = {
  _id?: string;
  login: string;
  password?: string;
  role: USER_ROLES;
};
