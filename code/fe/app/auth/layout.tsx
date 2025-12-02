export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-soft-white-blue flex items-center justify-center">
      {/* Auth pages - centered layout */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
