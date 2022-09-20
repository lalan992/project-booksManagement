const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const userController = require("../controllers/userController");
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/auth");

router.get("/test-me", function (req, res) {
  res.send("My first ever api!");
});

//author api
router.post("/register", userController.createUser);

//login
router.post("/login", userController.userLogin);
//Book api
router.post("/books", bookController.createBook);
router.get("/books", bookController.getBooks);
router.get("/books/:bookId", bookController.getBookById);
router.put("/books/:bookId", bookController.updateBook);

module.exports = router;
