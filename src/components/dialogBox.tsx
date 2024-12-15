import { useSession } from "next-auth/react";
import { MutableRefObject, ReactNode, useRef } from "react";

export function DialogBox({
  children,
  dialogRef,
}: {
  children: ReactNode;
  dialogRef: MutableRefObject<HTMLDialogElement | null>;
}) {
  const { data: session } = useSession();
  // const dialogRef = useRef<HTMLDialogElement|null>(null)
  return (
    <dialog
      className="backdrop:black/50 bg-slate-700 -translate-x-[50%] -translate-y-[50%] top-2/4 left-2/4 text-white  w-4/6 h-4/6"
      ref={dialogRef}
    >
      {children}
    </dialog>
  );
}
