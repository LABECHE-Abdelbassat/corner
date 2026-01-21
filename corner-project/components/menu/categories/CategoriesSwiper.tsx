"use client";
import React, { useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import * as motion from "motion/react-client";
import styles from "./categories.module.scss";

import { FaPizzaSlice } from "react-icons/fa6";

import "swiper/css";
import "swiper/css/free-mode";
import CategoryCard from "./CategoryCard";
import { IconType } from "react-icons/lib";

const CategoriesSwiper = () => {
  const categories = [
    { name: "Pizza", icon: FaPizzaSlice, id: 0 },
    { name: "Pizza", icon: FaPizzaSlice, id: 1 },
    { name: "Pizza", icon: FaPizzaSlice, id: 2 },
    { name: "Pizza", icon: FaPizzaSlice, id: 3 },
    { name: "Pizza", icon: FaPizzaSlice, id: 4 },
    { name: "Pizza", icon: FaPizzaSlice, id: 5 },
  ];

  const [active, setActive] = useState(categories[0].id);

  const handelCategoryClick = (category: {
    name: string;
    icon: IconType;
    id: number;
  }) => {
    setActive(category.id);
  };

  return (
    <div className={styles.categories_swiper}>
      <Swiper
        slidesPerView={"auto"}
        spaceBetween={10}
        freeMode={true}
        modules={[Navigation, FreeMode]}
        className="mySwiper"
      >
        {categories.map((category, index) => (
          <SwiperSlide key={index} className={styles.slide}>
            <motion.div
              initial={{ translateY: 25, opacity: 0 }}
              whileInView={{ translateY: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{
                once: true,
              }}
            >
              <CategoryCard
                name={category.name}
                icon={category.icon}
                active={active === category.id}
                onClick={() => handelCategoryClick(category)}
              />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CategoriesSwiper;
