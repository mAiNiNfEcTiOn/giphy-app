# Giphy app

## Context

This is a 2-part application that connects to Giphy's search API to retrieve and display, in a one-column layout, the resulting images of the search done in this application:

* The first part is a server which will act mostly as a proxy to the real Giphy API.

* The second part is a React application that connects to this server and executes searches through it onto Giphy's API.

## Requirements

* Node >= 8
* NPM or Yarn
* A Giphy API Key (You don't have one? [Start here](https://support.giphy.com/hc/en-us/articles/360020283431-Request-A-GIPHY-API-Key))

## How to use this application

### The server

In order to have the server up and running you'll have the following environment variables available for configuration:

* `API_KEY` - The Giphy API's key, above mentioned. Without it or with an incorrect API Key, the server will start, but all requests proxied are going to fail.
* `ALLOWED_DOMAIN` - By providing this you're telling to the server that you want CORS headers enabled for that specific `ALLOWED_DOMAIN`. It is possible to pass any value, however I'd recommend to either pass a valid domain (e.g. `http://localhost:3000`) or `*` if you want to enable for any domain.
* `DEBUG` - Since this server uses `debug` as a package for logging things in a _namespaced_ way, you can use this variable to define which part you want to see logging. E.g. you can do `DEBUG=server:*` and you will see every log configured from the app.
* `PORT` - Sets the port where the server will run... By default it's value is `3001`, but you can set it to other values using this variable. In some cases, trying to set to low values as `80` or `443` might require extra permissions from the OS (`sudo` for example).
* `APP_PATH` - By default this server has its own `public` folder to where it points to... If you access `/` on it you'll see a "Welcome to Express" page. However if you want, you can build the `client` app and run it through the server (as long as the built app is in a path that the server can access).
* `NODE_ENV` - For those who don't normally develop in Node.js, this environment variable controls the _mode_ in which the application is running. Setting it to `production` disables explicit error messages in the responses (when an error happens). 

E.g. of using them with `npm start`:

`APP_PATH=/Users/$(whoami)/Desktop/myClientAppFolderBuilt/ ALLOWED_DOMAIN=http://localhost:3001 DEBUG=server:* PORT=3001 API_KEY=myExampleOfApiKey npm start`

_Note: The `ALLOWED_DOMAIN` is not needed in this case, since both the app and the server are under the same URL (therefore no CORS headers needed). In case they're different, then yes you should set it, but then the `APP_PATH` is not needed._

### The client

The client (or GUI) of this 2-parts' application, was built in React (using `create-react-app`) and provides mainly 2 environment variables:

* `PORT` - Same as above. Sets the port where the application will run... By default it's value is `3000`, but you can set it to other values using this variable.

* `REACT_APP_GIPHY_SERVER` - The value of this variable should be the URL, including endpoint, where the client will connect to in order to make a search. E.g. `http://localhost:3001/search`.

* `NODE_ENV` - As mentioned above `NODE_ENV` controls the environment mode. In the case of certain client-side dependencies it can go even further and use minified, compressed and debug-free versions of their packages when running in `production` mode.
A good example of this is `React` where the development bundle is more verbose and full of tools to help developers debug issues and detect problems. The build process is set to run in `production` mode.

After starting the server with `ALLOWED_DOMAIN=http://localhost:3000`, you can start the application (in dev mode) by doing:

`REACT_APP_GIPHY_SERVER=http://localhost:3001/search npm start`

## Explanation on how the UI behaves

Initially you'll see only a searchbox. By typing something in it and pressing _Enter_ it will trigger the request to the server (and subsequently Giphy's Search API).

As the app gets the images they're listed below the search bar.

The application has an _endless scroll_ system where it requests more images as you reach the bottom of the list of already loaded images.

If you do a new search, the list gets reset and you get new images.