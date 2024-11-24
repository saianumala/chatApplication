"use client";
import React from "react";
import Link from "next/link";

import { useSession } from "next-auth/react";

const NavBar = () => {
  const { data: session, status } = useSession();

  return (
    <>
      <nav>
        <div className="flex justify-between border-red-900 border-solid border-2">
          <div className="m-2 p-2">
            <Link
              className="p-3 m-1 hover:bg-gray-800 rounded-md text-white bg-gray-700"
              href={"#"}
            >
              Wallet
            </Link>
          </div>

          {session ? (
            <>
              <div className="m-2 p-2">
                <Link
                  className="p-3 m-1  hover:bg-gray-800  rounded-md text-white bg-gray-700"
                  href={"/dashboard"}
                >
                  Dashboard
                </Link>
              </div>
              <div className="m-2 p-2">
                <Link
                  className="p-3 m-1  hover:bg-gray-800  rounded-md text-white bg-gray-700"
                  href={"/api/auth/signout"}
                >
                  SignOut
                </Link>
              </div>
            </>
          ) : (
            <div className="m-2 p-2">
              <Link
                className="p-3 m-1  hover:bg-gray-800  rounded-md text-white bg-gray-700"
                href={"/user/signin"}
              >
                SignIn
              </Link>

              <Link
                className="p-3 m-1  hover:bg-gray-800  rounded-md text-white bg-gray-700"
                href={"/signup"}
              >
                SignUp
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
