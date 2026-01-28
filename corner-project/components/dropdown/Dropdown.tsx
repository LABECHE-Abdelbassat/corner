"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./dropdown.module.scss";

import { MdKeyboardArrowDown } from "react-icons/md";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const LANGS = [
  { code: "en", label: "EN - English" },
  { code: "fr", label: "FR - French" },
] as const;

type Locale = (typeof LANGS)[number]["code"];

const Dropdown = ({ variant = "black" }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const orderedLangs = useMemo(() => {
    const active = LANGS.find((l) => l.code === locale);
    const rest = LANGS.filter((l) => l.code !== locale);
    return active ? [active, ...rest] : LANGS;
  }, [locale]);

  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }
    router.replace(pathname, { locale: nextLocale });
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) close();
    };

    const onScroll = () => close();
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && close();

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`${styles.dropdown} ${styles[variant]}`}>
      <div
        className={`${styles.active} ${open ? styles.open : ""}`}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
        }}
      >
        {locale.toUpperCase()} <MdKeyboardArrowDown />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={styles.menu}
            role="menu"
          >
            <div className={styles.frame}></div>

            {orderedLangs.map((l) => {
              const isActive = l.code === locale;
              return (
                <div
                  key={l.code}
                  className={`${styles.item} ${isActive ? styles.current : ""}`}
                  onClick={() => changeLocale(l.code)}
                  role="menuitem"
                  aria-current={isActive ? "true" : undefined}
                >
                  {l.label}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
