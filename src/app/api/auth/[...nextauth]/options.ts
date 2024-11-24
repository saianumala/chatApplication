import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/db/prisma";
import bcryptjs from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Login",
      credentials: {
        user: {
          label: "email/Number",
          placeholder: "email or number",
          type: "text",
        },

        password: {
          label: "Password",
          placeholder: "***********",
          type: "password",
        },
      },
      async authorize(credentials): Promise<any> {
        try {
          console.log(credentials?.user, credentials?.password);
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                {
                  email: credentials?.user,
                },
                {
                  mobileNumber: credentials?.user,
                },
              ],
            },
          });
          if (!existingUser) {
            console.log("please register");
            throw new Error("please register");
          }
          const passwordCheck = await bcryptjs.compare(
            credentials?.password!,
            existingUser.password!
          );
          console.log("password check", passwordCheck);

          if (!passwordCheck) {
            throw new Error("password is not valid");
          }

          interface userInterface {
            email: string;
            id: string;
            mobileNumber: string;
          }
          const user: userInterface = {
            email: existingUser.email,
            id: existingUser.id,
            mobileNumber: existingUser.mobileNumber,
          };
          console.log(user);
          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  secret: "process.env.NEXTAUTH_SECRET",
  session: {
    strategy: "jwt",
    maxAge: 1 * 60 * 1000,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.mobileNumber = user.mobileNumber;
      }

      return token;
    },
    async session({ session, token }) {
      if (session && session.user) {
        // session.user.userId = user.id;
        session.user.userId = token.userId;
        session.user.mobileNumber = token.mobileNumber;
      }

      return session;
    },
  },
  pages: {
    signIn: "/user/signin",
  },
};
