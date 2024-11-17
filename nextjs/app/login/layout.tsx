export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 dark:text-white rounded shadow-md">
      {children}
    </div>
  );
}
