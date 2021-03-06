# Angular ngrx-data

The
[`ngrx-data` library](https://github.com/johnpapa/angular-ngrx-data)
makes it easier to write an Angular application that manages
[entity](https://github.com/johnpapa/angular-ngrx-data/blob/master/docs/faq.md#entity)
data with
[ngrx](https://github.com/ngrx/platform/blob/master/README.md)
in a "reactive" style, following the
[redux](https://redux.js.org/) pattern.

## Why use _ngrx-data_?

> If you're following the _redux_ pattern and managing entity data with _ngrx_,
the **_ngrx-data_ library** can significantly reduce the amount of code you have to write.

Many applications have substantial _domain models_ with 10s or 100s of entity types.

To create, retrieve, update, and delete (CRUD) all of these entities with vanilla _ngrx_ is an overwhelming task.
You're writing _actions_, _action-creators_, _reducers_, _effects_, _dispatchers_, and _selectors_ as well as the HTTP GET, PUT, POST, and DELETE methods _for each entity type_.

In even a small model, this is a ton of repetitive code to create, maintain, and test.

The _ngrx-data_ library is _one_ way to radically reduce the amount of "boilerplate" necessary to manage entities with _ngrx_.

## How it works

The
["_Introduction to ngrx-data_"](https://github.com/johnpapa/angular-ngrx-data/blob/master/docs/introduction.md)
guide offers a quick overview.

The
["_Overview_"](https://github.com/johnpapa/angular-ngrx-data/blob/master/docs/README.md) page links to more in-depth documentation.

## Explore this repository

This repository contains the _ngrx-data_ source code and a
demonstration application (the "demo app") that exercises many of the library features.

The key folders in this repo are:

* docs --> the docs for the library and the demo
* lib ---> the ngrx-data library source code that we publish to npm
* src/client ---> the demo app source
* src/server ---> a node server for remote data access

<a name="install-and-run"></a>

The demo app is based on the Angular CLI.
You may want to install the CLI globally if you have not already done so.

```bash
npm install -g @angular/cli
```

Then follow these steps:

(1) Clone this repository

```bash
git clone https://github.com/johnpapa/angular-ngrx-data.git
cd angular-ngrx-data
```

(2) Install the npm packages

```bash
npm install
```

(3) Build the `ngrx-data` library

```bash
npm run build-setup
```

(4) Serve the CLI-based demo app

```bash
ng serve -o
```

> Run `npm start` if you have not installed the Angular CLI globally.

## Run the library tests

The _ngrx-data_ library ships with unit tests to validate functionality and guard against regressions.

These tests also demonstrate features of the library that are not covered in the demo app.
They're worth reading to discover more advanced techniques.

Run this CLI command to execute the tests for the library.

```bash
ng test
```

> Run `npm test` if you have not installed the Angular CLI globally.

We welcome [PRs](https://github.com/johnpapa/angular-ngrx-data/pulls)
that add to the tests as well as those that fix bugs and documentation.

Be sure to run these tests before submitting a PR for review.

## Monitor the app with Redux DevTools

The demo app is
[configured for monitoring](https://github.com/ngrx/platform/tree/master/docs/store-devtools)
with the
[Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension).

Follow these instructions to
[install them in your browser](https://github.com/zalmoxisus/redux-devtools-extension)
and learn how to use them.

## Build the app against the npm package

The demo app is setup to build and run against the version of the library in
`dist/ngrx-data`.

That's convenient when you're evolving the library code and
re-building as you go with `npm run build-lib` or `npm run build-setup`.

The version in `dist/ngrx-data` will reflect your latest changes.
Obviously the package deployed in `node_modules` would not.

If you want to see how the demo app runs against the published package, you'll have to make **a few temporary changes** to the TypeScript configuration.

1. **_Remove_** the following from `src/tsconfig.json` so that the IDE (e.g., VS Code)
   looks for `ngrx-data` in `node_modules/ngrx-data` instead of `src/lib`.

  ```bash
    "paths": {
      "ngrx-data": ["../lib/src"]
    },
  ```

2. **_Remove_** _that same setting_ from the `src/client/tsconfig.app.json`.
   Now `ng build` references `node_modules/ngrx-data` instead of `src/lib` when it builds the demo app.

Now install the `ngrx-data` package _without touching the `package.json`_ as follows:

```bash
npm install ngrx-data --no-save --no-lock
```

> **Remember to _restore the `tsconfig` settings_ when you're done. Do not commit those changes!**

## Use a real database

The demo app queries and saves mock entity data to an in-memory database with the help of the
[Angular In-memory Web API](https://github.com/angular/in-memory-web-api).

The "Remote Data" toggle switch in the header switches
to the remote database.

The app fails when you switch to the remote database.

> Notice how the app detects errors and pops up a toast message with the failed _ngrx_ `Action.type`.
>
> The error details are in the browser's console log.

You must first set up a database and launch a web api server that talks to it.

The `src/server` folder has code for a local node web api server, configured for the demo app.

>TODO: 
> * Explain how to build and run the server.
> * Explain how to build and serve the mongo db

<!-- 

>TODO: Fix the broken server-oriented commands in package.json

### Create a MongoDb

1. Create a [CosmosDB instance](https://docs.microsoft.com/en-us/azure/cosmos-db/tutorial-develop-mongodb-nodejs-part4)

### Build and launch the node server

1. Build the Angular app and launch the node server

```bash
???
```

1. Open the browser to <http://localhost:3001>

### Docker

* Install and run [Docker](https://www.docker.com/community-edition)

#### Environment file

Create an empty file named `.env` in the root of the app. We'll fill this in later.

#### Docker Compose with Debugging

Create the Docker image and run it locally. This commands uses `docker-compose` to build the image
and run the container.

This opens port `9229` for debugging.

```bash
npm run docker-debug
open http://localhost:3001
```

Open VS Code, launch the `Docker: Attach to Node` debugging profile

### Optional Database

```bash
NODE_ENV=development

PORT=3001
PUBLICWEB=./publicweb

COSMOSDB_ACCOUNT=your_cosmos_account
COSMOSDB_DB=your_cosmos_db
COSMOSDB_KEY=your_cosmos_key
COSMOSDB_PORT=10255
```

Out of the box you can run the demo with an in memory data service instead of a live database. If you wish to use a database, you can set up a local mongo server or a remote CosmosDB/MongoDB server in the cloud.

1. Configure Cosmos DB server settings

   Copy the contents from `.env.example` into `.env`. Replace the values with your specific configuration. Don't worry, this file is in the `.gitignore` so it won't get pushed to github.

   ```javascript
   NODE_ENV=development

   PORT=3001
   PUBLICWEB=./publicweb

   COSMOSDB_ACCOUNT=your_cosmos_account
   COSMOSDB_DB=your_cosmos_db
   COSMOSDB_KEY=your_cosmos_key
   COSMOSDB_PORT=10255
   ```
-->

## Problems or Suggestions

[Open an issue here](https://github.com/johnpapa/angular-ngrx-data/issues)
