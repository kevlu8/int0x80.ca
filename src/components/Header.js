import React from 'react';

function Header() {
	return (
		<header className="flex justify-between items-center p-4 bg-gray-800 text-white h-16 shrink-0">
			<h1 className="text-lg font-mono font-bold">
				<a href="/">int0x80.ca</a>
			</h1>
			<nav>
				<ul className="flex space-x-4 font-mono">
					<li><a href="/">Home</a></li>
					<li><a href="/blog">Blog</a></li>
				</ul>
			</nav>
		</header>
	);
}

export default Header;
