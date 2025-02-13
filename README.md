# Redux-First Router

including typescript typings and rudy-match-path (with path-to-regexp 6.1)

Think of your app in terms of _states_, not _routes_ or _components_. Connect your components and just dispatch _Flux Standard Actions_!

<p align="center">
  <a href="https://www.npmjs.com/package/redux-first-router">
    <img src="https://img.shields.io/npm/v/redux-first-router.svg" alt="Version" />
  </a>
  
  <a href="https://www.npmjs.com/package/redux-first-router">
    <img src="https://img.shields.io/node/v/redux-first-router.svg" alt="Min Node Version: 6" />
  </a>
  
  
  <a href="https://www.npmjs.com/package/redux-first-router">
    <img src="https://img.shields.io/npm/dt/redux-first-router.svg" alt="Downloads" />
  </a>

  <a href="https://travis-ci.org/faceyspacey/redux-first-router">
    <img src="https://travis-ci.org/faceyspacey/redux-first-router.svg?branch=master" alt="Build Status" />
  </a>

## Motivation
To be able to use Redux *as is* while keeping the address bar in sync. To define paths as actions, and handle path params and query strings as action payloads.

The address bar and Redux actions should be *bi-directionally* mapped, including via the browser's back/forward buttons. Dispatch an action and the address bar updates.
Change the address, and an action is dispatched.

In addition, here are some obstacles **Redux-First Router** seeks to *avoid*:

* Rendering from state that doesn't come from Redux
* Dealing with the added complexity from having state outside of Redux
* Cluttering components with route-related code
* Large API surface areas of frameworks like `react-router` and `next.js`
* Routing frameworks getting in the way of optimizing animations (such as when animations coincide with component updates).
* Having to do route changes differently in order to support server-side rendering.

## Usage

### Install
`yarn add redux-first-router`

