import express from "express";
import { figmaRouter, authRouter } from "./routes";
import { config } from "dotenv";

config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRouter);
app.use("/figma", figmaRouter);

const PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
  console.log(`Starting node server on PORT ${PORT}...`);
});
