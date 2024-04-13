import { Post, PostMatter, PostReturn } from "@/app/lib/blog/definitions";
import { getPostsFiles } from "@/app/lib/blog/getPostsFiles";
import { getPost } from "@/app/lib/blog/getPost";

export const getPosts = async (postReturn: PostReturn) => {
   const postsFiles = getPostsFiles();

   if (postReturn === PostReturn.MATTER_ONLY) {
      const posts: PostMatter[] = (await Promise.all(
         postsFiles.map((postFile) => getPost(postFile, PostReturn.MATTER_ONLY)),
      )) as PostMatter[];
      return posts;
   } else if (postReturn === PostReturn.FULL) {
      const posts: Post[] = (await Promise.all(
         postsFiles.map((postFile) => getPost(postFile, PostReturn.FULL)),
      )) as Post[];
      return posts;
   } else {
      throw new Error("Invalid post return amount");
   }
};
