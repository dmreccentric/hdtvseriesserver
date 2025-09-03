const dotenv = require("dotenv");
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const Movie = require("./model/Movie"); // <-- keep .js extension for CJS + mongoose

dotenv.config();

// --- ENV Vars ---
const BOT_TOKEN = process.env.BOT_TOKEN;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

// --- Connect to MongoDB ---
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Setup Telegram Bot ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Remove all emojis from a string
function removeEmojis(str) {
  return str.replace(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu, "").trim();
}

// Updated extractTitle
function extractTitle(messageText) {
  if (!messageText) return null;

  const lines = messageText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  let firstLine = lines[0];

  // Remove emojis first
  firstLine = removeEmojis(firstLine);

  firstLine = firstLine
    .replace(/\b(Season|S\d+|Complete|All Episodes?|Episode \d+)\b/gi, "")
    .replace(/\b(1080p|720p|480p|4k|HD|BluRay|WEBRip|WEB-DL)\b/gi, "")
    .replace(/[\(\)\[\]\{\}]/g, "")
    .replace(/[-_:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return firstLine || null;
}

// --- Search TMDB ---
async function searchTMDB(query) {
  if (!query) return null;

  const movieRes = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}`
  );
  const movieData = await movieRes.json();

  const tvRes = await fetch(
    `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}`
  );
  const tvData = await tvRes.json();

  let best = null;

  if (movieData.results?.length > 0) {
    best = { type: "Movie", ...movieData.results[0] };
  }

  if (tvData.results?.length > 0) {
    const tvBest = { type: "Series", ...tvData.results[0] };
    if (!best || tvBest.popularity > best.popularity) {
      best = tvBest;
    }
  }

  return best;
}

// --- Map TMDB data to Mongo Model ---
function mapTMDBToMovie(result, subtitle = null, link = null) {
  return {
    title: result.title || result.name,
    subtitle, // new field
    link, // new field
    genres: result.genre_ids ? mapGenres(result.genre_ids) : [],
    plot: result.overview || "No description available.",
    rating: result.vote_average || 0,
    img: result.poster_path
      ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
      : null,
    himg: null,
    released: result.release_date
      ? parseInt(result.release_date.split("-")[0])
      : result.first_air_date
      ? parseInt(result.first_air_date.split("-")[0])
      : null,
    language: mapLanguage(result.original_language),
    type: result.type, // "Movie" or "Series"
    trailer: null, // could be fetched separately
    status: null,
  };
}

// --- Map Genre IDs ---
function mapGenres(ids) {
  const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };

  return ids.map((id) => genreMap[id]).filter(Boolean);
}

// --- Map Language ---
function mapLanguage(code) {
  const map = {
    en: "English",
    fr: "French",
    hi: "Hindi",
    ko: "Korean",
    es: "Spanish",
  };
  return map[code] || "others";
}

// --- Extract first link from entities ---
function extractFirstLink(msg) {
  const entities = msg.entities || msg.caption_entities || [];
  for (const entity of entities) {
    if (entity.type === "text_link" && entity.url) {
      return entity.url; // ✅ first clickable link
    }
  }
  return null;
}

// --- Process Telegram Message ---
async function processTelegramPost(chatId, postText, msg) {
  if (!postText) {
    bot.sendMessage(chatId, "⚠️ No text found in post.");
    return;
  }

  const lines = postText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // --- Extract first line as Title ---
  const title = extractTitle(lines[0]);
  if (!title) {
    bot.sendMessage(chatId, "⚠️ No valid title found in post.");
    return;
  }

  // --- Second line as Subtitle (if exists) ---
  const subtitle = lines[1] ? removeEmojis(lines[1]) : null;

  // --- Extract first link (entities first, fallback to regex) ---
  let link = extractFirstLink(msg);
  if (!link) {
    for (let i = 2; i < lines.length; i++) {
      const match = lines[i].match(/https?:\/\/[^\s)]+/i);
      if (match) {
        link = match[0].trim();
        break;
      }
    }
  }

  console.log(`🔎 Extracted title: "${title}"`);
  console.log(`📖 Subtitle: "${subtitle}"`);
  console.log(`🔗 Link: "${link}"`);
  console.log("RAW line[2]:", lines[2]);

  // --- Search TMDB for metadata ---
  const result = await searchTMDB(title);
  if (!result) {
    bot.sendMessage(chatId, `❌ No results found for "${title}" on TMDB.`);
    return;
  }

  const movieData = mapTMDBToMovie(result, subtitle, link);

  try {
    const savedMovie = await Movie.create(movieData);

    bot.sendMessage(
      chatId,
      `✅ Saved to database!\n\n🎬 <b>${savedMovie.title}</b>\n📖 Subtitle: ${
        savedMovie.subtitle || "N/A"
      }\n🔗 Link: ${savedMovie.link || "N/A"}\n⭐ Rating: ${savedMovie.rating}`,
      { parse_mode: "HTML" }
    );
  } catch (err) {
    console.error("❌ Error saving movie:", err.message);
    bot.sendMessage(chatId, "⚠️ Failed to save movie to database.");
  }
}

// --- Bot Listener ---
bot.on("message", async (msg) => {
  // console.log("RAW MSG:", JSON.stringify(msg, null, 2)); // 👀 full dump

  const chatId = msg.chat.id;
  const text = msg.text || msg.caption;

  if (!text) {
    bot.sendMessage(chatId, "⚠️ No text or caption found in this message.");
    return;
  }

  await processTelegramPost(chatId, text, msg);
});
