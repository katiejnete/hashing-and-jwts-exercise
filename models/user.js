/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");
/** User of the site. */

class User {
  constructor({ username, password, firstName, lastName, phone }) {
    this.username = username;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    const joinAt = new Date();
    joinAt.setUTCHours(0, 0, 0, 0);
    this.joinAt = joinAt.toISOString();
    this.lastLoginAt = new Date();
  }

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
    Object.values(reqBody).forEach(value => {
      if (typeof value !== 'string') throw new ExpressError("Please enter JSON data as string", 400);
    })
    const user = new User(reqBody);
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
       `,
      [
        username,
        hashedPassword,
        firstName,
        lastName,
        phone,
        user.joinAt,
        user.lastLoginAt,
      ]
    );
    return user;
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(`SELECT * FROM users WHERE username = $1`, [
      username,
    ]);
    const hashedPassword = result.rows[0];
    if (hashedPassword) {
      return await bcrypt.compare(password, hashedPassword);
    }
    throw new ExpressError("Invalid username/password", 400);
  }

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
