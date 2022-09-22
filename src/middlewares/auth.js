const bookModel = require("../models/bookModel");
const userModel = require("../models/userModels");
const jwt = require("jsonwebtoken");
const validator = require("../utils/validators");

const Authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.send({ status: false, msg: "Enter token in the headers" });
    }
    jwt.verify(token, "secretkey", function (err, decodedToken) {
      if (err) {
        return res.status(401).send({ status: false, message: err.message });
      } else {
        req["x-api-key"] = decodedToken;
        next();
      }
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

const Authorisation = async function (req, res, next) {
  try {
    let decodedToken = req["x-api-key"];
    //blog id validation

    let bookId = req.params.bookId;
    if (!validator.isValidObjectId(bookId)) {
      return res.status(403).send({ status: false, msg: " invalid bookId.." });
    }
    let book = await bookModel.findOne({ _id: bookId });

    if (!book)
      return res
        .status(404)
        .send({ status: false, msg: "Requested book not found.." });
    if (decodedToken.userId !== book.userId.toString()) {
      return res.status(403).send({ status: false, msg: " Not authorised .." });
    } else {
      next();
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = {
  Authentication,
  Authorisation,
};
