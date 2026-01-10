import React from "react";

import styles from "./services.module.scss";
import Link from "next/dist/client/link";
import ServicesSwiper from "./ServicesSwiper";
import * as motion from "motion/react-client";
import { toWords } from "@/utils/toWords";

const Services = () => {
  const title = toWords("Building a brand used to be slow, noisy and hard.");
  return (
    <div className={styles.services}>
      <div className={`ps-4 sm:ps-6 lg:ps-10 ${styles.container}`}>
        <div className={`${styles.title} pe-4 sm:pe-6 lg:pe-10`}>
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
                  {word}
                </motion.span>

                {index !== title.length - 1 && " "}
              </React.Fragment>
            ))}
          </h1>

          <h1 className={styles.left}>
            Corner changes that by building your full digital presence brand,
            website, content, and online reputation so you’re easier to
            discover, easier to trust, and easier to reach.
          </h1>
        </div>
      </div>
      <ServicesSwiper />
    </div>
  );
};

export default Services;
