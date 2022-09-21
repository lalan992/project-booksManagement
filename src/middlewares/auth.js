const bookModel = require("../models/bookModel");
const userModel = require("../models/userModels");
const jwt = require("jsonwebtoken");
const validator = require("../utils/validators");

const Authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.send({ msg: "Error : enter a token" });
    }
    jwt.verify(token, "secretkey", function (err, decodedToken) {
      if (err) {
        return res.status(401).send({ msg: "invalid token" });
      } else {
        req["x-api-key"] = decodedToken;
        next();
      }
    });
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};

const Authorisation = async function (req, res, next) {
  try {
    let decodedToken = req["x-api-key"];
    //blog id validation

    let bookId = req.params.bookId;
    if (!validator.isValidObjectId(bookId)) {
      return res.status(403).send({ msg: " invalid bookId.." });
    }
    let book = await bookModel.findOne({ _id: bookId });

    if (!book)
      return res.status(404).send({ msg: "Requested book not found.." });
    if (decodedToken.userId !== book.userId.toString()) {
      return res.status(403).send({ msg: " Not authorised .." });
    } else {
      next();
    }
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};

module.exports = {
  Authentication,
  Authorisation,
};
