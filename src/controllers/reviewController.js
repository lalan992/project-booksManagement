const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const userModels = require("../models/userModels");

const updateReviewByID = async function (req, res) {
  try {
    let Id = req.params.bookId;
    let validBookId = await bookModel.findById(Id).select({ _id: 1 });
    if (!validBookId) {
      let msgUser = "please enter a valid BookID";
      return res.status(404).send(msgUser);
    }
    let reviewId = req.params.reviewId;
    let validReviewID = await reviewModel.findById(Id).select({ _id: 1 });
    if (!validReviewId) {
      let msgUser = "please enter a valid Review ID";
      return res.status(404).send(msgUser);
    }
    let updatedReview = await reviewModel.findOneAndUpdate(
      { _id: req.paramsnid },
      {
        $set: {
          bookId: { type: ObjectId, require: true, ref: "Book" },
          reviewedBy: { type: String, require: true, default: "Guest" },
          reviewedAt: { type: Date, require: true },
          rating: { type: Number, require: true },
          review: { type: String },
          isDeleted: { type: Boolean, default: false },
        },
      }
    );
    return res
      .status(200)
      .send({
        status: true,
        message: "successfully updated",
        data: updatedReview,
      });
  } catch (error) {
    return res.status(400).send({ status: false, msg: error.message });
  }
};
module.exports = { updateReviewByID };
