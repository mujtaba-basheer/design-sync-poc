const redis = require("redis");

const client = redis.createClient({
  password: "qwerty@123",
});

const init = async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
  const state = "qwerty";
  await client.set("state", state);
  const storedState = await client.get("state");

  console.log({ state, storedState, nullState: await client.get("fdfd") });
  await client.del("state");
  client.disconnect();
};

init();
