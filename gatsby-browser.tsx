import type { GatsbyBrowser } from "gatsby";
import "./src/styles/global.css";

export const onClientEntry: GatsbyBrowser["onClientEntry"] = () => {
  console.log("HybridMag site starting...");
};
