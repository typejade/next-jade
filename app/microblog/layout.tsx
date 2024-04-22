export const revalidate = 0;

import Jade from "@/app/_components/Jade";
import type { Metadata } from "next";

export const metadata: Metadata = {
   title: "Jade's microblog",
   description: "Where I publish short, tweet-like posts.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
   return (
      <div className="flex w-full justify-center">
         <div className="flex w-full max-w-[70rem] gap-2 md:h-full">
            <aside className="jade-aside sticky top-0 -z-50 hidden w-1/3 self-start md:block md:pt-[44px] lg:pt-[60px]">
               <Jade className="max-h-screen overflow-auto px-4 pb-20" />
            </aside>
            <div className="jade-main w-full md:w-2/3">{children}</div>
         </div>
      </div>
   );
}
