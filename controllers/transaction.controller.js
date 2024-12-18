const Joi = require("joi");
const transactionService = require("../services/transactions.service.js");

const topUpSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  description: Joi.string().optional(),
});

const transferSchema = Joi.object({
  amount: Joi.number().positive().required(),
  recipientWalletId: Joi.string().required(),
  description: Joi.string().optional(),
});

const topUp = async (req, res, next) => {
  try {
    const { error, value } = topUpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { amount, description } = value;
    const walletId = req.user.walletId;

    const transaction = await transactionService.topUp(
      walletId,
      amount,
      description
    );

    res.status(201).json({ data: transaction });
  } catch (error) {
    next(error);
  }
};

const transfer = async (req, res, next) => {
  try {
    const { error, value } = transferSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { amount, recipientWalletId, description } = value;
    const senderWalletId = req.user.walletId;

    const transaction = await transactionService.transfer(
      senderWalletId,
      recipientWalletId,
      amount,
      description
    );

    res.status(201).json({ data: transaction });
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const { walletId } = req.user;
    const transactions = await transactionService.getAllTransactions(walletId);
    res.status(200).json({ data: transactions });
  } catch (error) {
    next(error);
  }
};

module.exports = { topUp, transfer, getAllTransactions };