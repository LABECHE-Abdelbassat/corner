"use client";
import React, { useState } from "react";
import styles from "./product.module.scss";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product.types";

import { toWords } from "@/utils/toWords";
import * as motion from "motion/react-client";
import Drawer from "@mui/material/Drawer";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import img from "@/public/images/Pizza_img_3.webp";

const ProductList = () => {
  const products = [
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
    {
      name: "Pizza Margherita",
      description:
        "Sauce tomate, Mozzarella, Gouda, Tomate cerise, Olives, Anchois",
      tags: [],
      price: 750,
      image:
        "https://upload.bowwe.com/domain/59891/images/IMg/Pizza/Pizza_img_3.webp?343228.6000000015",
    },
  ];

  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // md = 900px by default

  const title = toWords("Pizza");

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  const Details = () => {
    if (!selectedProduct) return <p>No product selected</p>;

    return (
      <div className={`appContainer ${styles.drawer_container}`}>
        <div className={styles.drawer_image}>
          {/* Render only if you have a URL */}
          {selectedProduct.image && (
            <Image
              src={selectedProduct.image}
              alt={selectedProduct.name}
              width={468}
              height={476}
            />
          )}
        </div>

        <h2 style={{ margin: 0 }}>{selectedProduct.name}</h2>
        <p style={{ marginTop: 8 }}>{selectedProduct.description}</p>
        <div style={{ marginTop: 12, fontWeight: 600 }}>
          {selectedProduct.price} <span>DZD</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.product}>
      <div className={`appContainer ${styles.product_container}`}>
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

        <div className={styles.products}>
          {products.map((product, i) => (
            <motion.div
              initial={{ translateY: 25, opacity: 0 }}
              whileInView={{ translateY: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              viewport={{
                once: true,
              }}
              key={i}
            >
              <ProductCard
                product={product}
                onClick={() => handleProductClick(product)}
              />
            </motion.div>
          ))}
        </div>
      </div>
      {isDesktop ? (
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          slotProps={{
            paper: {
              sx: { borderRadius: 2, overflow: "hidden" },
            },
          }}
        >
          <DialogContent sx={{ p: 2 }}>
            <Details />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              sx: {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                overflow: "hidden",
                maxHeight: "85vh",
              },
            },
          }}
        >
          <div className={styles.drawer_content}>
            <Details />
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default ProductList;
