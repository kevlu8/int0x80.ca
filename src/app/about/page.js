import Image from 'next/image';

export default function AboutHome() {
  return (
	<div className="flex justify-center items-center min-h-[calc(100vh-4rem-4rem)] w-full">
		<div className="border border-gray-700 rounded-lg p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl mb-4 font-mono">About Me</h1>
			<div className="flex flex-col md:flex-row items-center md:items-start gap-4">
				<Image
					src="/me.jpg"
					alt="A photo of me"
					className="rounded-lg flex-shrink-0"
					width={400}
					height={500}
				/>
				<div className="flex-1 font-mono">
					<h2 className='text-2xl mb-2'>Hi, I&apos;m Kevin!</h2>
					<p className="text-gray-400">
						I&apos;m an 18-year-old student and developer from Canada, currently studying computer science at UCLA. I&apos;m primarily interested in systems programming, optimization, and usually work with C, C++, and x86 assembly.
						Most of my recent work has been focused on computer chess. I&apos;m one of the developers of PZChessBot, a top-20 chess engine that competes in events like the Top Chess Engine Championship and the Chess.com Computer Chess Championship.
						When I'm not working on that, you'll probably find me doing competitive programming, testing CodeForces rounds, or hosting my own contests.
					</p>
				</div>
			</div>
			<div className="flex flex-col">
				<p className="text-gray-400">
					<strong>Contact:</strong> <a href="mailto:me@int0x80.ca" className="text-blue-400 hover:underline">me@int0x80.ca</a>
				</p>
			</div>
		</div>
	</div>
  );
}
