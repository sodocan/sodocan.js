var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers')

/* GET home page. */
router.get('/',);


//[
//get all entries of specific context

//get # of entries of specific context -- method will also be needed
//]

//[
//get # of additions -- the method, context, and entry will be needed
//may not need method name, as entry has that information associated

//get all addtions
//]

//post entry -- will need method, and context

//post addition -- will need method, context, and entry * see above note on additions

//post upvote -- will need to know method, context, and entry (or addition, depending on what is upvoted)

//post flag -- for MVP, same as upvote
/*
get single / multiple of each type of context
/entry/?tip=drawPage,drawEntry,%example=
/tip/?
/description/?

entry/tip/?thing1
entry/tip/?thing0

/all/tip

top rated

top 3

all
*/
module.exports = router;
