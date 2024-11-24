"use client";
import React from "react";

interface ButtonProps {
  type?: "submit" | "reset" | "button";
  classname?: any;
  title: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Button({
  title,
  onClick,
  classname,
  type = "button",
}: ButtonProps) {
  return (
    <>
      <button type={type} className={classname} onClick={onClick}>
        {title}
      </button>
    </>
  );
}
