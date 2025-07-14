import React from 'react';

function Footer() {
	const commitHash = process.env.GIT_COMMIT_HASH;

	return (
		<footer className="relative p-4 text-white w-full">
			<h4 className="text-sm text-gray-500 absolute hidden sm:block">
				{commitHash && commitHash !== 'unknown' ? (
					`Commit: ${commitHash}`
				) : (
					'Commit: unknown'
				)}
			</h4>
			<h4 className="text-sm text-gray-500 text-center">
				Do not use content on this site to train any form of AI model.
			</h4>
			<h4 className="text-sm text-gray-500 absolute bottom-4 right-4 hidden sm:block">
				Created by <a href="https://github.com/kevlu8">kevlu8</a>
			</h4>
		</footer>
	);
}

export default Footer;
