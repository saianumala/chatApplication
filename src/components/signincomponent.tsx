"use client";
import { SignInResponse, signIn, useSession } from "next-auth/react";
import Button from "./button";
import { userNameAtom, passwordAtom } from "@/recoil_store/src/atoms/userAtoms";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
// import { isLoggedInAtom } from "@repo/recoil_store/userAtom";
// import { useState } from "react";
import {
  errorMessageAtom,
  signinErrorMessageAtom,
} from "@/recoil_store/src/atoms/errorAtom";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SignInComponent() {
  const [email, setEmail] = useRecoilState(userNameAtom);
  const [password, setPassword] = useRecoilState(passwordAtom);
  const [signinError, setsigninError] = useRecoilState(signinErrorMessageAtom);
  const [errorMessage, setErrorMessage] = useState("invalid credentials");
  const router = useRouter();

  return (
    <>
      <form className="flex flex-col">
        {signinError ? (
          <h3 className="bg-red-600 shadow-md text-center rounded-md">
            {" "}
            Invalid Credentials!{" "}
          </h3>
        ) : (
          <h3 className="hidden"></h3>
        )}
        <div className=" flex flex-col  rounded-md m-1.5">
          <label className="p-2"> Email / number </label>
          <input
            className="flex-1 p-2 rounded-md text-lg outline-none text-black"
            type="text"
            onChange={(e) => {
              e.preventDefault();
              setEmail(e.target.value);
            }}
            placeholder="Email / number"
          />
        </div>
        <div className=" flex flex-col  rounded-md m-1.5">
          <label className="p-2"> Password: </label>
          <input
            className="p-2 flex-auto rounded-md text-lg text-black outline-none"
            type="password"
            onChange={(e) => {
              e.preventDefault();
              setPassword(e.target.value);
            }}
            placeholder="password"
          />
        </div>
        <div className="flex m-1.5">
          <Button
            title={"Login"}
            classname={
              "text-center flex-1 bg-black mt-1 p-2 rounded-md text-white"
            }
            onClick={async (e) => {
              e.preventDefault();
              console.log(email, password);
              const res = await signIn("credentials", {
                redirect: false,
                user: email,
                password: password,
              });

              if (res?.ok) {
                router.push(`${process.env.NEXTAUTH_URL}`);
              } else {
                setsigninError((prev) => !prev);

                console.log(res?.error);
              }
            }}
          />
        </div>
        <h1>
          don't have any account{" "}
          <button
            type="button"
            className="underline"
            onClick={() => router.push("/user/signup")}
          >
            signUp
          </button>
        </h1>
      </form>
    </>
  );
}

export default SignInComponent;
