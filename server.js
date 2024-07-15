import pg from "pg";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { promisify } from "util";
import cors from "cors";

// Create a new pool using the parsed connection details
const { Pool } = pg;

// Loading variables from the .env file
dotenv.config();

// console.log("Database connection details:", {
//   connectionString: process.env.PROD_DB_DATABASE_URL,
// });

const pool = new Pool({
  host: process.env.PROD_DB_HOST,
  port: process.env.PROD_DB_PROD_DB_PORT,
  database: process.env.PROD_DB_DATABASE,
  user: process.env.PROD_DB_USERNAME,
  password: process.env.PROD_DB_PASSWORD,

  //   host: "ccaml3dimis7eh.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com",
  //   port: 5432,
  //   database: "dteaspvf3965d",
  //   user: "ucagh3m0qau2d8",
  //   password: "pd3266c0fff9899e737e642ea55a7bfa60aefe9f92ae99a7e3fdc75397a9b1b0a",
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
});
console.log("-----------PROBLEM just under------------");

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection error:", err.stack);
  });

// Launching express
const server = express();

// Use the json middleware to parse the request body
server.use(express.json());
server.use(cors());

server.get("/", async (req, res) => {
  const q = await pool.query(
    "SELECT * from Partenaires order by partenairesid"
  );
  res.send(q);
});

// Endpoint to retrieve a specific image by partenairesID
server.get("/partenaires/:id/image", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT images FROM Partenaires WHERE partenairesID = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Image not found");
    }
    const imageData = result.rows[0].images;
    if (!imageData) {
      return res.status(404).send("No image data found");
    }
    res.setHeader("Content-Type", "image/png"); // Set appropriate content type
    res.send(imageData);
  } catch (err) {
    res.status(500).send("Error retrieving image");
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () =>
  console.log(`Server is now running in PORT: ${PORT}`)
);
