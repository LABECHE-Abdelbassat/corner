"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import img from "@/public/images/PD07077_-_QSR.avif";
import styles from "./businesses.module.scss";
import { toWords } from "@/utils/toWords";

const BusinessesSwiper = () => {
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
      { id: 1, title: "Restaurants", desc: "Lorem ipsum dolor sit amet..." },
      { id: 2, title: "Shops", desc: "Lorem ipsum dolor sit amet..." },
      { id: 3, title: "Gyms", desc: "Lorem ipsum dolor sit amet..." },
      { id: 4, title: "Clinics", desc: "Lorem ipsum dolor sit amet..." },
      { id: 5, title: "Cafes", desc: "Lorem ipsum dolor sit amet..." },
      { id: 6, title: "Hotels", desc: "Lorem ipsum dolor sit amet..." },
      { id: 7, title: "Services", desc: "Lorem ipsum dolor sit amet..." },
    ],
    []
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

      // THIS is the key: sticky duration = parentHeight - stickyHeight
      // so we set parentHeight = stickyHeight + distance
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
        stroke-width="6"
        className={styles.underline}
      />
    </svg>
  );

  const title = toWords("Designed for every type of business");

  return (
    <section
      ref={targetRef}
      className={styles.businesses_swiper}
      style={{ height: sectionHeight }}
    >
      <div ref={stickyRef} className={styles.sticky}>
        <div className={`${styles.swiperTitle} px-4 sm:px-6 lg:px-10`}>
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
                  {word}{" "}
                  {index === title.length - 1 ? (
                    <div>
                      <Underline />
                    </div>
                  ) : null}
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

        <div ref={viewportRef} className={styles.viewport}>
          {/* <div className={`${styles.glow} ${styles.left}`} />
          <div className={`${styles.glow} ${styles.right}`} />
          <div className={`${styles.glow} ${styles.bottom}`} /> */}

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
                    <Image src={img} alt={card.title} fill />
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

                          {index !== title.length - 1 && " "}
                        </React.Fragment>
                      ))}
                    </h1>
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
