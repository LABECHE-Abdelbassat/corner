import React from "react";
import styles from "./categories.module.scss";
import { IconType } from "react-icons/lib";

type CradProps = {
  name: string;
  icon: IconType;
  active: boolean;
  onClick?: () => void;
};

const CategoryCard = ({ name, icon: Icon, active, onClick }: CradProps) => {
  return (
    <div
      className={`${styles.category_card} ${active ? styles.active : ""}`}
      onClick={onClick}
    >
      <Icon />
      <span>{name}</span>
    </div>
  );
};

export default CategoryCard;
