"use client";
import React from "react";
import * as motion from "motion/react-client";
import styles from "./numbers.module.scss";
import { toWords } from "@/utils/toWords";
import { useTranslations } from "next-intl";

const Numbers = () => {
  const t = useTranslations("HomePage.Numbers");

  const title = toWords(t("title"));

  const numbers = [
    { value: t("items.control.value"), label: t("items.control.label") },
    { value: t("items.wilaya.value"), label: t("items.wilaya.label") },
    { value: t("items.delivery.value"), label: t("items.delivery.label") },
    { value: t("items.support.value"), label: t("items.support.label") },
  ];

  return (
    <div className={styles.numbers}>
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
              </motion.span>
              {index !== title.length - 1 && " "}
            </React.Fragment>
          ))}
        </h1>

        <div className={styles.layout}>
          {numbers.map((number, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.2,
              }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: "all", once: true }}
              className={styles.number}
            >
              <h1>{number.value}</h1>
              <span>{number.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Numbers;
