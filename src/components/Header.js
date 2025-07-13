import React from 'react';
import Link from 'next/link';

function Header() {
	return (
		<header className="top-0 left-0 w-full flex justify-between items-center p-4 bg-black text-white h-16 shrink-0 hover:bg-zinc-900 transition-colors duration-1000">
			<p className="text-lg font-mono font-bold">
				<Link href="/">int0x80.ca</Link>
			</p>
			<nav>
				<ul className="flex space-x-4 font-mono">
					<li><Link href="/">Home</Link></li>
					<li><Link href="/about">About</Link></li>
					<li><Link href="/posts">Blog</Link></li>
					<li><Link href="/projects">Projects</Link></li>
				</ul>
			</nav>
		</header>
	);
}

export default Header;
