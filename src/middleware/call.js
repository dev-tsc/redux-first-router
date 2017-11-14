import composePromise from '../composePromise'
import isLoadSSR from '../utils/isClientLoadSSR'
import isServer from '../utils/isServer'

const noop = () => Promise.resolve()
const isFalse = (a, b) => a === false || b === false

export default (name, config = {}) => (api) => {
  enhanceRoutes(name, api.routes)

  return (req, next = noop) => {
    const shouldCall = req.options.shouldCall || defaultShouldCall
    if (!shouldCall(req, name, config)) return next()

    const { prevRoute, dispatch, options: opts } = req
    const { prev } = config
    const route = prev ? prevRoute : req.route
    const routeCb = (route && route[name]) || noop
    const optsCb = isFallback(name, req, routeCb) ? noop : opts[name] || noop
    const needsErr = name === 'onError' && routeCb === noop && optsCb === noop
    const proms = needsErr ? onError(req) : [routeCb(req), optsCb(req)]

    delete req.manuallyDispatched

    return Promise.all(proms).then(([a, b]) => {
      if (isFalse(a, b)) return false
      const res = a || b

      if (res && !req.manuallyDispatched && isAutoDispatch(req)) {
        const action = res.type || res.payload ? res : { payload: res }
        action.type = action.type || `${req.action.type}_COMPLETE`

        return Promise.resolve(dispatch(action))
          .then(complete(next))
      }

      return complete(next)(res)
    })
  }
}

const complete = (next) => (res) => next().then(() => res) // insure response is returned after awaiting next()

const defaultShouldCall = (req, name, config) => {
  const state = req.locationState()

  if (isLoadSSR(state, 'init') && /beforeLeave|beforeEnter/.test(name)) return false
  if (isServer() && /onLeave|onEnter/.test(name)) return false
  if (isLoadSSR(state) && name === 'thunk') return false
  if (name === 'beforeLeave' && state.kind === 'init') return false
  if (name === 'onLeave' && state.kind === 'load') return false

  return true
}

const isFallback = (name, req, routeCb) => {
  const rFb = req.route && req.route.fallbackMode
  const fb = req.options.fallbackMode

  if (routeCb === noop) return false
  if (!rFb && !fb) return false

  if (rFb && rFb[name] !== undefined) return rFb[name]
  if (rFb && rFb.all !== undefined) return rFb.all

  if (!fb) return false
  if (fb[name] !== undefined) return fb[name]
  return fb.all
}

const isAutoDispatch = (req) => {
  const { route, options } = req

  if (!route) {
    return options.autoDispatch === undefined ? true : options.autoDispatch
  }

  return route.autoDispatch !== undefined
    ? route.autoDispatch
    : (options.autoDispatch === undefined ? true : options.autoDispatch)
}

const onError = (req) => {
  const { error, errorType: type } = req
  const action = { type, error }

  if (process.env.NODE_ENV === 'development') console.log(error)

  return [action]
}

const enhanceRoutes = (name, routes) => {
  for (const type in routes) {
    const route = routes[type]
    const cb = route[name]
    const callback = findCallback(name, routes, cb, route)
    if (callback) route[name] = callback
  }
}

const findCallback = (name, routes, callback, route) => {
  if (typeof callback === 'function') {
    return callback
  }
  else if (Array.isArray(callback)) {
    const pipeline = callback.map(cb => (req, next) => {
      const prom = Promise.resolve(cb(req))
      prom.then(complete(next))
    })

    return composePromise(pipeline)
  }
  else if (typeof callback === 'string') {
    const type = callback
    const inheritedRoute = routes[`${route.scene}/${type}`] || routes[type]
    const cb = inheritedRoute[name]
    return findCallback(name, routes, cb, inheritedRoute)
  }
  else if (typeof route.inherit === 'string') {
    const type = route.inherit
    const inheritedRoute = routes[`${route.scene}/${type}`] || routes[type]
    const cb = inheritedRoute[name]
    return findCallback(name, routes, cb, inheritedRoute)
  }
}

