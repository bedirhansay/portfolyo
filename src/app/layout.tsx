import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/pageComponents/header/header";
import { ActiveSectionProvider } from "@/lib/contex/sectionContex";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bedirhan Say - Freelance Hizmetler ve Portfolyo",
  description:
    "Ben Bedirhan Say. Kendi portföyümde sunduğum hizmetler ve yazdığım blog yazıları ile ilgili daha fazla bilgi alın.",
  keywords: [
    "Bedirhan Say",
    "Freelance",
    "Portföy",
    "Blog",
    "Hizmetler",
    "Web Geliştirme",
    "Yazılım",
    "Tasarım",
  ],
  authors: [{ name: "Next.js Team", url: "https://nextjs.org" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} bg-gray-50 text-gray-950 relative pt-28 sm:pt-36 `}
      >
        <div className="bg-[#fbe2e3] absolute top-[-1rem] -z-10 right-[0rem] h-[100vh] w-[50%]  blur-[12rem] rounded-md "></div>
        <div className="bg-[#dbd7fb] absolute top-[-1rem] -z-10 left-[-1rem] h-[100vh] w-[50%]  blur-[12rem] rounded-3xl"></div>

        <ActiveSectionProvider>
          <Header />
          {children}
        </ActiveSectionProvider>
      </body>
    </html>
  );
}
