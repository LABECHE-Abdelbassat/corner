import React from "react";

import styles from "./footer.module.scss";
import Link from "next/dist/client/link";
import Image from "next/image";
import { FaFacebookF, FaYoutube, FaLinkedinIn } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import logo from "@/public/images/Group 77.png";

const Footer = () => {
  const socialList = [
    {
      icon: FaFacebookF,
      link: "https://www.facebook.com/SociedadePontoVerde?ref=br_rs",
      name: "facebook",
    },
    {
      icon: FaYoutube,
      link: "https://www.youtube.com/SociedadePontoVerdeOficial",
      name: "youtube",
    },
    {
      icon: FaLinkedinIn,
      link: "https://www.linkedin.com/company/sociedade-ponto-verde/",
      name: "linkedin",
    },
    {
      icon: RiInstagramFill,
      link: "https://www.instagram.com/pontoverde.pt/",
      name: "instagram",
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={`appContainer ${styles.container}`}>
        <div className={styles.content}>
          <div className={styles.logo}>
            <Link href="/">
              <Image src={logo} alt="Corner" width={100} priority />
            </Link>
          </div>
          <div className={styles.social}>
            {socialList.map((item, i) => (
              <a
                className={`${styles.icon} ${styles[item.name]}`}
                key={i}
                href={item.link}
                target="_blank"
              >
                <item.icon />
              </a>
            ))}
          </div>
        </div>
        <div className={styles.copyright}>
          <span>Copyright 2026 © Corner</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
