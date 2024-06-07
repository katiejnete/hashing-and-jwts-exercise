const express = require("express");
const router = new express.Router();
const Message = require("../models/message");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const {username} = req.user;
    const message = await Message.get(id, username);
    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async (req, res, next) => {
  try {
    const fromUsername = req.user;
    const { toUsername, body } = req.body;
    const message = await Message.create({ fromUsername, toUsername, body });
    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", async (req,res,next) => {
  try {
    const fromUsername = req.user;
    const { toUsername, body } = req.body;
    const message = await Message.create({ fromUsername, toUsername, body });
    return res.json({ message });    
  } catch (err) {
    return next(err);
  }
})

module.exports = router;
