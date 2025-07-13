import Link from 'next/link';

export default function PostsHome() {
  return (
    <div className="min-h-screen py-8">
      <h1 className="text-center font-mono text-3xl mb-12">Projects</h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
			<Link key="pzchessbot" href={"https://github.com/kevlu8/PZChessBot"} target="_blank">
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                <h2 className="font-mono text-xl mb-3 text-foreground">
					PZCHESSBOT
                </h2>
                <p className="font-mono text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
				  A chess engine written from scratch in C++. It uses neural networks for evaluation, boasting a rating of around 3200 on the CCRL rating list, putting it among the top 100 strongest engines in the world.
                </p>
              </div>
            </Link>
			<Link key="pzoj" href={"https://github.com/pzoj/pzoj-contest"} target="_blank">
			  <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
				<h2 className="font-mono text-xl mb-3 text-foreground">
					PZOJ
				</h2>
				<p className="font-mono text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
					An online judge built for competitive programming contests and problems. It supports Python, C++, and Java, and judging is performed fully automatically.
				</p>
			  </div>
			</Link>
        </div>
      </div>
    </div>
  );
}
