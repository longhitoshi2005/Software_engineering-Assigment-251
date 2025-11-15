import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tutor Support System",
  description: "Next.js 15 App Router Migration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning prevents transient DOM attribute differences
          (e.g. browser extensions injecting attributes) from failing hydration
          during development. We keep the layout markup stable otherwise. */}
      <body className="antialiased" suppressHydrationWarning={true}>
        <div className="min-h-screen bg-soft-white-blue">
          {children}
        </div>
      </body>
    </html>
  );
}