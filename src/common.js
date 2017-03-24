const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

export default {
  uuid,
  formatDate,
  renderMinutes,
  renderSeconds,
}
