import { atom } from "recoil";

export const errorMessageAtom = atom({
  key: "errorMessageAtom",
  default: false,
});
export const signinErrorMessageAtom = atom({
  key: "signinErrorMessageAtom",
  default: false,
});
