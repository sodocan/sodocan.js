var express = require('express');
var router = express.Router();
var handlers = require('../Utilities/requestHandlers');
var methodsDB = require('../Databases/Models/methods.js');

/* GET home page. */
router.get('/*', handlers.apiGet);


//[
//get all top voted entries for all functions / classes / everythign

//get all entries of specific context
//sodocan.com/api/projectName/all/reference
/*
{[
  methodName:
  parameters:
  returns:
]}

*/
//get # of entries of specific context -- method will also be needed
//   /api/projectName/methodName/context/3 || all
//]
//sodocan/projectName/
//[
//get # of additions -- the method, context, and entry will be needed
//may not need method name, as entry has that information associated

//get all addtions
// api/projectName/methodName/context/entry/entryID/3 || all
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


/*
api: required
projectName: if omitted, name of all projects (but nothing else)
methodName: if omitted, give ref of all methods plus top level of each context (no addition by default)
context: if omitted, give top level of each context (no addition by default)
{
  /entry/entrid(number)
  /entryID-034u32/
  /?3
  /3&1
  /?additions=3 (since depth not specified, = 1, additions =3)
  /?d=1&a=1
  /1

} api/projName
api/projName/*all/example

projName/ref/methodName
projName?context=description
projectName/?entryid=3425

api/projName/context-example
api/projNmae/ref-methodName/(entryID-132 or entrydepth)/(add id or add depth)

/projName/method/tip/1/0/examples/descriptions/4/5
api/pojName/description/all/tips/all

api/projName/

contexts = {
 description: true,
 tips: true,

}

save projName in var
if !next
  get all methods with depth 1 addition 0 for all contexts
 else if 'ref'
    then store next in methodName v

var next = next()
if (next === 'ref') {
  var methodName = next();
  next = next();
}

while(next)
  if (next === all) {
    skfjsl
  } else if (next === 'entryID') {
    sfds
  } else if (!isNaN(+next)) {
    sfsdf
  } else {
    var contextName = next
    var depth = 1;
  }
  next = next();
}

ref/meth/all/all
ref/meth/example/all/all

*/