"use client";
import Link from "next/link";

function MenuItem({
  className,
  name,
  svg,
  route,
}: {
  className: string;
  name: string;
  svg: any;
  route: string;
}) {
  return (
    <>
      <Link className={className} href={route}>
        <div>{svg}</div>
        <div>{name}</div>
      </Link>
    </>
  );
}
export default MenuItem;
