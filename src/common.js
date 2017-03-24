const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default {
  formatDate: (date) => {
    var dayOfWeek = date.getDay();
    var dayOfMonth = date.getDate();
    var monthIndex = date.getMonth();
    return dayNames[dayOfWeek] + ', ' + monthNames[monthIndex] + ' ' + dayOfMonth;
  },
  renderMinutes: (minutes) =>
    minutes >= 60 ? (minutes / 60) + 'h' : minutes + 'm',
}
