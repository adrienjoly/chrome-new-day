const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const RESET_HOUR = 5 // a new day starts at 5 am

// database model (name of persisted variables):
const KEYS = [
  'tasks',         // todays' tasks (array of task objects)
  'currentTask',   // current task (task object)
  'mood',          // today's mood (integer: 0-4)
  'notifDoneTask', // last done task (task object), for notification
  'relax',         // set when day is done. contains a `until` prop.
  'startDate',     // last date when the user pressed "start my day" (used for expiration of tasks of the day)
]

const getNextDay = (date) => {
  var d = date || new Date()
  if (d.getHours() >= RESET_HOUR) {
    d.setDate(d.getDate() + 1)
  }
  d.setHours(RESET_HOUR)
  d.setMinutes(0)
  d.setSeconds(0)
  d.setMilliseconds(0)
  return d
}

const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
})

const formatDate = (date) => {
  var dayOfWeek = date.getDay();
  var dayOfMonth = date.getDate();
  var monthIndex = date.getMonth();
  return dayNames[dayOfWeek] + ', ' + monthNames[monthIndex] + ' ' + dayOfMonth;
}

const renderMinutes = (minutes) =>
  minutes >= 60 ? (minutes / 60) + 'h ' : parseInt(minutes % 60) + 'm'

const renderMinutesPrecise = (minutes) =>
  (minutes >= 60 ? parseInt(minutes / 60) + 'h ' : '')
  + (minutes % 60 ? parseInt(minutes % 60) + 'm' : '')

const renderSeconds = (seconds) =>
  seconds > 60 ? renderMinutesPrecise(seconds / 60) : parseInt(seconds % 60) + 's'

const sumElapsedSecondsWithoutBreaks = (tasks) =>
  tasks.reduce((acc, task) => acc + task.elapsedMillisecs / 1000, 0)
  // TODO: don't take breaks into account

const sumElapsedSecondsWithBreaks = sumElapsedSecondsWithoutBreaks
  // TODO: take breaks into account

export default {
  KEYS,
  getNextDay,
  uuid,
  formatDate,
  renderMinutes,
  renderSeconds,
  sumElapsedSecondsWithoutBreaks,
  sumElapsedSecondsWithBreaks,
}
