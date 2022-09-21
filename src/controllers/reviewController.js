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
        .send({ status: false, msg: "Provide review Details" });
    }

    if (!validator.isValidName(reviewedBy)) {
      return res
        .status(400)
        .send({ status: false, msg: "reviewedby is required" });
    }

    if (rating) {
      if (!(rating >= 1 && rating <= 5)) {
        return res
          .status(400)
          .send({ status: false, msg: " Provide rating between 1 to 5" });
      }
    } else {
      return res.status(400).send({ status: false, msg: "Rating is required" });
    }

    data.reviewedAt = moment().format("YYYY-MM-DD");

    if (!validator.isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, msg: "Invalid bookId" });
    }

    let book1 = await bookModel.findById(bookId);
    if (!book1 || book1.isDeleted == true) {
      return res
        .status(404)
        .send({ status: false, msg: " book is not found." });
    }
    data.bookId = bookId;
    let savedData = await reviewModel.create(data);
    const updatedBook = await bookModel.findByIdAndUpdate(
      { _id: book1._id },
      { $inc: { reviews: +1 } }
    );

    return res
      .status(201)
      .send({ status: true, message: "review posted", data: savedData });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

const updateReviewByID = async function (req, res) {
  try {
    let Id = req.params.bookId;
    if (!validator.isValidObjectId(Id)) {
      return res.status(404).send({ status: false, msg: " Invalid bookid." });
    }
    let validBookId = await bookModel.findById(Id);
    if (!validBookId || validBookId.isDeleted == true) {
      let msgUser = "Book not found.  ";
      return res.status(404).send({ status: false, message: msgUser });
    }
    let reviewId = req.params.reviewId;
    if (!validator.isValidObjectId(reviewId)) {
      return res.status(404).send({ status: false, msg: " Invalid reviewId." });
    }

    let validReview = await reviewModel.findById(reviewId);
    if (!validReview || validReview.isDeleted == true) {
      let msgUser = " Review not found.";
      return res.status(404).send({ status: false, message: msgUser });
    }
    const { review, rating, reviewedBy } = req.body;
    if (!validator.isValidRequestBody(req.body)) {
      return res
        .status(400)
        .send({ status: false, msg: "Provide Details for updation." });
    }
    if (rating) {
      if (!(rating >= 1 && rating <= 5)) {
        return res
          .status(400)
          .send({ status: false, msg: " Provide rating between 1 to 5" });
      }
    }
    if (reviewedBy) {
      if (!validator.isValidName(reviewedBy)) {
        return res
          .status(400)
          .send({ status: false, msg: " provide proper namne for reviewedby" });
      }
    }
    if (review) {
      if (!validator.isValid(review)) {
        return res
          .status(400)
          .send({ status: false, msg: "Review must be string." });
      }
    }
    let data = {};
    data.rating = rating;
    data.reviewedBy = reviewedBy;
    data.review = review;

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
    return res.status(400).send({ status: false, msg: error.message });
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
      return res.status(403).send({ status: false, message: "book not found" });

    if (book.reviews == 0)
      return res
        .status(403)
        .send({ status: false, message: "book have no reviews.. " });

    const reviews = await reviewModel.findOne({
      _id: reviewId,
      bookId: book._id,
      isDeleted: false,
    });

    if (!reviews)
      return res
        .status(403)
        .send({ status: false, message: "review not found" });

    const deleteReview = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { isDeleted: true }
    );

    // updatedReviews = book.reviews - 1;
    const updatedBook = await bookModel.findByIdAndUpdate(
      { _id: book._id },
      { $inc: { reviews: -1 } }
    );

    return res
      .status(200)
      .send({ status: true, message: "review is deleted..." });
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};
module.exports = { createReview, updateReviewByID, deleteReviewById };
