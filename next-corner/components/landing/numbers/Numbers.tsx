import React from "react";
import { FaUsers, FaShieldAlt } from "react-icons/fa";
import { FaLocationDot, FaRocket } from "react-icons/fa6";
import * as motion from "motion/react-client";

import styles from "./numbers.module.scss";
import { toWords } from "@/utils/toWords";

const Numbers = () => {
  const title = toWords("They already trust us");

  const numbers = [
    { value: "50+", label: "Clients" },
    { value: "69", label: "Wilaya" },
    { value: "7j", label: "Fast delivery" },
    { value: "24/7", label: "Available support" },
  ];
  return (
    <div className={styles.numbers}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-10 ${styles.container}`}>
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
        <div className={styles.layout}>
          {numbers.map((number, index) => (
            <motion.div
              initial={{
                opacity: 0,
                y: 16,
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.2,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                amount: "all",
                once: true,
              }}
              className={styles.number}
              key={index}
            >
              <h1>{number.value}</h1>
              <span>{number.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Numbers;
