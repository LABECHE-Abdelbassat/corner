import React from "react";
import styles from "./hero.module.scss";
import Image from "next/image";

import heroLeft from "@/public/images/hero-left.webp";
import heroCenter from "@/public/images/Frame 9781.webp";
import heroRight from "@/public/images/Frame 9779.webp";

import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";

const Hero = () => {
  // mobile (kept as-is)
  const title = toWords("Technology that works the way you work");

  // desktop split (so div1/div2 stay)
  const w0 = toWords("Technology");
  const w1 = toWords("that works the");
  const w2 = toWords("way you work");

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
          <h1 className={styles.main_title}>
            Digital systems & brand experiences
          </h1>

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
            <Image src={heroLeft} alt="hero image 1" />
          </div>
          <div className={styles.center}>
            <Image src={heroCenter} alt="hero image 2" />
          </div>
          <div className={styles.right}>
            <Image src={heroRight} alt="hero image 3" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
