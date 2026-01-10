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
import test from "@/public/images/PaymentPayment-Terminal-LanguageUS-ModeDark-min.png";
import Image from "next/image";

const ServicesSwiper = () => {
  const services = [
    {
      src: test,
      title: "Smart Handheld",
      description: "The first terminal built for hospitality.",
    },
    {
      src: test,
      title: "Smart Handheld",
      description: "The first terminal built for hospitality.",
    },
    {
      src: test,
      title: "Smart Handheld",
      description: "The first terminal built for hospitality.",
    },
    {
      src: test,
      title: "Smart Handheld",
      description: "The first terminal built for hospitality.",
    },
    {
      src: test,
      title: "Smart Handheld",
      description: "The first terminal built for hospitality.",
    },
  ];

  return (
    <div className={`${styles.services_swiper}`}>
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
        className={`${styles.swiper}`}
      >
        {services.map((service, i) => {
          const title = toWords(service.title);
          return (
            <SwiperSlide key={i}>
              <div className={styles.service_slide}>
                <div className={styles.image}>
                  <Image src={service.src} alt={service.title} />
                </div>
                <div className={styles.info}>
                  <h1>
                    {title.map((word, index) => (
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
        <div className={`swiper-button-prev prev`}>
          <IoIosArrowBack onClick={() => {}} />
        </div>
        <div className={`swiper-button-next next`}>
          <IoIosArrowForward onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default ServicesSwiper;
