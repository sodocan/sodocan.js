// This file is no longer needed. Will delete

var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
/* GET home page. */
// router.post('/', function(){log("got to post request");});
router.post('/', handlers.postSkeleton);

module.exports = router;
