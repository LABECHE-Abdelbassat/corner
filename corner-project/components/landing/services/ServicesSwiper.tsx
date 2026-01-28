"use client";

import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";

import "swiper/css/pagination";
import "swiper/css";
import styles from "./services.module.scss";

import srvImg1 from "@/public/images/Smart-QR-Digital-Menu.webp";
import srvImg2 from "@/public/images/NFC-Plaques-&-NFC-Cards.webp";
import srvImg3 from "@/public/images/Visual-Identity-&-Landing-Page.webp";
import srvImg4 from "@/public/images/Digital-Presence(1).webp";
import srvImg5 from "@/public/images/Content2.webp";
import Image from "next/image";

import { useTranslations } from "next-intl";

const ServicesSwiper = () => {
  const t = useTranslations("HomePage.Services");

  const services = [
    {
      src: srvImg1,
      title: t("cards.menu.title"),
      description: t("cards.menu.description"),
      alt: t("cards.menu.alt"),
    },
    {
      src: srvImg2,
      title: t("cards.nfc.title"),
      description: t("cards.nfc.description"),
      alt: t("cards.nfc.alt"),
    },
    {
      src: srvImg3,
      title: t("cards.identity.title"),
      description: t("cards.identity.description"),
      alt: t("cards.identity.alt"),
    },
    {
      src: srvImg4,
      title: t("cards.presence.title"),
      description: t("cards.presence.description"),
      alt: t("cards.presence.alt"),
    },
    {
      src: srvImg5,
      title: t("cards.content.title"),
      description: t("cards.content.description"),
      alt: t("cards.content.alt"),
    },
  ];

  return (
    <div className={styles.services_swiper}>
      <Swiper
        spaceBetween={30}
        speed={1000}
        slidesOffsetAfter={16}
        navigation={{
          nextEl: `.swiper-button-next`,
          prevEl: `.swiper-button-prev`,
        }}
        slidesPerView="auto"
        modules={[Pagination, Navigation]}
        className={styles.swiper}
      >
        {services.map((service, i) => {
          const words = toWords(service.title);

          return (
            <SwiperSlide key={i}>
              <div className={styles.service_slide}>
                <div className={styles.image}>
                  <Image src={service.src} alt={service.alt} />
                </div>

                <div className={styles.info}>
                  <h1>
                    {words.map((word, index) => (
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
                        {index !== words.length - 1 && " "}
                      </React.Fragment>
                    ))}
                  </h1>

                  <span className={styles.description}>
                    {service.description}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className={`${styles.pagin} pe-4 sm:pe-6 lg:pe-10`}>
        <div className="swiper-button-prev prev">
          <IoIosArrowBack />
        </div>
        <div className="swiper-button-next next">
          <IoIosArrowForward />
        </div>
      </div>
    </div>
  );
};

export default ServicesSwiper;
