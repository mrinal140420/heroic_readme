import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children, title = 'Heroic Readme' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <header className="bg-white shadow p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          
          <nav className="space-x-4">
           
          </nav>
        </div>
      </header>
      <main className="p-4 max-w-6xl mx-auto">{children}</main>
    </>
  );
}
