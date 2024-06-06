const express = require("express");
const router = new express.Router();
const User = require("../models/user");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    const token = await User.register({
      username,
      password,
      first_name,
      last_name,
      phone,
    });
    return res.json(token);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
