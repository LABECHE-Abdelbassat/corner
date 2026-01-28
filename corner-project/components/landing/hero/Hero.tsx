import React from "react";
import styles from "./hero.module.scss";
import Image from "next/image";

import heroLeft from "@/public/images/hero-left11.webp";
import heroCenter from "@/public/images/hero-center5.webp";
import heroRight from "@/public/images/hero-right3.webp";

import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";

const Hero = () => {
  // mobile (kept as-is)

  const t = useTranslations("HomePage.HeroSection");

  const title = toWords(t("title"));

  // desktop split (so div1/div2 stay)
  const w0 = toWords(t("desktop_line0"));
  const w1 = toWords(t("desktop_line1"));
  const w2 = toWords(t("desktop_line2"));

  const renderWords = (words: string[], startIndex = 0) =>
    words.map((word, i) => {
      const idx = startIndex + i;

      return (
        <React.Fragment key={`${word}-${idx}`}>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: idx * 0.1,
            }}
            viewport={{ amount: "all", once: true }}
          >
            {word}
          </motion.span>

          {i !== words.length - 1 && " "}
        </React.Fragment>
      );
    });

  return (
    <main className={styles.hero}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-10 ${styles.container}`}>
        <div className={styles.title}>
          <h1 className={styles.main_title}>{t("heading")}</h1>

          <h1 className={`${styles.sub_title} mx-auto`}>
            {renderWords(w0, 0)}
            <div className={styles.div1}>{renderWords(w1, w0.length)}</div>
            <div className={styles.div2}>
              {renderWords(w2, w0.length + w1.length)}
            </div>
          </h1>

          <h2 className={styles.mobile_title}>
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
          </h2>
        </div>

        <div className={styles.images}>
          <div className={styles.left}>
            <Image src={heroLeft} alt="hero image 1" width={678} height={816} />
          </div>
          <div className={styles.center}>
            <Image
              src={heroCenter}
              alt="hero image 2"
              width={1082}
              height={844}
            />
          </div>
          <div className={styles.right}>
            <Image
              src={heroRight}
              alt="hero image 3"
              width={678}
              height={816}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
