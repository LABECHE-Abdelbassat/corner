import React from "react";
import styles from "./benefits.module.scss";

import why1 from "@/public/images/why-1.webp";
import why1fr from "@/public/images/why-1fr.webp";
import why2 from "@/public/images/why-2.webp";
import why3 from "@/public/images/why-3.webp";
import why3fr from "@/public/images/why-3fr.webp";

import Image from "next/image";
import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";
import { useTranslations, useLocale } from "next-intl";

const Benefits = () => {
  const t = useTranslations("HomePage.Benefits");
  const locale = useLocale();

  const isFr = locale === "fr";

  const titleWords = toWords(t("title"));

  const cards = [
    {
      src: isFr ? why1fr : why1,
      span: t("cards.card1.span"),
      h1: t("cards.card1.h1"),
      alt: t("cards.card1.alt"),
    },
    {
      src: why2, // same for both languages
      span: t("cards.card2.span"),
      h1: t("cards.card2.h1"),
      alt: t("cards.card2.alt"),
    },
    {
      src: isFr ? why3fr : why3,
      span: t("cards.card3.span"),
      h1: t("cards.card3.h1"),
      alt: t("cards.card3.alt"),
    },
  ];

  return (
    <div className={styles.benefits}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-10 ${styles.container}`}>
        <div className={`${styles.title} pe-4 sm:pe-6 lg:pe-10`}>
          <h1 className={styles.right}>
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
                </motion.span>
                {index !== titleWords.length - 1 && " "}
              </React.Fragment>
            ))}
          </h1>

          <h1 className={styles.left}>{t("subtitle")}</h1>
        </div>

        <div className={styles.cards}>
          {cards.map((card, index) => {
            const cardTitleWords = toWords(card.h1);

            return (
              <div className={styles.card} key={index}>
                <div className={styles.img}>
                  <Image
                    src={card.src}
                    alt={card.alt}
                    width={480}
                    height={480}
                  />
                </div>

                <div className={styles.content}>
                  <span className={styles.desc}>{card.span}</span>
                  <h1>
                    {cardTitleWords.map((word, i) => (
                      <React.Fragment key={i}>
                        <motion.span
                          className="inline-block"
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            ease: "easeOut",
                            delay: i * 0.1,
                          }}
                          viewport={{ amount: "all", once: true }}
                        >
                          {word}
                        </motion.span>
                        {i !== cardTitleWords.length - 1 && " "}
                      </React.Fragment>
                    ))}
                  </h1>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Benefits;
