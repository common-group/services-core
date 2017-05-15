# catarse.js [![Circle CI](https://circleci.com/gh/catarse/catarse.js/tree/master.svg?style=svg)](https://circleci.com/gh/catarse/catarse.js/tree/master) [![Code Climate](https://codeclimate.com/github/catarse/catarse.js/badges/gpa.svg)](https://codeclimate.com/github/catarse/catarse.js)

# Mithril components for the Catarse world

A set of mithril components to use accross [catarse](https://github.com/catarse/catarse).

## Development

To start developing components to catarse.js you'll first have to globally install [gulp](http://gulpjs.com/), [bower](http://bower.io/) and [npm](https://www.npmjs.com/).

Then, install all the project package dependencies by calling ```npm install && bower install```.

Application build dependencies are described on `bower.json`, while dev dependencies are described on `package.json`.

Catarse.js uses gulp as build tool. To start developing just run `gulp` and gulp will start watching your source files for changes and running build when those happen.

To watch source files without running through testing tasks, run:
```gulp --notest```

To watch source files without running testing or linting tasks, run:
```gulp --q```

To trigger a build cycle without watching files, run:
```gulp build```

To link catarse.js with catarse, run:
```bower link```
Then, in you catarse repository, run:
```bower link catarse.js```

## Flowtype && ES6

Currently we are moving our code to ES6 + Flowtype. All new components should be written on this new paradigm. For doing such, we deeply recommend a clear understand of both [Flow](http://flowtype.org/), ES6 and [Babel](https://babeljs.io/) - our ES6 transpile tool.

## Troubleshooting

If you can't run `gulp` try to install it with `npm install -g gulp`

## Project Architecture

Gulp compiles the code found inside the /src directory and outputs into the /dist folder as catarse.js and catarse.min.js

There are 3 different folders: /c, /root and /vm.

/c

Small UI components: self-contained javascript modules that contain specific UI and behavior
root - Root components are bigger then regular components. They are the main component and the ones that are mounted (directly or by mithril's router). They also own their data, which should flow in one direction to it's children components (kind of like a Flux implementation). In our projects, they are related to endpoints (e.g.: when you hit a /project-permalink endpoint the JS will mount the projectsShow root component)

/root

Core components [need fuller description here...]

/vm

View-models. Component controllers ideally should not deal with nothing more then the ocmponent's user interface behavior. All other type of data manipulation should be handled by a view-model

/c.js

The entry point we use to expose the root components to the application window.c

/h.js

Module containing helper methods used across components. stuff like datetime formatting and other types of tasks that are common to all components

/error.js

Module that implements an error interface to be used across components
