"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function SignOut() {
  const router = useRouter();
  const { data: session, status } = useSession();
  if (status === "unauthenticated") {
    router.push("/user/signin");
  } else {
    return (
      <div className="flex justify-center flex-col  h-screen items-center bg-gray-200">
        <div className="flex flex-col justify-center items-center w-1/4 h-1/4 p-4  bg-slate-800 text-white shadow-lg rounded-lg shadow-slate-800">
          <h1>are you sure, you want to signOut</h1>
          <div className="flex w-full justify-between gap-4">
            <button
              className="bg-slate-400 w-2/4 hover:scale-105 active:scale-95"
              onClick={async () => {
                await signOut();
              }}
            >
              yes
            </button>
            <button
              className="bg-slate-400 w-2/4 hover:scale-105 active:scale-95"
              onClick={() => {
                router.push("/");
              }}
            >
              no
            </button>
          </div>
        </div>
      </div>
    );
  }
}
