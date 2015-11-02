# Sodocan Blueprints

Blueprints are drop-in sites for use with our server API or (future) static site generation.
You can think of them as templates -- but since templates have meanings in different
frameworks, we went with a different word. Basically they're single-page applications
that let users view and interact with your documentation. Please feel free to modify,
update, and make a blueprint your own! The \*-plain examples show easy ways to get started
and probably have enough examples that you can integrate the sodocan data into an existing
page.

Shared files (optional sodocan helpers) will live in `framework-common`,
individual sites will live in `framework-blueprintName`. The README for a specific
blueprint should contain any necessary installation instructions; typically you're safe
sticking those two folders anywhere and serving the index file from the blueprint.

You may need to bower install extra dependencies -- please keep blueprints updated with
those instructions!

Documentation for a given framework's helpers can be found in the \*-common README.
