import SignUpComponent from "@/components/signupComponent";

function SignUp() {
  return (
    <>
      <div className="flex justify-center flex-col  h-screen items-center bg-gray-200">
        <div className="w-3/4 sm:w-3/4 lg:w-2/4 xl:w-2/5 transition-all p-4  bg-slate-800 text-white shadow-lg rounded-lg shadow-slate-800">
          <SignUpComponent />
        </div>
      </div>
    </>
  );
}
export default SignUp;
