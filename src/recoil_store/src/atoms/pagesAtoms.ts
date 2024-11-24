import { atom } from "recoil";

const pageAtom = atom({
  key: "pageAtom",
  default: "Home",
});
export { pageAtom };
