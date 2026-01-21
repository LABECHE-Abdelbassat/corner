import React from "react";
import styles from "./location.module.scss";
import LocationItem from "./LocationItem";

import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";

const Location = () => {
  const locations = [
    {
      city: "Sidi Bel Abbes",
      phone: "0557051465",
      src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3260.752268585771!2d-0.6309588247720594!3d35.18772655692669!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7f014cc4e70d95%3A0x2b99ab9801286e65!2sUNCLEWOOD!5e0!3m2!1sen!2sdz!4v1768669028156!5m2!1sen!2sdz",
    },
  ];

  const title = toWords("Our Locations");
  return (
    <div className={styles.location}>
      <div className={`appContainer ${styles.location_container}`}>
        <h1 className={styles.title}>
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
        </h1>
        <div className={styles.locations}>
          {locations.map((location, index) => (
            <LocationItem key={index} location={location} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Location;
