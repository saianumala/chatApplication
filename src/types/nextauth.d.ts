import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    email?: string;
    name?: string;
    mobileNumber?: string;
  }
  interface Session {
    token: any;
    user: {
      email?: string;
      name?: string;
      userId?: string;
      mobileNumber?: string;
    } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    mobileNumber?: string;
  }
}
