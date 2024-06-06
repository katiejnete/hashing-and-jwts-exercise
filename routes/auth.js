const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY} = require("../config");

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
    const { username, password, firstName, lastName, phone } = req.body;
    const user = await User.register({
      username,
      password,
      firstName,
      lastName,
      phone,
    });
    const token = jwt.sign(user.username, SECRET_KEY);
    return res.json(token);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
