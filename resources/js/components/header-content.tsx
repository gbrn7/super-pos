import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function HeaderContent({ children }: Props) {
  return (
    <div className="content-header mb-5 p-3 border rounded-2xl">
      <h2 className="text-2xl/7 font-bold text-white sm:truncate sm:text-3xl sm:tracking-tight">
        {children}
      </h2>
    </div>
  )
}