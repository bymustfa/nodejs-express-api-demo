const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// const dbURL = `mongodb+srv://${process.env.MONGO_ATLAS_US}:${process.env.MONGO_ATLAS_PW}@uzmancokdb.oxtvh.mongodb.net/${process.env.MONGO_ATLAS_DB}?retryWrites=true&w=majority`;
const dbURL = `mongodb://192.168.157.129:27017/uzmanCok`;
//const dbURL = `mongodb://192.168.157.129:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false`;

console.log(dbURL);
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }); //{ useNewUrlParser: true, useUnifiedTopology: true }
mongoose.Promise = global.Promise;

const productRoutes = require("./api/routes/products");
const userRoutes = require("./api/routes/user");

app.use(morgan("dev"));

app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/products", productRoutes);
app.use("/user", userRoutes);

module.exports = app;
