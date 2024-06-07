/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");
/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register(reqBody) {
    const { username, password, firstName, lastName, phone } = reqBody;
    if (!username || !password || !firstName || !lastName || !phone)
      throw new ExpressError(
        "Please check and fill in required JSON data",
        422
      );
    Object.values(reqBody).forEach((value) => {
      if (typeof value !== "string")
        throw new ExpressError("Please enter JSON data as string", 400);
    });
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) 
        RETURNING username, password, first_name, last_name, phone
       `,
      [username, hashedPassword, firstName, lastName, phone]
    );
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    const hashedPassword = result.rows[0].password;
    if (hashedPassword) {
      const verify = await bcrypt.compare(password, hashedPassword);
      if (verify) this.updateLoginTimestamp(username);
      return verify;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await db.query(
      `UPDATE users SET last_login_at = current_timestamp WHERE username = $1`,
      [username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name, phone FROM users;`
    );
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT m.id, users.username AS username, users.first_name AS first_name, users.last_name AS last_name, users.phone AS phone, m.body, m.sent_at, m.read_at FROM messages AS m JOIN users ON users.username = m.from_username WHERE m.from_username = $1`,
      [username]
    );
    const messages = [];
    for (let result of results.rows) {
      const {
        id,
        username,
        first_name,
        last_name,
        phone,
        body,
        sent_at,
        read_at,
      } = result;
      const to_user = { username, first_name, last_name, phone };
      messages.push({ id, to_user, body, sent_at, read_at });
    }
    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
      `SELECT m.id, users.username AS username, users.first_name AS first_name, users.last_name AS last_name, users.phone AS phone, m.body, m.sent_at, m.read_at FROM messages AS m JOIN users ON users.username = m.to_username WHERE m.to_username = $1`,
      [username]
    );
    const messages = [];
      for (let result of results.rows) {
        const {
          id,
          username,
          first_name,
          last_name,
          phone,
          body,
          sent_at,
          read_at,
        } = result;
        const from_user = { username, first_name, last_name, phone };
        messages.push({ id, from_user, body, sent_at, read_at });
      }
      return messages;
  }
}

module.exports = User;
