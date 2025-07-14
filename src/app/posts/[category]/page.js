import { getPostsByCategory, getAllCategories } from '@/lib/posts';
import Link from 'next/link';

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map(category => ({ category }));
}

export default async function CategoryPage({ params }) {
  const awaitparams = await params;
  const posts = getPostsByCategory(awaitparams.category);

  return (
    <div className="font-mono min-h-[calc(100vh-4rem-4rem)] py-8">
      <h1 className="flex justify-center text-2xl">{awaitparams.category.replace('-', ' ').toUpperCase()}</h1>
      <ul className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mt-8">
        {posts.map(({ slug, data }) => (
          <li key={slug}>
            <Link href={`/posts/${awaitparams.category}/${slug}`}>
				<div className="border border-gray-700 rounded-lg p-6 hover:bg-gray-900 transition-colors cursor-pointer">
					<h2 className="text-xl mb-3 text-foreground">{data.title}</h2>
					<p className="text-sm text-gray-400 leading-relaxed">
						{data.description}
					</p>
				</div>
			</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
