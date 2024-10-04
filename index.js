const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");
// import RedisStore from "connect-redis";

let RedisStore = require("connect-redis").default;

console.log(REDIS_URL);
console.log(REDIS_PORT);

let redisClient = redis.createClient({
  socket: {
    host: REDIS_URL,
    port: REDIS_PORT,
    tls: false,
  },
});
redisClient.connect().catch(console.error);

// let redisClient = redis
//   .createClient({
//     url: `redis://${REDIS_URL}@${REDIS_PORT}`,
//   })

// let redisClient = redis.createClient({
//   legacyMode: true,
//   socket: {
//     port: REDIS_PORT,
//     host: REDIS_URL,
//   },
// });

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => console.log("successfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.set("trust proxy");
app.use(cors({}));
app.use(
  session({
    // proxy: true,
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET, // random secret we store on Express server that we use when handling sessions, can be any string
    cookie: {
      secure: false, // would only work with HTTPS
      httpOnly: true, // only used for scenarios where JS on the browser won't be able to access it
      maxAge: 30000,
    }, // cookie sent back to the user, find on express-sessions docs
  })
);
app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("<h2>Hi There!! Pepperoni Moocher</h2>");
  console.log("yeahyeah");
});
// Set up a quick route for testing purposes - "/" is route path.
// For if anyone sends a GET request to this path.

// If someone sends a request with /posts, it will send to postRouter. postRouter will strip off /posts.
// Using api is useful so you know request is for API in case we're hosting frontend and backend in same domain. Versioning means different versions can run side by side.
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000; // Port we want the Express server to listen on
// if the env var called PORT has been set, otherwise default to 3000

app.listen(port, () => console.log(`listening on port ${port}`)); // For when server comes up
