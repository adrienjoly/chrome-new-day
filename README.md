# New Day, a "new tab" extension for Google Chrome

Google Chrome extension to help you achieve your tasks every day.

## Development notes

### Data model: persisted state variables

When run locally, `db-fake.js` persists the state in `localstorage`.

When run as a Chrome extension, `db.js` persists the state in `chrome.storage.sync`.

#### `tasks`

```json
[
   {
     "uuid":"743c3356-1238-4ea6-b147-95737a79ba1d",
     "name":"regr",
     "minutes":30,
     "lastStart":1491539094282,
     "done":true,
     "elapsedMillisecs":2750
  },
  {
    "uuid":"9cd19b7b-faa7-4a51-a9ea-780192e9616b",
    "name":"thr",
    "minutes":30
  }
]
```

#### `currentTask`

```json
{
  "uuid":"9cd19b7b-faa7-4a51-a9ea-780192e9616b",
  "name":"thr",
  "minutes":30,
  "lastStart":1491539097032
}
```

#### `mood`

Number between 0 and 4.

#### `notifDoneTask`

Object that is set when the "good job" notification is to be displayed (during a few seconds after finishing a task). Contains the required data to undo this operation.

#### `relax`

Boolean.
