"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Onboard Staff", href: "/onboard" },
  { label: "ID Cards", href: "/id-cards" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
          MVP
        </div>
        <div>
          <p className="font-semibold leading-tight">MVP Design Build</p>
          <p className="text-xs text-neutral-500">Admin</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ label, href }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mx-3 mb-5 rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        Log out
      </button>
    </aside>
  );
}
