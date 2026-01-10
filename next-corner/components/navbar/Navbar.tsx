"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.scss";
import Button from "@/components/button/Button";
import Dropdown from "../dropdown/Dropdown";
import MobileMenu from "./MobileMenu";
import { GoArrowRight } from "react-icons/go";

import * as motion from "motion/react-client";
import { useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

const Navbar = () => {
  const Icon = () => (
    <svg
      width="58"
      height="51"
      viewBox="0 0 58 51"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M34.6014 45.5287C41.0014 43.7327 47.702 42.8267 54.202 41.9967C55.602 41.8227 56.9018 42.7937 57.0018 44.1617C57.2018 45.5307 56.2012 46.7827 54.9012 46.9567C48.6012 47.7557 42.1018 48.6107 36.0018 50.3397C34.7018 50.7147 33.3012 49.9427 32.9012 48.6147C32.5012 47.2877 33.3014 45.9047 34.6014 45.5287Z"
        fill="#ffce18"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16.2022 32.0634C26.5022 21.5524 38.1022 12.3944 48.2022 1.60144C49.1022 0.593443 50.7022 0.53944 51.7022 1.48044C52.7022 2.42244 52.8019 4.00644 51.8019 5.01444C41.7019 15.8384 30.1019 25.0264 19.8019 35.5684C18.8019 36.5524 17.2022 36.5664 16.2022 35.5984C15.3022 34.6314 15.2022 33.0474 16.2022 32.0634Z"
        fill="#ffce18"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.89992 2.63576C5.59992 8.65176 5.30051 14.6678 5.00051 20.6848C5.00051 22.0628 3.79992 23.1268 2.39992 23.0598C0.999925 22.9918 0.000510693 21.8188 0.000510693 20.4398C0.300511 14.4138 0.599925 8.38876 0.899925 2.36376C0.999925 0.985757 2.20012 -0.0712432 3.60012 0.00375683C4.90012 0.0787568 5.99992 1.25876 5.89992 2.63576Z"
        fill="#ffce18"
      />
    </svg>
  );
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious();
    if (prev && latest > prev && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`${styles.navbar}`}
    >
      <nav>
        <Link href="/">
          <Image
            src="/corner-logo.svg"
            alt="Corner"
            width={120}
            height={40}
            priority
          />
        </Link>

        {/* Desktop */}
        <div className={styles.nav_menu_desktop}>
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
        </div>

        <div className={styles.cta_btns}>
          <Dropdown />
          <Button variant="secondary">
            Login <GoArrowRight />
          </Button>
          <Button variant="primary">
            Get a demo <Icon />
          </Button>
        </div>

        {/* Mobile (client) */}
        <MobileMenu />
      </nav>
    </motion.header>
  );
};

export default Navbar;
