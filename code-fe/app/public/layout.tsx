export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-soft-white-blue">
      {/* Public pages - no sidebar */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
