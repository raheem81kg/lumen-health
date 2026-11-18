import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";

const fontSans = DM_Sans({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "Lumen Health",
	description: "Care task management for Lumen Health teams",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${fontSans.variable} antialiased`}>
				<Providers>
					<div className="grid grid-rows-[auto_1fr] h-svh">
						<Header />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
