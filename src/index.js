const express = require("express");
const bodyParser = require("body-parser");
const route = require("./route/routes.js");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://Akhilesh12168:FZeWCA6RSCVaAqQK@cluster0.enuzw59.mongodb.net/group6Database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
