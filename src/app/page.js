import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
	<div className="min-h-screen flex flex-col">
		<Header />

		<main className="flex-1 flex justify-center items-center font-mono text-2xl">
			int0x80.ca
		</main>

		<Footer />
	</div>
  );
}
