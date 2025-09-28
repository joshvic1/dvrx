import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <div className={styles.wrapper}>
      <footer className={styles.footer}>
        <div className={styles.top}>
          <div className={styles.col}>
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Press</a>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Support</h4>
            <ul>
              <li>
                <a href="#">Help center</a>
              </li>
              <li>
                <a href="#">Returns</a>
              </li>
              <li>
                <a href="#">Shipping</a>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Get the app</h4>
            <div className={styles.badges}>
              <a href="#" aria-label="App Store" className={styles.badge}>
                <svg
                  viewBox="0 0 384 512"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M318.7 268.3c-.3-37.3 30.5-55.2 31.8-56.1-17.4-25.4-44.5-28.9-54.1-29.3-22.9-2.4-44.7 13.5-56.3 13.5s-29.5-13.2-48.6-12.8c-25 .4-48 14.7-60.8 37.3-25.8 44.5-6.6 110 18.5 146.1 12.2 17.4 26.7 36.8 45.6 36 18.5-.7 25.5-11.6 47.8-11.6s28.6 11.6 48.2 11.2c19.9-.3 32.5-17.8 44.7-35.3 14.1-20.7 19.9-40.7 20.2-41.8-.4-.2-38.8-14.9-39.1-58.5zM255.1 96.4c10.2-12.4 17.1-29.6 15.2-46.8-14.7.6-32.5 9.8-43.1 22.1-9.5 10.9-17.8 28.4-15.6 45.3 16.3 1.3 33.1-8.3 43.5-20.6z" />
                </svg>
                <span>App Store</span>
              </a>
              <a href="#" aria-label="Google Play" className={styles.badge}>
                <svg
                  viewBox="0 0 512 512"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M325.3 234.3L104.6 34.5C100.1 30.8 93.7 32.3 90.6 37.9c-6.2 11.1-11.4 23.6-15.3 37.4-4 14.1-6.5 28.5-7.4 42.8-.9 14.4-.3 28.3 1.8 41.2 2.1 12.7 5.6 24.4 10.5 34.9 2.5 5.4 5.4 10.5 8.5 15.2 3 4.7 6.2 9 9.7 12.9l220.8 199.7c12.3-15.8 22.1-35.4 28.6-57.3 6.3-21.2 9.2-43.2 8.5-64.6-.8-21.4-5.4-42.1-13.1-61.6-7.8-19.5-18.7-37.7-32.1-53.4z" />
                </svg>
                <span>Google Play</span>
              </a>
            </div>

            <div className={styles.social}>
              <a href="#" aria-label="Instagram">
                <svg
                  viewBox="0 0 448 512"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9S160.5 370.8 224.1 370.8 339 319.5 339 255.9 287.7 141 224.1 141zm146.4-41c0 14.3-11.6 25.9-25.9 25.9s-25.9-11.6-25.9-25.9 11.6-25.9 25.9-25.9 25.9 11.6 25.9 25.9zm76.1 41.4c-1.7-35.9-9.9-67.7-36.2-93.9S364.4 9.7 328.5 8C292.6 6.3 182.6 6.3 146.7 8 110.8 9.7 79 17.9 52.8 44.1 26.6 70.3 18.4 102.1 16.7 138c-1.7 35.9-1.7 145.9 0 181.8 1.7 35.9 9.9 67.7 36.1 93.9s58 34.5 93.9 36.2c35.9 1.7 145.9 1.7 181.8 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.1-93.9 1.7-35.9 1.7-145.9 0-181.8z" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg
                  viewBox="0 0 320 512"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M279.14 288l14.22-92.66h-88.91V127.6c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.24 44.38-121.24 124.72v70.62H22.89V288h81.23v224h100.2V288z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg
                  viewBox="0 0 512 512"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M459.4 151.7c.3 4.5.3 9 .3 13.6 0 138.7-105.6 298.8-298.8 298.8-59.5 0-114.8-17.2-161.4-47 8.4 1 16.8 1.5 25.6 1.5 49.3 0 94.6-16.8 130.5-45.3-46.1-1-84.8-31.2-98.1-72.8 6.5 1 13.1 1.6 19.9 1.6 9.6 0 19-1.3 27.9-3.7-48.1-9.7-84.3-52.1-84.3-103v-1.3c14.1 7.9 30.3 12.7 47.5 13.3-28.1-18.8-46.5-50.9-46.5-87.4 0-19.2 5.1-37.3 14.1-52.8 51.5 63.3 128.7 104.8 215.4 109.3-1.8-7.7-2.8-15.8-2.8-24.1 0-58.1 47.1-105.2 105.2-105.2 30.2 0 57.5 12.7 76.7 33.1 23.9-4.5 46.4-13.4 66.5-25.4-7.9 24.6-24.6 45.2-46.4 58.2 21.2-2.4 41.5-8.1 60.3-16.2-14 20.8-31.6 39.2-51.9 54z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © DVRX 2025 &nbsp;|&nbsp; <a href="#">Terms</a> ·{" "}
            <a href="#">Privacy</a>
          </p>
          <div className={styles.payments}>
            <svg viewBox="0 0 64 40" height="22" width="40">
              <rect width="64" height="40" rx="6" fill="#1a1f71" />
              <text
                x="8"
                y="26"
                fill="#fff"
                font-size="18"
                font-family="Arial, sans-serif"
              >
                VISA
              </text>
            </svg>
            <svg viewBox="0 0 64 40" height="22" width="40">
              <rect width="64" height="40" rx="6" fill="#EB001B" />
              <rect x="32" width="32" height="40" rx="6" fill="#F79E1B" />
              <circle cx="32" cy="20" r="20" fill="#FF5F00" />
            </svg>
          </div>
        </div>
      </footer>
    </div>
  );
}
