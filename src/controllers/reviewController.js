const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const userModels = require("../models/userModels");
const validator = require("../utils/validators");
const moment = require("moment");

const createReview = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let data = req.body;
    let { reviewedBy, reviewedAt, rating, review } = data;

    if (!validator.isValidRequestBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Provide review Details" });
    }
    if (reviewedBy) {
      if (!validator.isValidName(reviewedBy)) {
        return res.status(400).send({
          status: false,
          message:
            "reviewedby is required and first letter of every word must be capital.",
        });
      }
    } else {
      data.reviewedBy = "Guest";
    }

    if (rating) {
      if (!(rating >= 1 && rating <= 5)) {
        return res
          .status(400)
          .send({ status: false, message: " Provide rating between 1 to 5." });
      }
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Rating is required" });
    }

    data.reviewedAt = moment().format("YYYY-MM-DD");

    if (!validator.isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, message: "Invalid bookId" });
    }

    let book1 = await bookModel.findById(bookId);
    if (!book1 || book1.isDeleted == true) {
      return res
        .status(404)
        .send({ status: false, message: " book is not found." });
    }
    data.bookId = bookId;
    let reviewData = await reviewModel.create(data);
    const updatedBook = await bookModel.findByIdAndUpdate(
      { _id: book1._id },
      { $inc: { reviews: +1 } }
    );
    let savedData = await reviewModel
      .findOne({ _id: reviewData._id, bookId: bookId })
      .populate("bookId");

    return res
      .status(201)
      .send({ status: true, message: "review posted", data: savedData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateReviewByID = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!validator.isValidObjectId(bookId)) {
      return res
        .status(404)
        .send({ status: false, message: " Invalid bookid." });
    }
    let validBook = await bookModel.findById(bookId);
    if (!validBook || validBook.isDeleted == true) {
      let messageUser = "Book not found.  ";
      return res.status(404).send({ status: false, message: messageUser });
    }
    let reviewId = req.params.reviewId;
    if (!validator.isValidObjectId(reviewId)) {
      return res
        .status(404)
        .send({ status: false, message: " Invalid reviewId." });
    }

    let validReview = await reviewModel.findOne({
      _id: reviewId,
      bookId: bookId,
    });
    if (!validReview || validReview.isDeleted == true) {
      let messageUser = "Review not found.";
      return res.status(404).send({ status: false, message: messageUser });
    }

    if (!validator.isValidRequestBody(req.body)) {
      return res
        .status(400)
        .send({ status: false, message: "Provide Details for updation." });
    }
    const { review, rating, reviewedBy } = req.body;
    let data = {};
    if (rating) {
      if (!(rating >= 1 && rating <= 5)) {
        return res
          .status(400)
          .send({ status: false, message: "Provide rating between 1 to 5" });
      }
      data.rating = rating;
    }
    if (reviewedBy) {
      if (!validator.isValidName(reviewedBy)) {
        return res.status(400).send({
          status: false,
          message: "provide proper namne for reviewedby",
        });
      }
      data.reviewedBy = reviewedBy;
    }
    if (review) {
      if (!validator.isValid(review)) {
        return res
          .status(400)
          .send({ status: false, message: "Review must be string." });
      }
      data.review = review;
    }

    let updatedReview = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      data,
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "successfully updated",
      data: updatedReview,
    });
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
};

const deleteReviewById = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    const reviewId = req.params.reviewId;

    if (!validator.isValidObjectId(bookId))
      return res.status(403).send({ message: " invalid bookId.." });

    if (!validator.isValidObjectId(reviewId))
      return res.status(403).send({ message: " invalid reviewId.." });

    const book = await bookModel.findById({ _id: bookId, isDeleted: false });
    if (!book)
      return res.status(404).send({ status: false, message: "book not found" });

    if (book.reviews == 0)
      return res
        .status(404)
        .send({ status: false, message: "book have no reviews.. " });

    const reviews = await reviewModel.findOne({
      _id: reviewId,
      bookId: book._id,
      isDeleted: false,
    });

    if (!reviews) {
      return res
        .status(404)
        .send({ status: false, message: "review not found" });
    }

    const deleteReview = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { isDeleted: true }
    );

    const updatedBook = await bookModel.findByIdAndUpdate(
      { _id: book._id },
      { $inc: { reviews: -1 } }
    );

    return res
      .status(200)
      .send({ status: true, message: "review is deleted..." });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
module.exports = { createReview, updateReviewByID, deleteReviewById };
