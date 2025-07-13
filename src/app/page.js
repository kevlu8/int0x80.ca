export default function Home() {
  return (
	<div className="flex justify-center items-center min-h-[calc(100vh-4rem-4rem)] w-full">
		<div className="text-center">
			<h1 className="font-mono text-2xl mb-2">int0x80.ca</h1>
			<div className="flex items-center justify-center gap-6 w-full max-w-lg">
				<div className="h-0.5 bg-gray-500 w-16"></div>
				<p className="text-lg text-gray-500">A personal devlog and portfolio site</p>
				<div className="h-0.5 bg-gray-500 w-16"></div>
			</div>
		</div>
	</div>
  );
}
