// components/TopLoader.js
import NProgress from "nprogress";
import { useEffect } from "react";
import { useRouter } from "next/router";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

export default function TopLoader({ isLoading }) {
  useEffect(() => {
    if (isLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isLoading]);

  return null;
}
