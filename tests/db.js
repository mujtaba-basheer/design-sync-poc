const pg = require("pg");
const { config } = require("dotenv");
config();

const client = new pg.Client({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const init = async () => {
  try {
    await client.connect();
    const resp = await client.query("SELECT 1;");
    console.log(resp);
    await client.end();
  } catch (error) {
    console.error(error);
  }
};

init();
