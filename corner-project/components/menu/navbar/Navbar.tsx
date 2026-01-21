"use client";
import { useEffect, useState } from "react";
import * as motion from "motion/react-client";
import { useMotionValueEvent, useScroll, AnimatePresence } from "motion/react";
import { Turn as Hamburger } from "hamburger-react";

import styles from "./navbar.module.scss";
import Dropdown from "@/components/dropdown/Dropdown";

import logo from "@/public/images/Group 77.png";
import Image from "next/image";
import NavLink from "./NavLink";

const Navbar = () => {
  const [hidden, setHidden] = useState(false);
  const [isOpen, setOpen] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious();
    if (prev && latest > prev && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const links = [
    { title: "Menu", href: "/" },
    { title: "Location", href: "/" },
    { title: "Follow us", href: "/" },
  ];

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const EASE_IN_MENU = [0.12, 0, 0.39, 0] as const;
  const EASE_OUT_MENU = [0.22, 1, 0.36, 1] as const;

  const menuVars = {
    initial: { clipPath: "inset(0 0 100% 0)" },
    animate: {
      clipPath: "inset(0 0 0% 0)",
      transition: { duration: 0.5, ease: EASE_IN_MENU },
    },
    exit: {
      clipPath: "inset(0 0 100% 0)",
      transition: { delay: 0.5, duration: 0.5, ease: EASE_OUT_MENU },
    },
  };

  const linksVars = {
    initial: { transition: { staggerChildren: 0.09, staggerDirection: -1 } },
    open: {
      transition: {
        staggerChildren: 0.09,
        staggerDirection: 1,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`${styles.navbar}`}
    >
      <div className={`appContainer ${styles.navContainer}`}>
        <div className={styles.logo}>
          <Image src={logo} alt="uncule wood" width={80} />
        </div>
        <div className={styles.actions}>
          <Dropdown variant="white" />
          <div className={styles.hamburger}>
            <Hamburger toggled={isOpen} toggle={setOpen} direction="right" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVars}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`${styles.menu} origin-top`}
          >
            <div className="appContainer h-full">
              <motion.div
                className={styles.title}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.5, ease: "easeInOut", delay: 0.5 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.5, ease: "easeInOut" },
                }}
              >
                <h1>Unclewood</h1>
              </motion.div>

              <motion.div
                variants={linksVars}
                initial="initial"
                animate="open"
                exit="initial"
                className={styles.links}
              >
                {links.map((link, i) => (
                  <div className="overflow-hidden">
                    <NavLink
                      title={link.title}
                      key={i}
                      href={link.href}
                      onClick={() => setOpen(false)}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
