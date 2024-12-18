const pool = require("../db/db");

const transfer = async ({
  senderWalletId,
  recipientWalletId,
  amount,
  description,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE wallets SET balance = balance - $1 WHERE id = $2",
      [amount, senderWalletId]
    );

    await client.query(
      "UPDATE wallets SET balance = balance + $1 WHERE id = $2",
      [amount, recipientWalletId]
    );

    const result = await client.query(
      `INSERT INTO transactions (wallet_id, transaction_type, amount, recipient_wallet_id, description) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [senderWalletId, "transfer", amount, recipientWalletId, description]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error("Error occurred during transfer");
  } finally {
    client.release();
  }
};

const topUp = async ({ walletId, amount, description }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE wallets SET balance = balance + $1 WHERE id = $2",
      [amount, walletId]
    );

    const result = await client.query(
      `INSERT INTO transactions (wallet_id, transaction_type, amount, description) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [walletId, "top-up", amount, description]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error("Error occurred during top-up");
  } finally {
    client.release();
  }
};

const findAllTransactionsByWalletId = async (walletId) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
    t.id AS transaction_id,
    t.transaction_type,
    t.amount,
    t.description,
    t.transaction_date,
    t.recipient_wallet_id,
    CASE 
        WHEN t.transaction_type = 'top-up' THEN u.id
        WHEN t.transaction_type = 'transfer' AND t.wallet_id = $1 THEN r_u.id
        WHEN t.transaction_type = 'transfer' AND t.recipient_wallet_id = $1 THEN u.id
    END AS recipient_id,
    CASE 
        WHEN t.transaction_type = 'top-up' THEN u.username
        WHEN t.transaction_type = 'transfer' AND t.wallet_id = $1 THEN r_u.username
        WHEN t.transaction_type = 'transfer' AND t.recipient_wallet_id = $1 THEN u.username
    END AS recipient_username,
    CASE 
        WHEN t.transaction_type = 'top-up' THEN u.fullname
        WHEN t.transaction_type = 'transfer' AND t.wallet_id = $1 THEN r_u.fullname
        WHEN t.transaction_type = 'transfer' AND t.recipient_wallet_id = $1 THEN u.fullname
    END AS recipient_fullname,
    CASE 
        WHEN t.transaction_type = 'top-up' THEN u.email
        WHEN t.transaction_type = 'transfer' AND t.wallet_id = $1 THEN r_u.email
        WHEN t.transaction_type = 'transfer' AND t.recipient_wallet_id = $1 THEN u.email
    END AS recipient_email
    FROM transactions t
    LEFT JOIN wallets r_w ON t.recipient_wallet_id = r_w.id
    LEFT JOIN users r_u ON r_w.user_id = r_u.id
    LEFT JOIN wallets w ON t.wallet_id = w.id
    LEFT JOIN users u ON w.user_id = u.id
    WHERE t.wallet_id = $1 OR t.recipient_wallet_id = $1;
    `;
    const result = await client.query(query, [walletId]);
    return result.rows;
  } catch (error) {
    throw new Error("Something went wrong while fetching transactions");
  } finally {
    client.release();
  }
};

module.exports = { transfer, topUp, findAllTransactionsByWalletId };