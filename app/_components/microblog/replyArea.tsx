"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Microblog, Microdotblog } from "@/app/_lib/microblog/definitions";
import getMicrodotblog from "@/app/_lib/microblog/getMicrodotblog";
import Conversation from "@/app/_components/microblog/conversation";

type ReplyAreaProps = {
   post: Microblog | null;
   microdotblog: Microdotblog | null;
};

export default function ReplyArea({ post, microdotblog }: ReplyAreaProps) {
   const [token, setToken] = useState<string | null>(null);
   const [username, setUsername] = useState<string | null>(null);
   const [tokenized, setTokenized] = useState(false);

   useEffect(() => {
      if (token && username) {
         setTokenized(true);
      } else {
         setTokenized(false);
      }
   }, [token, username]);

   const searchParams = useSearchParams();
   useEffect(() => {
      setToken(searchParams.get("token"));
      setUsername(searchParams.get("username"));

      return () => {
         setToken(null);
         setUsername(null);
      };
   }, []);

   const pathname = usePathname();
   const router = useRouter();
   useEffect(() => {
      router.push(pathname, undefined);
   }, [pathname, router]);

   const [mdb, setMdb] = useState<Microdotblog | null>(microdotblog);
   const [refreshMdb, toggleRefreshMdb] = useState(false);
   useEffect(() => {
      if (refreshMdb && post && post.url) {
         const fetchMdb = async () => {
            let retries = 0;
            let newMdb: Microdotblog | null = null;

            do {
               if (retries !== 0) {
                  await new Promise((resolve) => setTimeout(resolve, 250));
               }

               newMdb = await getMicrodotblog(post.url);
               retries++;
            } while (
               (JSON.stringify(newMdb) === JSON.stringify(mdb) || !newMdb) &&
               retries < 5
            );

            setMdb(newMdb);
         };

         toggleRefreshMdb(false);
         fetchMdb();
      }
   }, [refreshMdb, post, mdb]);

   const [id] =
      microdotblog ? microdotblog.home_page_url.match(/(\d+)$/) || [] : [];

   function postReply(formData: FormData) {
      if (!token || !username) return;
      if (!post) return;

      const text = formData.get("text") as string;
      if (!text) return;

      const body = new URLSearchParams();
      body.append("token", token);
      body.append("username", username);
      body.append("url", post.url);
      body.append("text", text);

      setToken(null);
      setUsername(null);

      fetch(`https://micro.blog/account/comments/${id}/post`, {
         method: "POST",
         mode: "no-cors",
         headers: {
            "Content-Type": "application/x-www-form-urlencoded",
         },
         body: body.toString(),
      }).then(() => {
         toggleRefreshMdb(true);
      });
   }

   return (
      <div
         className={clsx(
            "rounded-lg border-gray-100 bg-gray-100/50 dark:border-stone-800 dark:bg-stone-800/50",
            {
               border: tokenized || (mdb && mdb.items.length > 0),
            },
         )}
      >
         {tokenized && (
            <form
               action={postReply}
               className={clsx(
                  "mt-3.5 max-w-full border-gray-200 px-4 pb-4 dark:border-stone-700",
                  {
                     "border-b": mdb && mdb.items.length > 0,
                  },
               )}
            >
               <textarea
                  name="text"
                  placeholder="Some nice words..."
                  cols={37}
                  rows={3}
                  className="w-full min-w-full max-w-full resize-y rounded-lg-half border border-gray-200 bg-white p-1 placeholder:text-black/30 dark:border-stone-700 dark:bg-stone-950 dark:placeholder:text-stone-200/30"
               />
               <button
                  type="submit"
                  className="btn-xs ml-auto mt-1.5 block bg-white"
               >
                  <span>
                     Reply as <em>@{username}</em>
                  </span>
               </button>
            </form>
         )}
         {mdb && mdb.items.length > 0 && (
            <Conversation microdotblog={mdb} className="p-4" />
         )}
      </div>
   );
}
