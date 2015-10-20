#Sodocan for Angular

##Warning: design not locked, breaking change with names/functions/etc expected!

When the build process is setup, this directory will host a local copy of
Angular as well as any sodocan-specific files.

Your Angular application can be constructed however you wish, but the simplest
method will be to write directives that handle your views -- the `sodocan.js` file
located here will bootstrap itself to your document and give you some useful tools.

At any level in your sub-app you can inject a `sodocanAPI` factory; full spec
is not available yet, but it allows you to make calls like
`sodocanAPI.getReference(ref)` and it will update a `sodocanAPI.docs` object.
Your views can watch or bind to this object to update as desired.

There's also an optional `sodocanRouter` factory available that will remain
updated with the current view details. The format of this router is getting
heavily worked on now, standardization coming soon. For now, you can use
`sodocanRouter.path` for both initial loads and watch it for subsequent changes
to the SPA. This factory is set on intial pageload and watches `$location`, and
will eventually populate `sodocanAPI.docs` for you. Currently the controllers
do need to read the path and make an API request for what data is necessary.

Traditional routers are not advised; you won't be able to take advantage of the
pretty URL without hard coding or generating a lengthy config to handle the
specific routes. You'll likely want to have a top-level "content" directive
that loops over `sodocanRouter` or `sodocanAPI.docs` to populate the main text
display, depending upon the current view state.

`angular-plain` is currently in progress to demonstrate this usage of the API,
Router, and how to handle these nested directives without extra dependencies.
An example with nested apps (`angular-plain-apps`) will come shortly after,
followed by a list of build guidelines and example Grunt/Gulp/NPM files to
follow for easy integration with the larger sodocan project.


