const { default: Watcher } = require('watcher');
const { execa } = require('execa');

let timeoutId

async function trueRunBuild() {
  timeoutId = undefined;
  try {
    await execa('just', ['build'], { stdout: ['pipe', 'inherit'], stderr: ['pipe', 'inherit'] });
  } catch(e) {
    console.error('BUILD ERROR!');
    console.error(e);
  }
}

function runBuild() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(trueRunBuild, 50);
  } else {
    timeoutId = setTimeout(() => { timeoutId = undefined }, 50);
    trueRunBuild();
  }
}

const watcher = new Watcher(['./src', './styles', './js']);
watcher.on('all', runBuild);

runBuild();
