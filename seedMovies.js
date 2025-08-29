require("dotenv").config();

const connectDB = require("./db/connectDB");
const Movie = require("./model/Movie");

const jsonMovies = require("./mainMovies.json");

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Movie.deleteMany();
    await Movie.create(jsonMovies);
    console.log("Success!!!!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
