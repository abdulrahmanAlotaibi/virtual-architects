/** @type {import('next').NextConfig} */
const nextConfig = {
  // A static site: `npm run build` writes plain HTML, CSS and JS to out/.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
