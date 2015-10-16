#Sodocan for Angular

##Warning: design not locked, breaking change with names/functions/etc expected!

When the build process is setup, this directory will host a local copy of Angular as well as
any sodocan-specific files. At the moment, there's just a sodocan.js you will want to include;
this file creates a `sodocan` app and `sodocanCtrl` controller that should be set on your HTML tag.

As-is the only useful functionality provided is an oddly-named sodocanData factory; you can inject
this factory in a controller to access the intial load data (in `sodocanData.docs`) and to request
specific references (via `sodocanData.getReference(ref_name)`). Expect this interface to change.

The current best-plan is to create a simple index.html page in your root blueprint
folder, named angular-[name], and separate the custom directives/controllers into relevant folders.

Build, configuration, and more opinionated (useful) initial app incoming over next 24ish hours.
