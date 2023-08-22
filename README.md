# Welcome

First of all, thank you for taking the time to work on this takehome.  We know that your time is valuable, and we want to make sure you (at minimum) have an enjoyable/productive time working on it.  Ultimately this is more about showing you how both we and you work, than a test of anything specific.  What we're looking for as part of this takehome is:

- How you approach problems.
- How you choose to organize/implement solutions.
- What your overall technical style is.

If you have any questions throughout this takehome, please ask them via email or we can setup a call.  We would much rather have a conversation, than have you assume/get frustrated/grind on a solution for something that is outside the scope of what we're looking for.

The way we're looking for you to approach this takehome is through a hypothetical story, and a desire for a solution.  Think of it like you're working with us, and a product manager is describing the market need, requesting you come up with a broad strokes solution.  Not necessarily production ready, but a first-round prototype of how you'd ultimately build a product.  Something you could show to team members, and demo, but (potentially) has work left to do.

If you'd like, feel free to put this git repository up somewhere you can share with us, and we'll follow along with you.

# Background

One of the "killer features" we're developing for our product is the ability to query and join across data from many different third parties, as if it was all local.  Data being ingested from third party providers can be constantly changing, and our system needs to be reactive and feel like a native application running on your users' devices.

For this exercise, we present a problem: we need to be able to display potentially large amounts of constantly changing event data to our users.  At a high level, features we need are:

- quick initial load time of a subset of the event data the user is interested in
- updating what the user is seeing when changes from the backend come in
- the ability to not slow down the user's browser with bulk loading of huge data sets
- the ability to quickly scroll through events in time
- an ability to easily share where in time a user is viewing data (e.g. by being able to change URLs with other users)

# Scope Of The Takehome

We've included a couple of pieces of code:

- The `backend` server.  An express application which acts like our in-house data source, where all event information comes from.
- The `app` front end/backend.  A SvelteKit project, which we use to display event data to our users.

The `backend` provides an API for the `app` to query event data.  There are two pieces to this API:

- A `GET` request on `/data`, with `start` and `stop` filtering for timestamps.
- A WebSocket connection at `/data`, that streams mutations to the underlying data.

If necessary to achieve your goals, you can go ahead and modify the HTTP and WebSocket APIs to your liking.  Please DO NOT change the scale of the data, or how the data is mutated; for the sake of this exercise, that data should be considered provided by third parties.  In order to make development faster, feel free to change `initialCount` inside `backend/src/index.ts` to a value that works in your environment, but ultimately we'll test with at least 100k rows.

We don't mind if you have a third-party library you'd like to use to help you along.  That said, we're more interested in your strategy for implementing a solution to this problem, rather than reusing existing code.  Please stick to using SvelteKit for your solution.  If you have any questions about how we'd approach solving a problem, don't hesitate to get in touch.

# Building And Running The Example

In order to build and run the takehome, you need:

- `node`
- `pnpm`

## Installing Packages

To install all of the required packages, run:

```
pnpm install
```

## Building

To install all of the required packages, run:

```
pnpm -r build
```

## Running The Backend Server

To install all of the required packages, run:

```
(cd backend && node build)
```

## Running The Web App

To install all of the required packages, run:

```
(cd app && pnpm run dev)
```

## Accessng The Web App

By default, the webapp will be running on:

    http://localhost:5173

We've included 3 examples of how to access data from the backend:

- Server-Side Rendered
- Streamed
- Live Updates

We've included these in order to show how SvelteKit can be used to interact with the `backend` service.  It's not necessary for you to keep these routes.
