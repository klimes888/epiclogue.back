const express = require('express');
const router = express.Router();
const mDB = require('../models/mariaDB_conn')
const fs = require('fs')

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.session)
  res.render('index', { id: req.session.user_id });
});

router.get("/login", (req, res) => {
  res.render("login", { page: "login" });
});

router.get("/join", (req, res) => {
  res.render("join", { page: "join" });
});

router.get("/logout", (req, res) => {
  delete req.session.user_id;
  delete req.session.logined;
  delete req.session.uuid;
  req.session.save(() => {
    res.redirect('/');
  });
})

module.exports = router;
