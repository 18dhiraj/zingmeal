// components/LayoutClientWrapper.tsx
"use client";

import { usePathname } from "next/navigation";

export default function LayoutClientWrapper({
  children,
  header,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Only show the default header if not on home page */}
      {pathname !== "/" && header}
      <div className="flex-grow">{children}</div>
    </>
  );
}
