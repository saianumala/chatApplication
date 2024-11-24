import React, { ReactNode } from "react";
interface CardProps {
  className?: string;
  title: string;
  children: ReactNode;
}

const Card = ({ className, title, children }: CardProps): JSX.Element => {
  return (
    <div className="flex flex-col">
      <h3>{title}</h3>
      {children}
    </div>
  );
};

export default Card;
