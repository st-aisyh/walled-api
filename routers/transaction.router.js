const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transaction.controller.js");
const authenticateToken = require("../middlewares/auth.middleware.js");

router.post("/transactions/transfer", authenticateToken, transactionController.transfer);
router.post("/transactions/topup", authenticateToken,  transactionController.topUp);
router.get("/transactions", authenticateToken,  transactionController.getAllTransactions);

module.exports = router;