import './globals.css';

export const metadata = {
  title: 'Assistio',
  description: 'Assistio — chat with your documents using context-aware AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
