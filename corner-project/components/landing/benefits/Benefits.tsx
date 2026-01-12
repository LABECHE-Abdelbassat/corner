import React from "react";

import styles from "./benefits.module.scss";

import img from "@/public/images/TopicEmpower-your-team-SizeSquare-LanguageUK-min.png";
import Image from "next/image";

import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";

const Benefits = () => {
  const title = toWords("Every touchpoint now drives growth.");

  const cards = [
    {
      src: img,
      span: "For Staff",
      h1: "Higher tips, smoother service, better guest-connections.",
    },
    {
      src: img,
      span: "For Staff",
      h1: "Higher tips, smoother service, better guest-connections.",
    },
    {
      src: img,
      span: "For Staff",
      h1: "Higher tips, smoother service, better guest-connections.",
    },
  ];

  return (
    <div className={styles.benefits}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-10 ${styles.container}`}>
        <div className={`${styles.title} pe-4 sm:pe-6 lg:pe-10`}>
          <h1 className={styles.right}>
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

          <h1 className={styles.left}>
            Every page, profile, and post now creates value, turning discovery
            into trust, and trust into customers.
          </h1>
        </div>

        <div className={styles.cards}>
          {cards.map((card, index) => {
            const cardTitle = toWords(card.h1);
            return (
              <div className={styles.card} key={index}>
                <div className={styles.img}>
                  <Image src={card.src} alt="test" />
                </div>
                <div className={styles.content}>
                  <span className={styles.desc}>{card.span}</span>
                  <h1>
                    {cardTitle.map((word, index) => (
                      <React.Fragment key={index}>
                        <motion.span
                          className="inline-block"
                          initial={{ opacity: 0, y: 8 }}
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
