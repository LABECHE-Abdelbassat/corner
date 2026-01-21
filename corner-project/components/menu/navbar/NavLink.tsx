import React from "react";

import styles from "./navbar.module.scss";
import Link from "next/link";

import * as motion from "motion/react-client";

type NavLinkProps = {
  title: string;
  href: string;
  onClick?: () => void;
};

const NavLink = ({ title, href, onClick }: NavLinkProps) => {
  const EASE_IN_LINK = [0.37, 0, 0.63, 1] as const;
  const EASE_OUT_LINK = [0, 0.55, 0.45, 1] as const;
  const linkVars = {
    initial: { y: "30vh", transition: { duration: 0.5, ease: EASE_IN_LINK } },
    open: { y: "0", transition: { duration: 0.7, ease: EASE_OUT_LINK } },
  };
  return (
    <motion.div variants={linkVars} className={styles.nav_link}>
      <Link href={href} onClick={onClick}>
        {title}
      </Link>
    </motion.div>
  );
};

export default NavLink;
