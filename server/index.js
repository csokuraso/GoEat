const express = require("express");
const cors = require("cors");

const restaurantsRouter = require("./routes/restaurants");
const reviewsRouter = require("./routes/reviews");
const ordersRouter = require("./routes/orders");
const usersRouter = require("./routes/users");
const menuRouter = require("./routes/menu");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", require("./routes/users"));

app.get("/", (req, res) => {
  res.send("API работает");
});

app.use("/restaurants", restaurantsRouter);
app.use("/reviews", reviewsRouter);
app.use("/orders", ordersRouter);
app.use("/users", usersRouter);
app.use("/menu", menuRouter);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});