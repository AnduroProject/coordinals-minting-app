/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  publicRuntimeConfig: {
    apiUrl:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3002" // development api
        : "https://api.mainnet.araafal.com", // production api
  },
  images: {
    domains: [
      "numadlabs-coordinals-test.s3.eu-central-1.amazonaws.com",
      "images.unsplash.com",
    ],
  },
};

export default nextConfig;
