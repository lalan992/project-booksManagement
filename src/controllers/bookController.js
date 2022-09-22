const bookModel = require("../models/bookModel");
const userModel = require("../models/userModels");
const reviewModel = require("../models/reviewModel");
const validator = require("../utils/validators");
const moment = require("moment");

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
    const {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      releasedAt,
      isDeleted,
    } = requestBody;
    if (userId) {
      if (!validator.isValidObjectId(userId)) {
        return res
          .status(403)
          .send({ status: false, message: " invalid userId.." });
      }
      if (decodedToken.userId !== userId.toString())
        return res
          .status(403)
          .send({ status: false, message: " Not authorised .." });
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
        message: "Book Title is required and must be strings. ",
      });
    }
    const validTitle = await bookModel.findOne({ title: req.body.title });
    if (validTitle) {
      return res.status(400).send({
        status: false,
        message: "Title already exists...",
      });
    }
    if (!validator.isValidISBN(ISBN)) {
      return res.status(400).send({
        status: false,
        message: "Book ISBN must be string and 14 digits with '-'.",
      });
    }
    const validISBN = await bookModel.findOne({ ISBN: req.body.ISBN });
    if (validISBN) {
      return res.status(400).send({
        status: false,
        message: "ISBN already exists...",
      });
    }

    if (!validator.isValid(excerpt)) {
      return res.status(400).send({
        status: false,
        message: "Book excerpt is required and must be strings.",
      });
    }
    if (!validator.isValid(category)) {
      return res.status(400).send({
        status: false,
        message: "Book category is required and must be strings.",
      });
    }

    if (!validator.isValid(subcategory)) {
      return res.status(400).send({
        status: false,
        message: "Book subcategory  is required and must be strings.",
      });
    }

    if (!releasedAt) {
      return res.status(400).send({
        status: false,
        message:
          "Book releasedAt  is required and must be strings in this format 'YYYY-MM-DD'.",
      });
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
    // console.log(userId);
    let query = {};
    if (userId) {
      if (!validator.isValidObjectId(userId)) {
        return res.status(403).send({ message: "invalid userId.." });
      } else {
        query.userId = userId;
      }
    }
    if (category) query.category = category.trim();
    if (subcategory) query.subcategory = subcategory.trim();
    query.isDeleted = false;
    let totalBooks = await bookModel
      .find({
        isDeleted: false,
      })
      .select({
        updatedAt: 0,
        createdAt: 0,
        isDeleted: 0,
        ISBN: 0,
        subcategory: 0,
        __v: 0,
      })
      .sort({ title: 1 });

    if (totalBooks.length === 0) {
      return res.status(404).send({ status: false, msg: "No Book found" });
    } else if (Object.keys(query).length === 1) {
      return res
        .status(200)
        .send({ status: true, message: "success", data: totalBooks });
    } else {
      let finalFilter = await bookModel
        .find(query)
        .select({
          updatedAt: 0,
          createdAt: 0,
          isDeleted: 0,
          ISBN: 0,
          subcategory: 0,
          __v: 0,
        })
        .sort({ title: 1 });
      if (finalFilter.length > 0) {
        return res
          .status(200)
          .send({ status: true, message: "success", data: finalFilter });
      } else {
        return res.status(404).send({ status: false, msg: "No Book found" });
      }
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
const getBookById = async function (req, res) {
  try {
    let id = req.params.bookId;
    let book = await bookModel.findById(id);
    if (!book || book.isDeleted === true) {
      return res.status(404).send({
        status: false,
        message: "book not found..",
      });
    }
    let reviews = await reviewModel.find({ bookId: id, isDeleted: false });
    let result = book._doc;
    result.reviewsData = reviews;
    return res
      .status(200)
      .send({ status: true, message: "success", data: result });
  } catch {
    return res.status(500).send({ message: err.message });
  }
};
const updateBook = async function (req, res) {
  try {
    let id = req.params.bookId;
    let book = await bookModel.findById(id);
    if (!book || book.isDeleted === true) {
      return res.status(404).send({
        status: false,
        message: "book not found..",
      });
    }
    const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: " Please provide updation details",
      });
    }
    // - title  - excerpt  - release date - ISBN

    if (req.body.title) {
      if (validator.isValid(req.body.title)) {
        const validTitle = await bookModel.findOne({ title: req.body.title });
        if (validTitle) {
          return res.status(400).send({
            status: false,
            message: "Title already exists...",
          });
        }
        book.title = req.body.title.trim();
      } else {
        return res.status(400).send({
          status: false,
          message: "Title must be string.",
        });
      }
    }
    if (req.body.excerpt) {
      if (validator.isValid(req.body.excerpt)) {
        book.excerpt = req.body.excerpt.trim();
      } else {
        return res.status(400).send({
          status: false,
          message: "excerpt must be string.",
        });
      }
    }
    if (req.body.ISBN) {
      if (validator.isValidISBN(req.body.ISBN)) {
        const validISBN = await bookModel.findOne({ ISBN: req.body.ISBN });
        if (validISBN) {
          return res.status(400).send({
            status: false,
            message: "ISBN already exists...",
          });
        }
        book.ISBN = req.body.ISBN.trim();
      } else {
        return res.status(400).send({
          status: false,
          message: "Book ISBN must be string and 14 digits with '-'.",
        });
      }
    }
    if (req.body.releasedAt) {
      book.releasedAt = req.body.releasedAt;
    }
    // book.releasedAt = moment();
    let book2 = await bookModel.findByIdAndUpdate({ _id: id }, book, {
      new: true,
    });
    return res
      .status(200)
      .send({ status: true, message: "successfully updated", data: book2 });
  } catch (err) {
    return res.status(500).send({ status: false,message: err.message });
  }
};

const deleteBookById = async function (req, res) {
  try {
    let id = req.params.bookId;

    let Book = await bookModel.findById(id);

    if (Book.isDeleted == false) {
      let Update = await bookModel.findOneAndUpdate(
        { _id: id },
        { isDeleted: true, deletedAt: Date() },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "successfully deleted Book",
      });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "Book not found." });
    }
  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBookById,
};