(A minimal `<Link>` component exists in the separate package [`redux-first-router-link`](https://github.com/faceyspacey/redux-first-router-link).)

### Quickstart

```js
// configureStore.js
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import { connectRoutes } from 'redux-first-router'

import page from './pageReducer'

const routesMap = {
  HOME: '/',
  USER: '/user/:id'
}

export default function configureStore(preloadedState) {
  const { reducer, middleware, enhancer } = connectRoutes(routesMap)

  const rootReducer = combineReducers({ page, location: reducer })
  const middlewares = applyMiddleware(middleware)
  const enhancers = compose(enhancer, middlewares)

  const store = createStore(rootReducer, preloadedState, enhancers)

  return { store }
}
```

```js
// pageReducer.js
import { NOT_FOUND } from 'redux-first-router'

const components = {
  HOME: 'Home',
  USER: 'User',
  [NOT_FOUND]: 'NotFound'
}

export default (state = 'HOME', action = {}) => components[action.type] || state
```

```js
// App.js
import React from 'react'
import { connect } from 'react-redux'

// Contains 'Home', 'User' and 'NotFound'
import * as components from './components';

const App = ({ page }) => {
  const Component = components[page]
  return <Component />
}

const mapStateToProps = ({ page }) => ({ page })

export default connect(mapStateToProps)(App)
```

```js
// components.js
import React from 'react'
import { connect } from 'react-redux'

const Home = () => <h3>Home</h3>

const User = ({ userId }) => <h3>{`User ${userId}`}</h3>
const mapStateToProps = ({ location }) => ({
  userId: location.payload.id
})
const ConnectedUser = connect(mapStateToProps)(User)

const NotFound = () => <h3>404</h3>

export { Home, ConnectedUser as User, NotFound }
```

## Documentation

### Basics

#### Flow Chart
![Redux First Router Flow Chart](https://github.com/faceyspacey/redux-first-router/raw/master/docs/redux-first-router-flow-chart.png)

#### [connectRoutes](https://github.com/faceyspacey/redux-first-router/blob/master/docs/connectRoutes.md)
connectRoutes is the primary "work" you will do to get Redux First
Router going. It's all about creating and maintaining a pairing of
action types and dynamic express style route paths. If you use our ```<Link />``` component and pass an action as its href prop, you can change the URLs you use here any time without having to change your application code.

#### [URL parsing](https://github.com/faceyspacey/redux-first-router/blob/master/docs/url-parsing.md)
Besides the simple option of matching a literal path, all matching capabilities of the path-to-regexp package we use are now supported, except unnamed parameters.

#### [Flux Standard Actions](https://github.com/faceyspacey/redux-first-router/blob/master/docs/action.md)
One of the goals of Redux First Router is to NOT alter your actions
and be 100% flux standard action-compliant. That allows for automatic
support for packages such as redux-actions.

#### [Location Reducer](https://github.com/faceyspacey/redux-first-router/blob/master/docs/reducer.md)
The location reducer primarily maintains the state of the current pathname and action dispatched (type + payload). That's its core mission.

#### [Link Component](https://github.com/faceyspacey/redux-first-router-link)
A minimal link component exists in the separate package redux-first-router-link.

#### [Query Strings](https://github.com/faceyspacey/redux-first-router/blob/master/docs/query-strings.md)
Queries can be dispatched by assigning a query object containing key/vals to an action, its payload object or its meta object.

#### [React Native](https://github.com/faceyspacey/redux-first-router/blob/master/docs/react-native.md)
Redux First Router has been thought up from the ground up with React Native (and server environments) in mind. They both make use of the history package's createMemoryHistory. In coordination, we are able to present you with a first-rate developer experience when it comes to URL-handling on native. We hope you come away feeling: "this is what I've been waiting for."

### Advanced

#### [addRoutes](https://github.com/faceyspacey/redux-first-router/blob/master/docs/addRoutes.md)
Sometimes you may want to dynamically add routes to routesMap, for
example so that you can codesplit routesMap. You can do this using the
addRoutes function.

#### [Blocking navigation](https://github.com/faceyspacey/redux-first-router/blob/master/docs/blocking-navigation.md)
Sometimes you may want to block navigation away from the current
route, for example to prompt the user to save their changes.

#### [Scroll Restoration](https://github.com/faceyspacey/redux-first-router/blob/master/docs/scroll-restoration.md)
Complete Scroll restoration and hash #links handling is addressed primarily by one of our companion packages: redux-first-router-restore-scroll (we like to save you the bytes sent to clients if you don't need it).

#### [Server Side Rendering](https://github.com/faceyspacey/redux-first-router/blob/master/docs/server-rendering.md)
Ok, this is the biggest example here, but given what it does, we think it's extremely concise and sensible.

#### [Client-Only API](https://github.com/faceyspacey/redux-first-router/blob/master/docs/client-only-api.md)
The following are features you should avoid unless you have a reason
that makes sense to use them. These features revolve around the
history package's API. They make the most sense in React Native--for
things like back button handling.

#### [Low-level API](https://github.com/faceyspacey/redux-first-router/blob/master/docs/low-level-api.md)
Below are some additional methods we export. The target user is
package authors. Application developers will rarely need this.

#### [Version 2 Migration Steps](https://github.com/faceyspacey/redux-first-router/blob/master/docs/migration.md)
In earlier versions history was a peerDependency, this is no longer
the case since version 2 has its own history management tool. This
means that the arguments passed to connectRoutes(documentation) need
to be changed.

#### [Usage with redux-persist](https://github.com/faceyspacey/redux-first-router/blob/master/docs/redux-persist.md)
You might run into a situation where you want to trigger a redirect as soon as possible in case some particular piece of state is or is not set. A possible use case could be persisting checkout state, e.g. checkoutSteps.step1Completed.

#### [Prior Art](https://github.com/faceyspacey/redux-first-router/blob/master/docs/prior-art.md)
These packages attempt in similar ways to reconcile the browser
history with redux actions and state.

### Recipes

- [Dispatching thunks & pathless routes](./examples/thunks)
- [SEO-friendly styled links](./examples/links)
- [Automatically changing page `<title>`](./examples/change-title)
- [Use Redux Devtools to debug route changes](./examples/redux-devtools)

### Help add more recipes for these use cases.  PR's welcome!

*Topics for things you can do with redux-first-router but need examples written:*

- *Performing redirects bases on `state` and `payload`.*
- *Use hash-based routes/history (*see the [migration instructions](./docs/migration.md)*)*
- *Restoring scroll position*
- *Handling optional URL fragments and query strings*
- *Route change pre- & post-processing*
- *Code-splitting*
- *Server-side rendering*
- *Usage together with `react-universal-component`, `babel-plugin-universal-import`, `webpack-flush-chunks`.*

## Where is new feature development occuring?
Feature development efforts are occuring in the [Respond framework Rudy repository](https://github.com/respond-framework/rudy).

## Contributing
We use [commitizen](https://github.com/commitizen/cz-cli), run `npm run cm` to make commits. A command-line form will appear, requiring you answer a few questions to automatically produce a nicely formatted commit. Releases, semantic version numbers, tags, changelogs and publishing will automatically be handled based on these commits thanks to [semantic-release](https:/
/github.com/semantic-release/semantic-release).

## Community And Related Projects

- [Reactlandia chat lobby](https://gitter.im/Reactlandia/Lobby)

- [react-universal-component](https://github.com/faceyspacey/react-universal-component). Made to work perfectly with Redux-First Router.

- [webpack-flush-chunks](https://github.com/faceyspacey/webpack-flush-chunks). The foundation of our `Universal` product line.
