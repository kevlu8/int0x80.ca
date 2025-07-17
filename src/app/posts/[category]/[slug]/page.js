import { getPostSlugs, getPostBySlug } from '@/lib/posts';
import { remark } from 'remark';
import math from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map(({ category, slug }) => ({ category, slug }));
}

export async function generateMetadata({ params }) {
  const awaitparams = await params;
  const post = getPostBySlug(awaitparams.category, awaitparams.slug);
  
  const title = post.data.title || post.slug;
  const description = post.data.description || 'Read this blog post';
  
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      url: `https://int0x80.ca/posts/${awaitparams.category}/${awaitparams.slug}`,
      siteName: 'int0x80.ca',
    },
    twitter: {
      card: 'summary',
      title: title,
      description: description,
    },
  };
}

export default async function PostPage({ params }) {
  const awaitparams = await params;
  const post = getPostBySlug(awaitparams.category, awaitparams.slug);

  const processedContent = await remark()
    .use(math)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(post.content);
  const contentHtml = processedContent.toString();

  return (
    <article>
      <div className="max-w-3xl font-mono mx-auto" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}
