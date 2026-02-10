const { default: Watcher } = require('watcher');
const { execa } = require('execa');

const S = {};

async function trueRunBuild() {
  if (S.timeoutId === true) { return; }
  S.timeoutId = true;
  try {
    await execa('just', ['build'], { stdout: ['pipe', 'inherit'], stderr: ['pipe', 'inherit'] });
    S.timeoutId = undefined;
  } catch (e) {
    console.error('BUILD ERROR!');
    console.error(e);
    S.timeoutId = undefined;
  }
}

function runBuild() {
  if (S.timeoutId === true) {
    setTimeout(runBuild, 50);
  } else if (S.timeoutId) {
    clearTimeout(S.timeoutId);
    S.timeoutId = setTimeout(trueRunBuild, 50);
  } else {
    S.timeoutId = setTimeout(trueRunBuild, 0);
  }
}

const watcher = new Watcher(['./src', './styles', './js', './scripts']);
watcher.on('all', runBuild);

runBuild();
