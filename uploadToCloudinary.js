// require("dotenv").config();
// const fs = require("fs");
// const path = require("path");
// const cloudinary = require("cloudinary").v2;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Path to your images folder
// const imagesFolder = path.join(__dirname, "images");

// // Load movies JSON
// const movies = require("./movies.json");

// const uploadImages = async () => {
//   console.log("🚀 Starting image upload to Cloudinary...");

//   for (let movie of movies) {
//     try {
//       const imagePath = path.join(imagesFolder, movie.img);

//       // Check if image exists
//       if (!fs.existsSync(imagePath)) {
//         console.warn(`⚠️  Image not found for "${movie.title}": ${movie.img}`);
//         continue;
//       }

//       console.log(`⏳ Uploading "${movie.title}"...`);

//       // Upload to Cloudinary
//       const result = await cloudinary.uploader.upload(imagePath, {
//         folder: "telegram_movies", // optional folder in Cloudinary
//         public_id: path.parse(movie.img).name, // keep original name
//         overwrite: true,
//       });

//       // Update the img field with Cloudinary URL
//       movie.img = result.secure_url;
//       console.log(`✅ Uploaded "${movie.title}": ${movie.img}`);
//     } catch (error) {
//       console.error(`❌ Error uploading "${movie.title}":`, error.message);
//     }
//   }

//   // Save updated JSON
//   fs.writeFileSync("movies_cloudinary.json", JSON.stringify(movies, null, 2));
//   console.log(
//     "🎉 All images uploaded. Updated JSON saved as movies_cloudinary.json"
//   );
// };

// uploadImages();

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Path to your images folder
const imagesFolder = path.join(__dirname, "images2");

// Load movies JSON
const movies = require("./movies.json");

const uploadImages = async () => {
  console.log("🚀 Starting image upload to Cloudinary...");

  for (let movie of movies) {
    try {
      // Use himg field for local image
      const imagePath = path.join(imagesFolder, movie.himg);

      // Check if image exists
      if (!fs.existsSync(imagePath)) {
        console.warn(`⚠️  Image not found for "${movie.title}": ${movie.himg}`);
        continue;
      }

      console.log(`⏳ Uploading "${movie.title}"...`);

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(imagePath, {
        folder: "telegram_movies", // optional folder in Cloudinary
        public_id: path.parse(movie.himg).name, // keep original name
        overwrite: true,
      });

      // Update the himg field with Cloudinary URL
      movie.himg = result.secure_url;
      console.log(`✅ Uploaded "${movie.title}": ${movie.himg}`);
    } catch (error) {
      console.error(`❌ Error uploading "${movie.title}":`, error.message);
    }
  }

  // Save updated JSON
  fs.writeFileSync("movies_cloudinary.json", JSON.stringify(movies, null, 2));
  console.log(
    "🎉 All images uploaded. Updated JSON saved as movies_cloudinary.json"
  );
};

uploadImages();
