const pool = require("../db/db");

const findUserById = async (id) => {
  try {
    const result = await pool.query(
      `SELECT users.id, users.username, users.fullname, users.email, users.avatar_url, wallets.account_number, wallets.balance
       FROM users
       LEFT JOIN wallets ON users.id = wallets.user_id
       WHERE users.id = $1`,
      [id]
    );

    return result.rows[0];
  } catch (error) {
    throw new Error("Something went wrong");
  }
};

const findUserByEmail = async (email) => {
  try {
    const result = await pool.query(
      `SELECT users.*, wallets.id AS wallet_id
       FROM users
       LEFT JOIN wallets ON wallets.user_id = users.id
       WHERE users.email = $1`,
      [email]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error("Something went wrong");
  }
};

const createUser = async (user) => {
  const { email, username, fullname, password, avatar_url } = user;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const userResult = await client.query(
      `INSERT INTO users (email, username, fullname, password, avatar_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, username, fullname, avatar_url`,
      [email, username, fullname, password, avatar_url]
    );
    const newUser = userResult.rows[0];

    const walletResult = await client.query(
      `INSERT INTO wallets (user_id, balance) 
       VALUES ($1, $2) 
       RETURNING id, account_number, balance, created_at, updated_at`,
      [newUser.id, 0]
    );
    const newWallet = walletResult.rows[0];

    await client.query("COMMIT");

    return {
      ...newUser,
      wallet: newWallet,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error)
    throw new Error(
      "Database error occurred while creating the user and wallet."
    );
  } finally {
    client.release();
  }
};

const findWalletByUserId = async (userId) => {
  try {
    const query = `
      SELECT id, user_id, account_number, balance, created_at, updated_at
      FROM wallets
      WHERE user_id = $1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to fetch wallet by user ID.");
  }
};

const findWalletByWalledId = async (userId) => {
  try {
    const query = `
      SELECT id, user_id, account_number, balance, created_at, updated_at
      FROM wallets
      WHERE user_id = $1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to fetch wallet by user ID.");
  }
};



const findWalletById = async (walletId) => {
  try {
    const query = `
      SELECT id, user_id, account_number, balance, created_at, updated_at
      FROM wallets
      WHERE account_number = $1;
    `;
    const result = await pool.query(query, [walletId]);

    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to fetch wallet by ID.");
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findWalletById,
  findWalletByUserId,
  findWalletByWalledId
};