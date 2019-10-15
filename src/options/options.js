
// Save Official Setting
function saveOfficial(d) {
  chrome.storage.local.set({
    official: d,
  });
}

document.getElementById('official-yes').addEventListener('click', () => saveOfficial(true));
document.getElementById('official-no').addEventListener('click', () => saveOfficial(false));

// Restore Options
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get({
    official: false,
    type: 'any'
  }, function(items) {
    document.getElementById('official-yes').checked = items.official;
    document.getElementById('official-no').checked = !items.official;

    document.getElementById('type-any').checked = (items.type === 'any');
    document.getElementById('type-tab').checked = (items.type === 'tab');
    document.getElementById('type-chords').checked = (items.type === 'chords');
    document.getElementById('type-ukulele').checked = (items.type === 'ukulele');
    document.getElementById('type-bass').checked = (items.type === 'bass');
  });
}

document.addEventListener('DOMContentLoaded', restore_options);

// Save Type serializeToString
function saveType(d) {
  chrome.storage.local.set({
    type: d,
  });
}

document.getElementById('type-any').addEventListener('click', () => saveType('any'));
document.getElementById('type-tab').addEventListener('click', () => saveType('tab'));
document.getElementById('type-chords').addEventListener('click', () => saveType('chords'));
document.getElementById('type-ukulele').addEventListener('click', () => saveType('ukulele'));
document.getElementById('type-bass').addEventListener('click', () => saveType('bass'));
