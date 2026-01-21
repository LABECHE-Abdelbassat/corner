import React from "react";
import styles from "./location.module.scss";
import { Location } from "@/types/location.types";

import { FaLocationDot } from "react-icons/fa6";

type Props = {
  location: Location;
};

const LocationItem = ({ location }: Props) => {
  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <h2 className={styles.item_title}>
          <FaLocationDot /> {location.city}
        </h2>
        <a href={`tel:${location.phone}`}>{location.phone}</a>
      </div>
      <div className={styles.map_section}>
        <div className={styles.gmap_frame}>
          <iframe
            src={location.src}
            width="100%"
            height="300"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default LocationItem;
