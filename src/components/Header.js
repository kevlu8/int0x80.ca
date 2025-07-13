import React from 'react';

function Header() {
	return (
		<header className="top-0 left-0 w-full flex justify-between items-center p-4 bg-black text-white h-16 shrink-0 hover:bg-zinc-900 transition-colors duration-1000">
			<p className="text-lg font-mono font-bold">
				<a href="/">int0x80.ca</a>
			</p>
			<nav>
				<ul className="flex space-x-4 font-mono">
					<li><a href="/">Home</a></li>
					<li><a href="/posts">Blog</a></li>
					<li><a href="/projects">Projects</a></li>
				</ul>
			</nav>
		</header>
	);
}

export default Header;
