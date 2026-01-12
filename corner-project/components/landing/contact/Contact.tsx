import React from "react";
import styles from "./contact.module.scss";

// import { FaPhoneAlt } from "react-icons/fa";
// import { MdEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";

import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";

const Contact = () => {
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
        stroke-width="6"
        className={styles.underline}
      />
    </svg>
  );

  const title = toWords("Let's build an awesome project together!");

  const cards = [
    {
      icon: <FiPhone />,
      title: "Call us directly",
      info: "Available during working hours",
      links: [
        { text: "+213 698 68 86 62", href: "tel:+21369868662" },
        { text: "+213 698 68 86 62", href: "tel:+21369868662" },
      ],
    },
    {
      icon: <MdOutlineEmail />,
      title: "Email support",
      info: "Available during working hours",
      links: [
        { text: "support@example.com", href: "mailto:support@example.com" },
      ],
    },
    {
      icon: <FaWhatsapp />,
      title: "Chat with us",
      info: "Available during working hours",
      links: [{ text: "+213 698 68 86 62", href: "tel:+21369868662" }],
    },
  ];

  return (
    <div className={styles.contact}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-10 ${styles.container}`}>
        <h1 className={styles.title}>
          {title.map((word, index) => (
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
                {index === title.length - 1 ? (
                  <div>
                    <Underline />
                  </div>
                ) : null}
              </motion.span>
              {index === 3 ? <br /> : null}

              {index !== title.length - 1 && " "}
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
