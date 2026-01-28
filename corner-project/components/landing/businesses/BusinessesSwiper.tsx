"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import business1 from "@/public/images/restaurants.webp";
import business2 from "@/public/images/cafes.webp";
import business3 from "@/public/images/shops.webp";
import business4 from "@/public/images/gyms.webp";
import business5 from "@/public/images/barbers.webp";
import business6 from "@/public/images/hotel.webp";
import business7 from "@/public/images/more.webp";
import styles from "./businesses.module.scss";
import { toWords } from "@/utils/toWords";
import { useTranslations } from "next-intl";

const BusinessesSwiper = () => {
  const t = useTranslations("HomePage.Businesses");

  const targetRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [maxX, setMaxX] = useState(0);
  const [sectionHeight, setSectionHeight] = useState("200vh");

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, (v) => -v * maxX);

  const cards = useMemo(
    () => [
      {
        id: 1,
        title: t("cards.restaurants.title"),
        desc: t("cards.restaurants.desc"),
        src: business1,
      },
      {
        id: 5,
        title: t("cards.cafes.title"),
        desc: t("cards.cafes.desc"),
        src: business2,
      },
      {
        id: 2,
        title: t("cards.shops.title"),
        desc: t("cards.shops.desc"),
        src: business3,
      },
      {
        id: 3,
        title: t("cards.gyms.title"),
        desc: t("cards.gyms.desc"),
        src: business4,
      },
      {
        id: 4,
        title: t("cards.clinics.title"),
        desc: t("cards.clinics.desc"),
        src: business5,
      },
      {
        id: 6,
        title: t("cards.hotels.title"),
        desc: t("cards.hotels.desc"),
        src: business6,
      },
      {
        id: 7,
        title: t("cards.services.title"),
        desc: t("cards.services.desc"),
        src: business7,
      },
    ],
    [t]
  );

  useLayoutEffect(() => {
    const measure = () => {
      if (!trackRef.current || !viewportRef.current || !stickyRef.current)
        return;

      const viewportWidth = viewportRef.current.clientWidth;
      const trackWidth = trackRef.current.scrollWidth;
      const NAV_H = 80;

      const distance = Math.max(0, trackWidth - viewportWidth);
      setMaxX(distance);

      const stickyHeight = stickyRef.current.offsetHeight;
      setSectionHeight(`${stickyHeight + distance + NAV_H}px`);
    };

    requestAnimationFrame(measure);

    const ro = new ResizeObserver(() => measure());
    if (stickyRef.current) ro.observe(stickyRef.current);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [cards.length]);

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

  return (
    <section
      ref={targetRef}
      className={styles.businesses_swiper}
      style={{ height: sectionHeight }}
    >
      <div ref={stickyRef} className={styles.sticky}>
        <div className={`${styles.swiperTitle} px-4 sm:px-6 lg:px-10`}>
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
                  {index === titleWords.length - 1 ? (
                    <div>
                      <Underline />
                    </div>
                  ) : null}
                </motion.span>

                {index !== titleWords.length - 1 && " "}
              </React.Fragment>
            ))}
          </h1>

          <h1 className={styles.left}>{t("subtitle")}</h1>
        </div>

        <div ref={viewportRef} className={styles.viewport}>
          <motion.div
            ref={trackRef}
            style={{ x }}
            className={`${styles.track} ps-4 sm:ps-6 lg:ps-10`}
          >
            {cards.map((card) => {
              const cardTitle = toWords(card.title);

              return (
                <div key={card.id} className={styles.card}>
                  <div className={styles.bg}></div>

                  <div className={styles.cardImage}>
                    <Image
                      src={card.src}
                      alt={card.title}
                      width={720}
                      height={1078}
                    />
                  </div>

                  <div className={styles.cardInfo}>
                    <h1>
                      {cardTitle.map((word, index) => (
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

                          {index !== cardTitle.length - 1 && " "}
                        </React.Fragment>
                      ))}
                    </h1>

                    {/* If you want the desc visible later, it's already translated: card.desc */}
                    {/* <p>{card.desc}</p> */}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BusinessesSwiper;
