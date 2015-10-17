var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');

/* GET home page. */
router.post('/*', handlers.postSkeleton);

module.exports = router;
