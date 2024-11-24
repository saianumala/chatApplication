import { atom } from "recoil";

export const userNameAtom = atom({
  key: "userNameAtom",
  default: "",
});

export const passwordAtom = atom({
  key: "passwordAtom",
  default: "",
});

export const isLoggedInAtom = atom({
  key: "isLoggedInAtom",
  default: false,
});
