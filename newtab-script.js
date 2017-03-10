console.log('newtab-script')
chrome.storage.sync.get(null, function(items){
  console.log('got:', items && items.tasks) // e.g. [ { "yourBody": "myBody" } ]
  const newTask = 'task ' + new Date().getTime()
  const tasks = (items.tasks || []).concat([ newTask ])
  chrome.storage.sync.set({ 'tasks': tasks }, function(){
    console.log('added:', newTask)
  })
})
