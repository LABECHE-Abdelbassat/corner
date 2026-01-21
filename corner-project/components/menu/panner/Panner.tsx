"use client";
import styles from "./panner.module.scss";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import PannerCard from "./PannerCard";
import { useRef } from "react";

const Panner = () => {
  const pagRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className={styles.panner}>
      <div className={`appContainer ${styles.panner_container}`}>
        <div className={styles.swiperWrap}>
          <Swiper
            loop={true}
            spaceBetween={30}
            pagination={{
              el: "#containerForBullets",
              type: "bullets",
              bulletClass: "swiper-custom-bullet",
              bulletActiveClass: "swiper-custom-bullet-active",
              clickable: true,
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            modules={[Pagination, Navigation, Autoplay]}
            className={`mySwiper ${styles.mySwiper}`}
          >
            <SwiperSlide>
              <PannerCard />
            </SwiperSlide>
            <SwiperSlide>
              <PannerCard />
            </SwiperSlide>
            <SwiperSlide>
              <PannerCard />
            </SwiperSlide>
          </Swiper>
          <div id="containerForBullets" className={styles.pagin}></div>
        </div>
      </div>
    </div>
  );
};

export default Panner;
