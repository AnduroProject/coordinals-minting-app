"use client";

import React, { useEffect } from "react";
import { Bai_Jamjuree } from "next/font/google";

const bai_Jamjuree = Bai_Jamjuree({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"],
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {}, []);
  return (
    <main className={bai_Jamjuree.className}>
      <div className="flex flex-col w-full h-full bg-background min-h-screen items-center pb-[112px]">
        <div className="w-full max-w-[1216px]">{children}</div>
      </div>
    </main>
  );
};

export default Layout;
