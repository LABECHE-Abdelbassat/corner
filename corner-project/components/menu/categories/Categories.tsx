import React from "react";

import styles from "./categories.module.scss";
import CategoriesSwiper from "./CategoriesSwiper";
import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";

const Categories = () => {
  const title = toWords("Our Menu");
  return (
    <div className={styles.categories}>
      <div className={`appContainer ${styles.categories_container}`}>
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
        <CategoriesSwiper />
      </div>
    </div>
  );
};

export default Categories;
