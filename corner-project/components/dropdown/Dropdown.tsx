"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./dropdown.module.scss";

import { MdKeyboardArrowDown } from "react-icons/md";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { IoLanguage } from "react-icons/io5";

const Dropdown = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const handleItemClick = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;

      // click/tap outside => close
      if (e.target instanceof Node && !root.contains(e.target)) {
        close();
      }
    };

    const onScroll = () => {
      // any scroll (window or scrollable containers) => close
      close();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("scroll", onScroll, true); // capture scroll from any container
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.dropdown}>
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
        {/* <IoLanguage /> */}
        EN <MdKeyboardArrowDown />
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

            <div
              className={styles.item}
              onClick={handleItemClick}
              role="menuitem"
            >
              EN - English
            </div>
            <div
              className={styles.item}
              onClick={handleItemClick}
              role="menuitem"
            >
              FR - French
            </div>
            <div
              className={styles.item}
              onClick={handleItemClick}
              role="menuitem"
            >
              AR - Arabic
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
