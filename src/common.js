const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
  formatDate,
  renderMinutes,
  renderSeconds,
}
