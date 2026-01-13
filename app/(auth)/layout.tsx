export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        {children}
      </div>
    </div>
  );
}