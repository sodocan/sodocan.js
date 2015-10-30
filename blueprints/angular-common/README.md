##Sodocan Modules for Angular

Your Angular application can be constructed however you wish! Inside this
directory there is a `sodocan.js` file you may want to include to get access to
some helpful functions -- all you need to do is include 'sodocan' as a
dependency to your app module, and pass-as-a-global `window.sodocanApp` name of
your app (as string). Your app will be bootstrapped to the document after the
initial load data has been received from the API server. For the moment, the
sodocanCtrl controller must be left on the top level tag as well to properly
populate the initial data.

But wait, why is that useful? The current version of the plain demo has a
custom app, sure, but all the directives are still built on the `sodocan`
module. The reason is to allow easy injection of other module-level
dependencies. You can let `sodocan` sit at the top level and build under it, or
take what it offers to integrate into a pre-existing (or new) design. Full
documentation on these patterns, along with annotated source in ng-plain,
coming soon.

There's also a `sodocanRouter` factory available that will remain updated with
the current view details. This tool is under heavy construction, but its
current usage is available in the ng-plain demo. The router is mostly useful if
you want your app to accept deep (specific) linking, as it will parse the
project URL (slightly different from the API, mainly that 'all' is replaced
with -1) to be a standardized reference request object.

The built-in routers are not advised; you won't be able to take advantage of
the pretty URL without hard coding or generating a lengthy config to handle the
specific routes (or duplicating the given router's URL parsing). You'll likely
want to have a top-level "content" directive that loops over `sodocanRouter` or
`sodocanAPI.docs` to populate the main text display, depending upon the current
view state.

`angular-plain` is currently in progress to demonstrate this usage of the API,
Router, and the various design patterns the sodocan module enables for you. A
full annotated version of this source is incoming this Halloween! All features
may not be available in the current version of this code.

You can include any extra dependencies for your app inside of the blueprint
project folder, a standard set of includes from our demos will also be
available in this directory.

## sodocanAPI Quick Reference:

#### Warning: some callbacks are still required, pass a noop to be safe!

### docs

This is an object holding all the documentation for the loaded project, in the
format:

```json
{
  referenceName : {
                    TODO:server_output_fix_this
                  }
}
```

### referenceObject

This is a term used in the followed guide to refer to an expected input format:

```json
{
  ref : referenceName,
  context : {
              ref : [overall number of entries, overall number of comments], //optional
              contextName : [number of entries, number of comments],
              contextName : [number of entries, number of comments]
            }
}
```

If the first `ref` is omitted, the entire project will be queried. If the
second `context-ref` is _present_, any other contexts will be ignored.

### getReference(refObj,cb)

###### *Object* referenceObject, [optional: *Function* callback]

Shorthand for getting varied entries on a given reference. Below functions
provided are for convenience.

If reference name is omitted from reference object, this function will pass to
`refreshTop` (currently under review).

### getTips(ref,entryNum,commentNum,cb)

###### *String* reference name [optional: *Int* number of entries, *Int* number of comments, *Function* callback]

Fetches and updates reference-specific tips in `docs` object. Convenience
function around `getReference`.

### getExplanations(ref,entryNum,commentNum,cb)

###### *String* reference name [optional: *Int* number of entries, *Int* number of comments, *Function* callback]

Fetches and updates reference-specific explanations in `docs` object.
Convenience function around `getReference`.

### getExamples(ref,entryNum,commentNum,cb)

###### *String* reference name [optional: *Int* number of entries, *Int* number of comments, *Function* callback]

Fetches and updates reference-specific examples in `docs` object. Convenience
function around `getReference`.

### getComments(context,entryID,commentNum,cb)

###### *String* context name, *Int??* reference entryID, [optional: *Int* number of comments, *Function* callback]

### refreshTop(refObj,cb)

###### *Object* referenceObject, [optional: *Function* callback]

##### Warning: Function under review!

The usefulness of this as a separate function is being reviewed, be careful
using it. You will be able to easily swap it with `getReference` should that
happen, just a friendly warning this is in danger of deprecation.

Replaces entire documentation object -- this may be an expensive operation in
both network costs and client rendering and should be avoided if possible.
Intentionally separated from `getReference` for future optimizations and to
encourage developers to work from requested references rather than the entire
project set. If you're regularly refreshing the entire app's data, you may want
to consider generating a static site or loading everything up front.

### editAnything()
##### editReference,editExplanation,editExample,editTip,editComment

These are placeholder functions, editing/deleting entries not currently allowed
by server.

### newReference(ref,text,cb)

###### *Object* referenceObject, [optional: *Function* callback]

Generic version of specific helper functions below; would allow updating entire
reference if/when support for that functionality is added.

### newTip(ref,text,cb)

###### *String* reference name, *String* entry text, [optional: *Function* callback]

Creates new tip entry for given reference. Convenience function around `newReference`.

### newExplanation(ref,text,cb)

###### *String* reference name, *String* entry text, [optional: *Function* callback]

Creates new explanation entry for given reference. Convenience function around `newReference`.

### newExample(ref,text,cb)

###### *String* reference name, *String* entry text, [optional: *Function* callback]

Creates new example entry for given reference. Convenience function around `newReference`.

### newComment(entryID,ref,context,text,cb)

###### *Int??* reference entryID, *String* reference name, *String* context name, *String* text content, [optional: *Function* callback]

Creates new comment (also labeled additions) for given entry.

### upvote(entryID,ref,context,addID,cb)

###### *Int??* reference entryID, *String* reference name, *String* context name, [optional: *Int??* additionID, *Function* callback]

Adds upvote to given entry, or if given additionID (usually referred to as
comments in these docs), upvotes the comment under that entry.
