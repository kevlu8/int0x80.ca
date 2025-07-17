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
						I&apos;m a 17-year-old student and developer from Canada, currently attending high school in California. I&apos;m mostly interested in low-level programming, and mostly work with C, C++, and x86 assembly.
						I&apos;m also familiar with Linux and Windows, but primarily use Linux for development, frequently using tools like Git, GDB, and make.
						I&apos;m currently focusing on my chess engine project, which you can read more about on the projects page. I also enjoy competitive programming, and am a tester for many CodeForces contests, along with hosting my own contests.
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
