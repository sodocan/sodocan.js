# Sodocan
[![Travis Status](https://travis-ci.org/sodocan/sodocan.js.svg?branch=master)](https://travis-ci.org/sodocan/sodocan.js)

# Sodocan.js

> Crowdsourced docs, generated from source code.

##What is Sodocan.js?
Every developer has read terrible documentation for libraries and frameworks that are supposed to make a project easier, but instead cause fruitless hours spent figuring out how to use the API. On the other hand, writing documentation is a terrible experience for developers who build and maintain libraries and frameworks. You aren't a writer, and it's time taken away that you could spend creating other projects. Too many great libraries then fall to the wayside as developers abandon them in favor of better-documented ones.

Sodocan.js mitigates both of these frustrating (and all too common) experiences by auto-generating a beautiful and well laid out page from your source code and comments. The true power of Sodocan.js comes with the crowd-sourced approach we take, which allows the developer community to add helpful explanations and vote on entries, so your documentation natuarally reflects the needs of your users over time.

##Overview
Sodocan.js is a tool to create well laid out, and easy to read, crowd sourced documentation. It has 3 main components. 
  * [The Parser:](./parser/README.md) This creates the skeleton for the docs. Function names, and their inputs are automatically parsed. You can also mark them up with the javadoc notation that you are already familiar with to add more info easily. 
  * [The API server:](./Server/README.md) The parser sends a json object to our server which hosts all the data. Our server has a well designed query system allowing you get only the data you want. You can, of course, host your own version of our server. 
  * [Blueprints:](./blueprints/README.md) These templates are the pages the users will actually see. They are populated by the data from API server. Our default is a clean, single page angular template. We also offer a 'common' file which provides all the convienence functions if you want to develop our own template with a different framework. These get hosted anywhere. You can even easily have 2 different templates point to the same data.

##Getting Started
Setting up your docs with sodocan is straightforward - follow these steps to get up and running.

1.  Install our parser module from npm.  ```npm install -g sodocan-parser```
2.  Run the ```parse``` command on your source code.  The arguments for ```parse``` are a space delimited
list of .js files or folders containing files you wish to parse, followed by the path to an output folder 
(the output folder you name wil be created if it does not exist).  All files you parse with a single command
will be assumed to be part of the same project. 
Example:  ```parse projectFolder additionalFile.js outputFolder```

3.  The files will be parsed for data to be used in our documentation - function names and parameter names by default, and additional info if you create comments in the files according to our JSDoc-like syntax (check out the 
[parser README](./parser/README.md) for more details on this).  

4.  The parser will place its results into your specified output folder.  The results are a JSON representation
of the data (for sending to our API server) and a cleanly formatted HTML representation (for previewing the results, or as a basic starting point for your docs if you don't want to use our crowdsourcing features).

5.  At this point, sodocan-parser's CLI will ask you a series of yes-or-no questions, starting with whether or not
you want to upload your docs to our crowdsourcing API.  If so, you will be prompted to enter your sodocan username and password, or given the opportunity to register if you do not have an account.  After this your docs will be uploaded for access through our API. 

6.  Now all that remains is to host a frontend for sodocan.js, which will access the docs through the API server
and allow others to add/upvote additions.  You could do this on github pages, a personal site, a site dedicated to your library - wherever you like.  The easiest solution is to use our default Angular template, located at this repo: https://github.com/jesterswilde/sodone/tree/master.  You'll need to host the index.html file, and angular-common and angular-sodone folders.  To point the template at your doc data through our API, set up the URL for index.html such that the name of your project is after the first slash.
Example URL: **myname.github.io/myprojectname**
This template works well, but you're looking for more flexibility with your frontend, check out our [Blueprints system](./blueprints/README.md). 

7.  That's it! The template will be populated with your docs, and other users can upvote entries and add new ones.
Watch your docs improve, and enjoy.      

## Team

  - __Product Owner__: Corey Wolff
  - __Scrum Master__: Lai 'Lain' Jiang
  - __Development Team Members__: Joyce Liu, James Yokobosky, Leo Thorp


### Currently hosted docs:
  * to come later 
