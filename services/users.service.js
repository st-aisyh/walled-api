const bcrypt = require("bcrypt");
const userRepository = require("../repositories/users.repository");
const { generateAccessToken } = require("../utils/auth.util");
const {
  UserAlreadyExistsError,
  AuthenticationError,
  NotFoundError,
} = require("../dto/customErrors");

const createUser = async (userData) => {
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw new UserAlreadyExistsError();
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const newUser = { ...userData, password: hashedPassword };

  const createdUser = await userRepository.createUser(newUser);
  return createdUser;
};

const login = async (userData) => {
  const user = await userRepository.findUserByEmail(userData.email);

  if (!user) {
    throw new AuthenticationError();
  }

  const isPasswordMatched = await bcrypt.compare(
    userData.password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new AuthenticationError();
  }
  const token = generateAccessToken({
    email: user.email,
    id: user.id,
    walletId: user.wallet_id,
  });
  return token;
};

const getUserById = async (id) => {
  const user = await userRepository.findUserById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return {
    ...user,
    wallet: {
      account_number: user.account_number,
      balance: user.balance,
    },
  };
};

module.exports = { createUser, login, getUserById };