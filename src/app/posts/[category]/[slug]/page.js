import { getPostSlugs, getPostBySlug } from '@/lib/posts';
import { remark } from 'remark';
import html from 'remark-html';
import math from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map(({ category, slug }) => ({ category, slug }));
}

export default async function PostPage({ params }) {
  const awaitparams = await params;
  const post = getPostBySlug(awaitparams.category, awaitparams.slug);

  const processedContent = await remark().use(html).use(math).use(remarkGfm).use(remarkRehype).use(rehypeHighlight).use(rehypeStringify).process(post.content);
  const contentHtml = processedContent.toString();

  return (
    <article>
      <div className="max-w-3xl font-mono mx-auto" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}
