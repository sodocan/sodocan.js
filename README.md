# Sodocan

# Sodocan.js

> Open source docs written created from comments

## Team

  - __Product Owner__: Corey Wolff
  - __Scrum Master__: Lai 'Lain' Jiang
  - __Development Team Members__: Joyce Liu, James Yokobosky, Leo Thorp

Sodocan.js is a tool to create well laid out, and easy to read, crowd sourced documentation. It has 3 main components. 
  * [The Parser:](./parser/README.md) This creates the skeleton for the docs. Function names, and their inputs are automatically parsed. You can also mark them up with the javadoc notation that you are already familiar with to add more info easily. 
  * [The API server:](./Server/README.md) The parser sends a json object to our server which hosts all the data. Our server has a well designed query system allowing you get only the data you want. You can, of course, host your own version of our server. 
  * [Blueprints:](./blueprints/README.md) These templates are the pages the users will acutally see. They are populated by the data from API server. Our default is a clean, single page angular template. We also offer a 'common' file which provides all the convienence functions if you want to develop our own template with a different framework. These get hosted anywhere. You can even easily have 2 different templates point to the same data.

### Currently hosted docs:
  * to come later 