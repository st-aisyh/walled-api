require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");

const userRouter = require("./routers/users.router");
const transactionRouter = require("./routers/transaction.router");

const app = express();
const port = process.env.APP_PORT;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(userRouter);
app.use(transactionRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});