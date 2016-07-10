# Mrs. Green Squares

Mrs. Green Squares is a clone of the GitHub contribution graph that has green squares.
Except it visualizes local repositories on your computer instead of your repos on GitHub.
It will display the full timeline instead of just a single year.
It currently only looks at commits on the master branch.

It is a Node.js script and when you run the script it will output a static index.html
that contains the visualization.

## How To Run The Script

There are basically 3 things you need to do:

- Install NodeGit using `npm install nodegit`.
- Fill in the `repos` and `authors` arrays in the `my-settings.json` file.
`authors` defaults to all authors.
- Run it by typing `node index.js`.
You should now see index.html in your folder.

## LICENSE

MIT <http://ryf.mit-license.org/>
