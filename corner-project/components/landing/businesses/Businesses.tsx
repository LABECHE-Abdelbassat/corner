import styles from "./businesses.module.scss";
import BusinessesSwiper from "./BusinessesSwiper";

const Businesses = () => {
  return (
    <div className={styles.businesses}>
      <div className={`${styles.container}`}>
        <BusinessesSwiper />
      </div>
    </div>
  );
};

export default Businesses;
