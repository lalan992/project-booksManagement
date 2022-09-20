const bookModel = require("../models/bookModel");
const userModel = require("../models/userModels");
const validator = require("../utils/validators");

const createBook = async function (req, res) {
  try {
    const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide Book details",
      });
    }
    let decodedToken = req["x-api-key"];
    //Extract params
    const { title, excerpt, userId, ISBN, category, subcategory, isDeleted } =
      requestBody;
    if (userId) {
      if (!validator.isValidObjectId(userId)) {
        return res.status(403).send({ message: " invalid userId.." });
      }
      if (decodedToken.userId !== userId.toString())
        return res.status(403).send({ message: " Not authorised .." });
    } else {
      return res.status(400).send({
        status: false,
        message: "userId is required",
      });
    }

    // Validation starts
    if (!validator.isValid(title)) {
      return res.status(400).send({
        status: false,
        message: "Book Title must be string. ",
      });
    }
    if (!validator.isValid(ISBN)) {
      return res.status(400).send({
        status: false,
        message: "Book ISBN must be string.",
      });
    }
    if (!validator.isValid(excerpt)) {
      return res.status(400).send({
        status: false,
        message: "Book excerpt must be string.",
      });
    }
    if (!validator.isValid(category)) {
      return res.status(400).send({
        status: false,
        message: "Book category must be string.",
      });
    }

    if (subcategory) {
      if (!validator.isStringsArray(subcategory)) {
        return res.status(400).send({
          status: false,
          message:
            "Book subcategory is an array of strings and don't provide empty string in array.",
        });
      }
    }
    //After validation Book created
    let created = await bookModel.create(requestBody);
    return res.status(201).send({
      status: true,
      message: "Book created successfully..",
      data: created,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const getBooks = async function (req, res) {
  try {
    let { userId, category, subcategory } = req.query;
    // console.log(authorId);
    let query = {};
    if (userId) {
      if (!validator.isValidObjectId(authorId)) {
        return res.status(403).send({ message: " invalid authorId.." });
      } else {
        query.authorId = authorId;
      }
    }
    if (category != null) query.category = category.trim();
    if (subcategory != null) query.subcategory = subcategory.trim();
    query.isDeleted = false;
    let totalBooks = await bookModel.find({
      isDeleted: false,
    });

    if (totalBooks.length === 0) {
      res.status(404).send({ status: false, msg: "No Book found" });
    } else if (Object.keys(query).length === 1) {
      return res.status(200).send({ status: true, data: totalBooks });
    } else {
      let finalFilter = await bookModel.find(query);
      return res.status(200).send({ status: true, data: finalFilter });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createBook, getBooks };
