const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { json } = require("express");

router.get(`/`, async (req, res) => {
  const userList = await User.find();

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid User Id" });
  }
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res.status(500).json({ success: false, message: "User does not exists" });
  }
  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
  });

  user = await user.save();
  if (!user) {
    return res.status(404).send("User cannot be created.");
  }

  res.status(201).send(user);
});

router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
  });

  user = await user.save();
  if (!user) {
    return res.status(404).send("User cannot be created.");
  }

  res.status(201).send(user);
});

router.put("/:id", async (req, res) => {
  const userExists = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExists.passwordHash;
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return res.status(404).send("User cannot be created.");
  }

  res.status(201).send(user);
});

router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;

  if (!user) {
    return res
      .status(404)
      .send({ success: false, message: "User does not exist" });
  }
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send({ success: false, message: "Invalid User" });
  }
});

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({ userCount: userCount });
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "User deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
