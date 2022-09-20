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
router.post("/", bookController.createBook);
router.get("/", bookController.getBooks);

module.exports = router;
