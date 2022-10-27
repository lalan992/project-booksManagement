const express = require("express");
const router = express.Router();
const aws = require("aws-sdk");
const bookController = require("../controllers/bookController");
const linkGenerator = require("../controllers/linkGenerator");
const userController = require("../controllers/userController");
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/auth");

aws.config.update({
  accessKeyId: "AKIAY3L35MCRZNIRGT6N",
  secretAccessKey: "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",
  region: "ap-south-1",
});

//user api
router.post("/register", userController.createUser);
router.post("/login", userController.userLogin);

//Book api
router.post("/link", linkGenerator.createLink);
router.post("/books", auth.Authentication, bookController.createBook);
router.get("/books", auth.Authentication, bookController.getBooks);
router.get("/books/:bookId", auth.Authentication, bookController.getBookById);
router.put(
  "/books/:bookId",
  auth.Authentication,
  auth.Authorisation,
  bookController.updateBook
);
router.delete(
  "/books/:bookId",
  auth.Authentication,
  auth.Authorisation,
  bookController.deleteBookById
);

//Review api
router.post("/books/:bookId/review", reviewController.createReview);
router.put(
  "/books/:bookId/review/:reviewId",
  reviewController.updateReviewByID
);
router.delete(
  "/books/:bookId/review/:reviewId",
  reviewController.deleteReviewById
);

router.all("/***", function (req, res) {
  res.status(400).send({ status: false, message: "invalid request!!" });
});

module.exports = router;
