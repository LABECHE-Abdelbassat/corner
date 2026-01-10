"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { MdMenu } from "react-icons/md";
import styles from "./navbar.module.scss";
import Button from "@/components/button/Button";
import Dropdown from "../dropdown/Dropdown";

const MobileMenu = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [active]);

  return (
    <>
      <div
        className={`${styles.nav_menu_mobile} ${active ? styles.active : ""}`}
      >
        <ul>
          <li>
            <Link href="/">Services</Link>
          </li>
          <li>
            <Link href="/">Businesses</Link>
          </li>
          <li>
            <Link href="/">How It Works</Link>
          </li>
          <li>
            <Link href="/">Why Corner?</Link>
          </li>
          <li>
            <Link href="/">Contact</Link>
          </li>
        </ul>

        <div className={styles.cta_btns_mobile}>
          <Button variant="secondary">Login</Button>
          <Button variant="primary">Get a demo</Button>
        </div>

        <button
          className={styles.close}
          onClick={() => setActive(false)}
          type="button"
        >
          <IoMdClose />
        </button>
      </div>

      <div className={styles.actions}>
        <Dropdown />
        <button
          className={styles.toggel}
          onClick={() => setActive(true)}
          type="button"
        >
          <MdMenu />
        </button>
      </div>
    </>
  );
};

export default MobileMenu;
