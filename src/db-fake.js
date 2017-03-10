// Fake storage (for local testing)

var db = {
  //currentTask: {},
  tasks: [
    { name: 'task 1', minutes: 60 },
    { name: 'task 2', minutes: 120 },
  ],
}
var listeners = []

// calls back once with { key, value }
const fetchData = (key, callback) =>
  callback({ key: key, value: key ? db[key] : db })

// calls back reactively with { key, value }
const subscribeToData = (key, handler) => {
  listeners.push({ key, handler })
  fetchData(key, handler)
}

const unsubscribeToData = (key, handler) => {
  listeners.pop()
}

// calls back with { key }
const setData = (key, data, callback) => {
  db[key] = data
  listeners.forEach((listener) => key === listener.key && fetchData(key, listener.handler))
  callback({ key })
}

export default {
  fetchData,
  subscribeToData,
  unsubscribeToData,
  setData,
}
