## angular-plain example blueprint

This blueprint, though mostly functional, is not meant for use as an actual view
for your documentation. It's meant to show how to use the sodocan helper
module (provided & documented in `angular-common`), as well as give examples
of different design patterns you may want to use when creating your own design.

The code is heavily commented and should be easy to follow for anyone familiar
with Angular.

On a high level, the file structure is a required index.html in the root --
this is what will get served for the SPA -- and everything within can be linked
relatively. The parts of the page are split into separate directories; each
dynamic component is written as a directive. As the actual code is short,
the only further separation is between the templates (in componenentTpl.html) and
the directive/controller code, combined in componentCode.js.

App.js in this case is only to show it's possible to inject the sodocan module as a
dependency, as you can see from the actual directives, you can safely build
directly from sodocan as the root app (it will bootstrap itself automatically if 
no other app name is given in `window.sodocanApp`).

The `angular-yeoman` blueprint shows how to build a similar sort of Angular
app with the sodocan module from a Yeoman scaffold.
