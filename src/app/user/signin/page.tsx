"use client";
import SignInComponent from "@/components/signincomponent";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const { data: session } = useSession();
  console.log(session);
  const router = useRouter();
  useEffect(() => {
    console.log(session);
    if (session) {
      router.push(`/`);
    }
  }, [session]);

  return (
    <>
      <div className="flex justify-center flex-col  h-screen items-center bg-gray-200">
        <div className="w-3/4 sm:w-3/4 lg:w-2/4 xl:w-2/5 h-1/2 transition-all p-4  bg-slate-800 text-white shadow-lg rounded-lg shadow-slate-800">
          <SignInComponent />
        </div>
      </div>
    </>
  );
}
