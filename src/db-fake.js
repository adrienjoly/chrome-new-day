// Fake storage (for local testing)

var tasks = [ 'task 1', 'task 2' ]
var listeners = []

// calls back once with { key, value }
const fetchData = (key, callback) =>
  callback({ key: 'tasks', value: tasks })

// calls back reactively with { key, value }
const subscribeToData = (key, callback) => {
  listeners.push(callback)
  fetchData('tasks', callback)
}

const unsubscribeToData = (key, callback) => {
  listeners.pop()
}

// calls back with { key }
const setData = (key, data, callback) => {
  tasks = data
  listeners.forEach((handler) => fetchData('tasks', handler))
  callback({ key })
}

export default {
  fetchData,
  subscribeToData,
  unsubscribeToData,
  setData,
}
