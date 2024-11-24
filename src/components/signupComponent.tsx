"use client";

import { useRouter } from "next/navigation";
import { errorMessageAtom } from "@/recoil_store/src/atoms/errorAtom";
import { useRecoilState } from "recoil";
import Button from "./button";
function SignUpComponent() {
  const [errorMessage, setErrorMessage] = useRecoilState(errorMessageAtom);

  const router = useRouter();
  async function handleOnSubmit(event: any) {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(formData);

    const response = await fetch("/api/signup", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      router.push("/user/signin");
    } else {
      const errorData = await response.json();
      console.log(errorData);
      setErrorMessage(errorData.message);
    }
  }

  return (
    <>
      {errorMessage && <h3 className="text-red-600">{errorMessage}</h3>}
      <form className="flex flex-col" onSubmit={handleOnSubmit}>
        <div className=" flex flex-col  rounded-md m-1.5">
          <label>Email:</label>
          <input
            className="flex-1 p-2 rounded-md text-lg outline-none text-black"
            name="email"
            type="email"
            placeholder="Email"
          />
        </div>
        <div className=" flex flex-col  rounded-md m-1.5">
          <label>Number:</label>
          <input
            className="flex-1 p-2 rounded-md text-lg outline-none text-black"
            name="number"
            type="text"
            placeholder="number"
          />
        </div>
        <div className=" flex flex-col  rounded-md m-1.5">
          <label>Password:</label>
          <input
            className="flex-1 p-2 rounded-md text-lg outline-none text-black"
            name="password"
            type="password"
            placeholder="Password"
          />
        </div>
        <div className="flex m-1.5">
          <Button
            type="submit"
            title={"signup"}
            classname={
              "text-center flex-1 bg-black mt-1 p-2 rounded-md text-white"
            }
            // onClick={()=>{}}
          />
        </div>
        <h1>
          have an account{" "}
          <button
            type="button"
            className="underline"
            onClick={() => router.push("/user/signin")}
          >
            singin
          </button>
        </h1>
      </form>
    </>
  );
}

export default SignUpComponent;
