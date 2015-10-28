#Sodocan for Angular

##Warning: design not locked, breaking change with names/functions/etc expected!

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

You have access to a `sodocanAPI` factory; full spec incoming, but it allows
you to make calls like `sodocanAPI.getReference(ref)` and it will update a
`sodocanAPI.docs` object.  Your views can watch or bind to this object to
update as desired. All `getContext` methods also accept a callback, design
pattern examples are available in `angular-plain`.

It also allows you to POST data via `newContext` and `editContext` methods.

There's also an optional `sodocanRouter` factory available that will remain
updated with the current view details. This tool is under heavy construction,
but its current usage is available in the ng-plain demo. The router is mostly
useful if you want your app to accept deep (specific) linking, as it will parse
the project URL (slightly different from the API, mainly that 'all' is replaced
with -1) to be a standardized reference request object.

The built-in routers are not advised; you won't be able to take advantage of
the pretty URL without hard coding or generating a lengthy config to handle the
specific routes (or duplicating the given router's URL parsing). You'll likely
want to have a top-level "content" directive that loops over `sodocanRouter` or
`sodocanAPI.docs` to populate the main text display, depending upon the current
view state.

`angular-plain` is currently in progress to demonstrate this usage of the API,
Router, and the various design patterns the sodocan module enables for you.

You can include any extra dependencies for your app inside of the blueprint
project folder, a standard set of includes from our demos will also be
available in this directory.

