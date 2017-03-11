// Fake storage (for local testing)

var KEYS = [ 'tasks', 'currentTask' ]
var listeners = []

// clear local storage
//KEYS.forEach((key) => localStorage.removeItem(key))

// print local storage
//fetchData(null, ({ key, value }) => console.log('[db-fake] stored:', value))
//[ 'tasks', 'currentTask' ].forEach((k) => console.log(k, localStorage.getItem(k)))

// fired when update happened on another tab
window.addEventListener('storage', function(e) {  
  //console.log('[db-fake] EVENT:', e.key, JSON.parse(e.newValue))
  listeners.forEach((listener) =>
    !listener.key || e.key === listener.key && fetchData(e.key, listener.handler))
});

// necessary to intercept and broadcast local changes
var originalSetItem = localStorage.setItem; 
localStorage.setItem = function(key, data){
  //console.log('[db-fake] update:', key, JSON.parse(data))
  originalSetItem.apply(this, arguments);
  listeners.forEach((listener) =>
    !listener.key || key === listener.key && fetchData(key, listener.handler))
}

// calls back once with { key, value }
const fetchData = (key, callback) => {
  const value = key ? JSON.parse(localStorage.getItem(key)) : KEYS.reduce((acc, k) => {
    //console.log('[db-fake:fetchData]', k, JSON.parse(localStorage.getItem(k)))
    acc[k] = JSON.parse(localStorage.getItem(k))
    return acc
  }, {})
  callback({ key: key, value })
}

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
  localStorage.setItem(key, JSON.stringify(data))
  //listeners.forEach((listener) => key === listener.key && fetchData(key, listener.handler))
  callback({ key })
}

export default {
  fetchData,
  subscribeToData,
  unsubscribeToData,
  setData,
}
