/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, JWT_OPTIONS } = require("../config");
const ExpressError = require("../expressError");
/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
      if (!username || !password || !first_name || !last_name || !phone) throw new ExpressError("Please check and fill in required JSON data", 422)
      const hashedPassword = bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      const result = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING username, password, first_name, last_name, phone
       `,
        [
          username,
          hashedPassword,
          first_name,
          last_name,
          phone,
          date.toISOString(),
          new Date(),
        ]
      );
      const token = jwt.sign(result.rows[0], SECRET_KEY, JWT_OPTIONS);
      return token;
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {}

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {}

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {}

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {}

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {}

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {}
}

module.exports = User;
