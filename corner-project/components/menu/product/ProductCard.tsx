import React from "react";
import styles from "./product.module.scss";
import { Product } from "@/types/product.types";

import Image from "next/image";

type PropsType = {
  product: Product;
  onClick?: () => void;
};

const ProductCard = ({ product, onClick }: PropsType) => {
  return (
    <div className={styles.product_card} onClick={onClick}>
      <div className={styles.image}>
        <Image
          src={product.image || ""}
          alt={product.name}
          width={468}
          height={476}
        />
      </div>
      <h2 className={styles.name}>{product.name}</h2>
      <p className={styles.description}>{product.description}</p>
      <div className={styles.footer}>
        <div className={styles.info}>
          <div className={styles.tag}>400g</div>
        </div>
        <div className={styles.price}>
          {product.price} <span>DA</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
