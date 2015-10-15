var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  log('getting /', 'new log succeeded!');
  res.render('index', { title: 'Express' });
});

module.exports = router;
