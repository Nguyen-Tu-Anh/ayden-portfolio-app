import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // Let phones on the local Wi-Fi load dev assets (HMR, client JS) via the LAN IP.
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
