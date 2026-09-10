"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Onboard Staff", href: "/onboard" },
  { label: "ID Cards", href: "/id-cards" },
  { label: "Manage Staff", href: "/manage-staff" },
];

function Logo({ size = 32, textSize = "text-xs" }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex flex-shrink-0 items-center justify-center rounded bg-neutral-900 ${textSize} font-bold text-white dark:bg-white dark:text-neutral-900`}
    >
      MVP
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever navigation happens (link click, back/forward).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 md:hidden dark:border-neutral-800">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <Logo size={24} textSize="text-[9px]" />
        <p className="font-semibold">MVP Design Build</p>
      </div>

      {/* Backdrop, mobile only */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-64 flex-shrink-0 transform flex-col
          border-r border-neutral-200 bg-white transition-transform duration-200
          dark:border-neutral-800 dark:bg-neutral-950
          md:static md:z-auto md:w-56 md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <Logo />
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
    </>
  );
}
