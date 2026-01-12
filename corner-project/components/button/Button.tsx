import Link from "next/link";
import React from "react";
import { ReactNode } from "react";

import styles from "@/components/button/button.module.scss";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

const Button = ({ children, variant = "primary" }: ButtonProps) => {
  return (
    <div
      className={`${styles.button} ${
        variant === "primary" ? styles.primary : styles.secondary
      }`}
    >
      <div className={styles.frame}></div>
      <Link href={"/"}>{children}</Link>
    </div>
  );
};

export default Button;
