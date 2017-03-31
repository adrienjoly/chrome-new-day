// Chrome extension's sync storage

// to display the values currently stored:
//chrome.storage.sync.get(null, console.log.bind(console))

// to clear:
//chrome.storage.sync.clear()

// calls back once with { key, value }
const fetchData = (key, callback) =>
  chrome.storage.sync.get(key, (value) => callback({ key, value: key ? value[key] : value }))

// calls back reactively with { key, value }
const subscribeToData = (key, callback) => {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    /*
    Object.keys(changes).reduce((acc, key) => {
      acc[key] = changes[key].newValue
      return acc
    }, {})
    */
    if (changes[key]) {
      callback({ key, value: changes[key].newValue })
    }
  })
  fetchData(key, callback)
}

const unsubscribeToData = (key, callback) => {
  chrome.storage.onChanged.removeListener(callback)
}

// calls back with { key }
const setData = (key, data, callback) => {
  fetchData(key, ({ value }) => {
    if (JSON.stringify(value) !== JSON.stringify(data)) {
      const change = {}
      change[key] = data // WARNING / TODO: dates are not correctly serialized
      chrome.storage.sync.set(change, () => callback({ key }))
    } else {
      callback({ key })
    }
  })
}

export default {
  fetchData,
  subscribeToData,
  unsubscribeToData,
  setData,
}
