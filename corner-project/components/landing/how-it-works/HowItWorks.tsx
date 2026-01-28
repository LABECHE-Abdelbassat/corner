// HowItWorks.tsx
"use client";

import React from "react";
import styles from "./how-it-works.module.scss";
import Image from "next/image";

import step1 from "@/public/images/step1.webp";
import step2 from "@/public/images/step2.webp";
import step3 from "@/public/images/step3.webp";
import step1Mb from "@/public/images/step1-mb.webp";
import step2Mb from "@/public/images/step2-mb.webp";
import step3Mb from "@/public/images/step3-mb.webp";

import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";

const HowItWorks = () => {
  const t = useTranslations("HomePage.HowItWorks");

  const Icon = () => (
    <svg
      width="58"
      height="51"
      viewBox="0 0 58 51"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.6014 45.5287C41.0014 43.7327 47.702 42.8267 54.202 41.9967C55.602 41.8227 56.9018 42.7937 57.0018 44.1617C57.2018 45.5307 56.2012 46.7827 54.9012 46.9567C48.6012 47.7557 42.1018 48.6107 36.0018 50.3397C34.7018 50.7147 33.3012 49.9427 32.9012 48.6147C32.5012 47.2877 33.3014 45.9047 34.6014 45.5287Z"
        fill="#ffce18"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.2022 32.0634C26.5022 21.5524 38.1022 12.3944 48.2022 1.60144C49.1022 0.593443 50.7022 0.53944 51.7022 1.48044C52.7022 2.42244 52.8019 4.00644 51.8019 5.01444C41.7019 15.8384 30.1019 25.0264 19.8019 35.5684C18.8019 36.5524 17.2022 36.5664 16.2022 35.5984C15.3022 34.6314 15.2022 33.0474 16.2022 32.0634Z"
        fill="#ffce18"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.89992 2.63576C5.59992 8.65176 5.30051 14.6678 5.00051 20.6848C5.00051 22.0628 3.79992 23.1268 2.39992 23.0598C0.999925 22.9918 0.000510693 21.8188 0.000510693 20.4398C0.300511 14.4138 0.599925 8.38876 0.899925 2.36376C0.999925 0.985757 2.20012 -0.0712432 3.60012 0.00375683C4.90012 0.0787568 5.99992 1.25876 5.89992 2.63576Z"
        fill="#ffce18"
      />
    </svg>
  );

  const titleWords = toWords(t("title"));

  const steps = [
    {
      number: "01",
      title: t("steps.step1.title"),
      desc: t("steps.step1.desc"),
      alt: t("steps.step1.alt"),
      cardClass: styles.firstCard,
      src: step1,
      mobileSrc: step1Mb,
    },
    {
      number: "02",
      title: t("steps.step2.title"),
      desc: t("steps.step2.desc"),
      alt: t("steps.step2.alt"),
      cardClass: styles.secondCard,
      src: step2,
      mobileSrc: step2Mb,
    },
    {
      number: "03",
      title: t("steps.step3.title"),
      desc: t("steps.step3.desc"),
      alt: t("steps.step3.alt"),
      cardClass: styles.thirdCard,
      src: step3,
      mobileSrc: step3Mb,
    },
  ];

  return (
    <div className={styles.howItWorks}>
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
          {steps.map((step) => (
            <div
              key={step.number}
              className={`${styles.card} ${step.cardClass}`}
            >
              <div className={styles.image}>
                <Image
                  className={styles.img}
                  src={step.src}
                  alt={step.alt}
                  width={320}
                  height={584}
                />
                <Image
                  className={styles.mobileImg}
                  src={step.mobileSrc}
                  alt={step.alt}
                  width={439}
                  height={262}
                />
              </div>

              <div className={styles.content}>
                <div className={styles.header}>
                  <div className={styles.number}>
                    {step.number}
                    <span>
                      <Icon />
                    </span>
                  </div>
                  <h2 className={styles.cardTitle}>{step.title}</h2>
                </div>

                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
