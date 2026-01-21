import React from "react";
import styles from "./panner.module.scss";

import img from "@/public/images/public-banner.webp";
import Image from "next/image";

const PannerCard = () => {
  return (
    <div className={styles.panner_card}>
      <Image src={img} alt="panner-img" />
    </div>
  );
};

export default PannerCard;
