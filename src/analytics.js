/*
- [x] le nombre de tâches réalisées par jour
- [x] le total des estimations par jour
- [x] l'heure de début de journée
- [x] l'heure de fin de journée
- [x] le nombre de tâche done par jour
- [x] le nombre de tâche undone par jour
- [-] (le nombre de tâches killed par jour)
- [x] le temps réél passé par tâches
- [x] le temps non-travaillé sur la journée de travail
*/

// MP
import mixpanel from 'mixpanel-browser';

mixpanel.init("9862f785ad64848289194f43cafd0016");

// GA
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-96103800-1', 'auto');

function post(url, body, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    console.log(xhr);
    if (xhr.readyState === 4 && callback) {
      callback(xhr.responseText);
    }
  };
  xhr.open("POST", url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(body);
}

function uploadReview(uid, text) {
  const url = 'https://script.google.com/macros/s/AKfycbw-5kk3aRK67gh7Xyi94TP1iaJnwnUHeehMKjnD9IcZZkZ35jI/exec';
  const body = "mixpanel-userId=" + encodeURIComponent(uid) + "&review=" + encodeURIComponent(text);
  post(url, body, function(res) {
    console.log('[App] Review Posted: ', res)
  });
}

// --- COMMON
// when this module is loaded, this means the page was loaded
//function pageLoaded() {}

function pageUnloaded() {}

window.addEventListener('beforeunload', pageUnloaded);

// --- HELPERS

function event(name, properties, privateProperties) {
  ga('send', {
    hitType: 'event',
    eventCategory: 'App',
    eventAction: name
  });

  // mixpanel may mutate the properties, so put him at the end
  mixpanel.track(name, properties);
}

function page(name, properties, privateProperties) {
  ga('send', {
    hitType: 'pageview',
    page: '/' + name
  });

  // mixpanel may mutate the properties, so put him at the end
  mixpanel.track(name, properties);
}

function time(name) {
  mixpanel.time_event(name);
}

// --- PLAN

function planStart() {
  page('page-plan');

  time('page-estimate');
}

// task: { id: String, name: String, estimation: Number(seconds) || null }
function planAddTask(task) {
  event('task-add', { id: task.id });
}

// taskId: String
function planRemoveTask(taskId) {
  event('task-remove', { id: taskId });
}

// --- ESTIMATE

function estimateStart() {
  page('page-estimate');

  time('page-focus');
  time('task-estimated');
}

// taskId: String, estimation: Number(seconds)
function estimateTask(taskId, estimation) {
  event('task-estimated', { id: taskId, estimation: estimation });
  time('task-estimated');
}

// --- FOCUS

// tasks: [ { id: String, name: String, estimation: Number(seconds) }, ... ]
function focusStart(tasks) {
  page('page-focus');

  time('page-mood');
  time('task-finish');
}

function focusFinishTask(taskId) {
  event('task-finish', { id: taskId });

  time('task-finish');
}

function focusUndoFinishTask(taskId) {
  event('task-undo-finish');
}

function focusStartBreak() {
  event('break-start');
  time('break-end');
}

function focusEndBreak() {
  event('break-end');
}

// page: { index: Number, taskId: String }
function focusMoveForward(toPage) {
  event('move-forward', page);
}

function focusMoveBackward(toPage) {
  event('move-backward', page);
}

function focusChangePage(fromPage, toPage) {
  event('change-page', {
    fromIndex: fromPage.index,
    toIndex: toPage.index,
    fromTask: fromPage.taskId,
    toTask: toPage.taskId
  });
}

// --- REVIEW

let ReviewStartReason = {
  FINISHED: 'finished',
  MANUALLY: 'manually',
  OVERTIME: 'overtime'
};


/*
  focus: {
    reason: ReviewStartReason,
    < totalTime: Number(second) > => sum(break.end-break.start) + sum(task.timeSpent)
    breaks: [ { start: Date, end: Date }, ... ],
    tasks: [ { id: String, name: String, estimation: Number(seconds), done: Boolean, timeSpent: Number(seconds),  }, ... ]
  }
*/
function moodStart(focus) {

  function breakDuration(b) {
    return Math.abs(b.end.getTime() - b.start.getTime()) / 1000;
  }

  page('page-started', {
    reason: focus.reason,
    totalTime: focus.totalTime,
    breaksDurations: focus.breaks.map(breakDuration),
    breaksStart: focus.breaks.map((b) => b.start),
    breaksEnd: focus.breaks.map((b) => b.end),
    timeSpent: focus.tasks.map((t) => t.timeSpent),
    estimations: focus.tasks.map((t) => t.estimation), 
  });

  time('review-mood');
}

// mood: Number (0..<5)
function moodRate(mood) {
  event('review-mood', { rating: mood });
}

function reviewStart() {
  page('page-review');

  time('review-comment');
}

// comment: String
function reviewComment(comment) {
  uploadReview(mixpanel.get_distinct_id(), comment);
  event('review-comment', {}, { comment: comment });
}

export default {
  plan: {
    start: planStart,
    addTask: planAddTask,
    removeTask: planRemoveTask,
    estimate: estimateTask
  },

  estimate: {
    start: estimateStart,
    estimate: estimateTask
  },

  focus: {
    start: focusStart,

    finishTask: focusFinishTask,
    undoFinishTask: focusUndoFinishTask,
    startBreak: focusStartBreak,
    endBreak: focusEndBreak,

    moveForward: focusMoveForward,
    moveBackward: focusMoveBackward,
    changePage: focusChangePage
  },

  mood: {
    start: moodStart,
    rate: moodRate
  },

  review: {
    startReason: ReviewStartReason,
    start: reviewStart,
    comment: reviewComment
  }
}