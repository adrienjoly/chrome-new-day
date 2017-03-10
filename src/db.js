// _____________________________
// Generic DB helpers

/*
// (used by push/set/update functions, to translate callback results)
const pushSnapshotTo = (snapshot, callback) => callback({
  key: snapshot.key,
  _firebaseSnapshot: snapshot,
})
*/
// calls back once with { key, value }
const fetchData = (key, callback) =>
  chrome.storage.sync.get(key, (value) => callback({ key, value: value[key] }))

// calls back reactively with { key, value }
const subscribeToData = (key, callback) =>
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    /*
    Object.keys(changes).reduce((acc, key) => {
      acc[key] = changes[key].newValue
      return acc
    }, {})
    */
    callback({ key, value: changes[key].newValue })
  })

const unsubscribeToData = (key, callback) => callback() // NOT IMPLEMENTED

// calls back with { key }
const setData = (key, data, callback) => {
  const change = {}
  change[key] = data
  chrome.storage.sync.set(change, () => callback({ key }))
}

export default {
  fetchData,
  subscribeToData,
  unsubscribeToData,
  setData,
}
