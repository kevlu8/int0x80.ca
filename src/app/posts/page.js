import { getAllCategoriesWithDescriptions } from '@/lib/posts';
import Link from 'next/link';

export default function PostsHome() {
  const categories = getAllCategoriesWithDescriptions();
  
  return (
    <div className="min-h-[calc(100vh-4rem-4rem)] py-8">
      <h1 className="text-center font-mono text-3xl mb-12">Blog Categories</h1>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-2">
          {categories.map(category => (
            <Link key={category.name} href={`/posts/${category.name}`}>
              <div className="border border-gray-700 rounded-lg p-6 hover:bg-gray-900 transition-colors cursor-pointer">
                <h2 className="font-mono text-xl mb-3 text-foreground">
                  {category.name.replace('-', ' ').toUpperCase()}
                </h2>
                <p className="font-mono text-sm text-gray-400 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
