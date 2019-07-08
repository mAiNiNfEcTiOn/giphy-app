# Architecture

This document's purpose is to attempt to explain the choices made while developing this application.

I'll start by explaining the reasoning behind a 2-parts' application instead of 1, then I'll talk about the server and last but not the least the client-side app.

While describing the choices I'll also will list some of the things that I'd like to have done, but due to lack of time, was unable to (maybe at a later stage I'll add it)

## 2-parts vs. 1 single package/logical block

Since this was a very simple app, with a very concise and defined purpose, I could've done it in a single package... Basically I could've used the server as a starting point for both the API and client-app and would've been fine.

However, in my day-to-day work I'm used to do this separation since it clearly splits the API's responsibility (and in many cases it's not in the same language as the client-side) from the client app.

Also it's quite common to have teams that have front-end developers and back-end developers, each maintaining their stack and repositories. This way would allow both continuing to work without necessarily sharing files between implementations.

Finally, the chosen approach doesn't impede/prevent the _single system_ to happen. As said in the _README.md_ it is possible to define a path where the server points to files from the client-side app.

## Server-side component

The server-side component is an Express application, scaffolded using the `express-generator` which provided me a certain structure out-of-the-box.

I preferred Express because its route handlers' signatures are very similar to the ones of AWS' Lambda functions. And with a very straightforward process of proxying requests like this I'd say it would be a next step on the architecture.

One of the missing features on this implementation is the _caching_ functionality, which CloudFront would provide in the Lambda's scenario. Caching requests/responses would reduce the amount of requests to Giphy's API and reduce response times.

In order to validate the querystring (qs) parameters I've used Joi which provides me a schema-based configuration with a very simple API to define the types and constraints of the fields/parameters in the _qs_.

The tests were done using _Jest_. I've taken an approach of mocking the `request-promise-native` package - allowing me to control the requests done by the server - and using mocked data I've tested the behaviour of the app to a reasonable amount of coverage.

Although I'm outputting the errors to the _stdout_, other tools could've been used like Winston for example as it would support multiple transports including the _stdout_.
Nowadays with things running in containers or _serverless_ the _stdout_ is normally shipped into a _logging system_ such as CloudWatch, so it is a common practice to do so.
However, the error handling at the response level, could've been better.

## Client-side app

The client-side application was scaffolded using `create-react-app`, which is limited to a certain degree of configuration, but was enough to develop this small application.

The `App.js` file is the one with the majority of the logic. It is the root one and I chose it as the one to control the overall communication and _state of the app_.

The `Image` component also has state, but only to control when the image has loaded in order to do a tiny fade animation on it.

I've used flexbox for the layout, which with a little bit of time would allow me to do the toggle from 1 to 3 column layout fairly easily.

Regarding how the search process works, I could've done a _search as you type_ system, but not only there wouldn't be any clear benefit on it as it would mean a _debounce_ implementation to wait for the time where the user _might have stopped_ and then do the search.
The approach taken in the existing implementation moved that assertion to the _Enter_ (or submit of the form) to trigger the search.

For the network requests I've used `axios` instead of `fetch`, because `axios` provides a clean API which by default handles the responses as JSON, also handles the problematic status codes (4xx and 5xx) as errors, possible to `.catch()` them instead of accepting as normal responses.
Last but not the least, it provides a cancellation signal - similar to the [AbortController](https://developers.google.com/web/updates/2017/09/abortable-fetch) - where it allows the application to cancel the previous request if a new one has been requested, reducing the risk of race conditions due to latency between requests.

One of the things I've neglected was the error handling. I am doing `console.error()`, but that is just it. Could've been done a lot better.

Regarding performance, I've decided to do a custom _endless scroll_ but it was clear that packages like [`react-virtualized`'s infinite loader](https://bvaughn.github.io/react-virtualized/#/components/InfiniteLoader) would've been a better choice, given the fact that it'd render only a subset of the images (not all) and would simplify the requests' management.

Other improvements would pass through using modern techniques like using service workers to do network caching (and therefore have a form of caching) and also to support offline mode (user loses connection, can still see loaded images).

Making use of `<link rel="dns-prefetch" ... />` with Giphy's image domains would help the browser resolve the DNS faster.

Same goes for the `<link rel="preconnect" ... />` tags which would speed-up connection handshake and TLS negotiation.

The payloads themselves brought several types of _images_, including mp4, which due to its small size and quality vs. compression ratio, are commonly used to replace GIFs... Social/Professional media networks' like Twitter, Facebook or LinkedIn do that.

Regarding testing I've used Jest + Enzyme to be able to `mount()` the application and do behaviour/functional testing to it, also covering a big part of the code by doing so. Also, like the server-side I've mocked the `axios.get` in order to prevent requests to outside of the app.