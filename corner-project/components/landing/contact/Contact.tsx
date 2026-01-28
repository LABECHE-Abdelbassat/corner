import React from "react";
import styles from "./contact.module.scss";

import { FaWhatsapp } from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";

import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";

const Contact = () => {
  const t = useTranslations("HomePage.Contact");

  const Underline = () => (
    <svg
      width="337"
      height="26"
      viewBox="0 0 337 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.171387 7.85879C34.5562 5.89069 105.279 2.87293 139.454 3.00414C224.475 3.26655 271.902 3.26655 336.347 7.72758C258.79 9.36766 120.065 10.0237 42.5072 15.5344C100.117 13.6319 219.802 14.8784 276.784 16.3872C237.726 17.3057 181.092 16.1904 139.315 22.2915"
        stroke="#FFCE18"
        strokeWidth="6"
        className={styles.underline}
      />
    </svg>
  );

  const titleWords = toWords(t("title"));

  const cards = [
    {
      icon: <FiPhone />,
      title: t("cards.phone.title"),
      info: t("cards.phone.info"),
      links: [
        {
          text: t("cards.phone.links.l1.text"),
          href: t("cards.phone.links.l1.href"),
        },
        {
          text: t("cards.phone.links.l2.text"),
          href: t("cards.phone.links.l2.href"),
        },
      ],
    },
    {
      icon: <MdOutlineEmail />,
      title: t("cards.email.title"),
      info: t("cards.email.info"),
      links: [
        {
          text: t("cards.email.links.l1.text"),
          href: t("cards.email.links.l1.href"),
        },
      ],
    },
    {
      icon: <FaWhatsapp />,
      title: t("cards.whatsapp.title"),
      info: t("cards.whatsapp.info"),
      links: [
        {
          text: t("cards.whatsapp.links.l1.text"),
          href: t("cards.whatsapp.links.l1.href"),
        },
      ],
    },
  ];

  return (
    <div className={styles.contact}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-10 ${styles.container}`}>
        <h1 className={styles.title}>
          {titleWords.map((word, index) => (
            <React.Fragment key={index}>
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: index * 0.1,
                }}
                viewport={{ amount: "all", once: true }}
              >
                {word}
                {index === titleWords.length - 1 ? (
                  <div>
                    <Underline />
                  </div>
                ) : null}
              </motion.span>

              {/* keep your line break behavior */}
              {index === 3 ? <br /> : null}

              {index !== titleWords.length - 1 && " "}
            </React.Fragment>
          ))}
        </h1>

        <div className={styles.cards}>
          {cards.map((card, index) => (
            <motion.div
              className={styles.card}
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.1,
              }}
              viewport={{ amount: "all", once: true }}
            >
              <span className={styles.icon}>{card.icon}</span>
              <h3>{card.title}</h3>
              <p>{card.info}</p>

              <div className={styles.links}>
                {card.links.map((link, linkIndex) => (
                  <a key={linkIndex} href={link.href}>
                    {link.text}
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
