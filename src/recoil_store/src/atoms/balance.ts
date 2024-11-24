import { atom } from "recoil";

export const amountAtom = atom<number>({
  key: "amountAtom",
  default: 0,
});

export const accountNumberAtom = atom<number>({
  key: "accountNumberAtom",
  default: 0,
});

export const balanceAtom = atom<number>({
  key: "balanceAtom",
  default: 0,
});
