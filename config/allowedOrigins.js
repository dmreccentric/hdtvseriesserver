const allowedOrigins = [
  "http://localhost:3000", // Next.js dev server
  "https://hdtvseriesapp.vercel.app", // vercel domain
  "https://hdtvseries.xyz", // root domain
  "https://www.hdtvseries.xyz", // www subdomain
  "http://127.0.0.1:3000", // Sometimes used in dev
];

module.exports = allowedOrigins;
