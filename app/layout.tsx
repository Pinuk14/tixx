import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">

        {/* Liquid Glass Background System */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {/* Dark gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-black to-purple-950 opacity-80"></div>

          {/* Glow Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/40 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full min-h-screen pt-24 overflow-x-hidden">
          <Navbar />
          {children}
        </div>

      </body>
    </html>
  );
}