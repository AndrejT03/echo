"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      <Link href="/" className="brand glass" aria-label="ЕХО — почетна">
        <span className="dot" />
        <span className="brand-name">ЕХО</span>
      </Link>
      <div className="nav-rail glass">
        <Link
          href="/odraz"
          className={`nav-link${path === "/odraz" ? " is-active" : ""}`}
        >
          Нов отпечаток
        </Link>
        <Link
          href="/galerija"
          className={`nav-link${path === "/galerija" ? " is-active" : ""}`}
        >
          Галерија
        </Link>
      </div>
    </nav>
  );
}
