import Link from "next/link";
import Image from "next/image";
import styles from "../styles/CategoryCard.module.css";

export default function CategoryCard({ title, desc, href, image }) {
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={title}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, 300px"
        />

        <div className={styles.overlay}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.desc}>{desc}</p>
        </div>
      </div>
    </Link>
  );
}
