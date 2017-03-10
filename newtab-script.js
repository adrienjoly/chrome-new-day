console.log('newtab-script')
chrome.storage.sync.get(null, function(items){
  console.log('got:', items && items.last) // e.g. [ { "yourBody": "myBody" } ]
  const now = new Date()
  chrome.storage.sync.set({ 'last': now.toString() }, function(){
    console.log('saved:', now)
  })
})
