import { mkdirp } from 'mkdirp'
import { PureCLMStats } from '../js/CLMStats'
import timeline from '../js/timeline.json'
import { render } from 'preact-render-to-string'
import { h } from 'preact'
import fs from 'node:fs';

const baseHtml = fs.readFileSync('./docs/index.html', 'utf-8');
fs.rmSync('./docs/index.html');

function mkLayout(urlPeriod, urlPage) {
    const urlHref = 'http://localhost:8080/';
    const U = () => ({ urlHref, urlPage, urlPeriod });
    const appStr = render(h(PureCLMStats, { U }));
    const html = baseHtml.replace('__PRERENDER__', appStr);
    return html;
}

mkdirp.sync('./docs/_layouts/');
mkdirp.sync('./docs/periods/');

for (const period of timeline.periods) {
    const periodId = period.periodId;

    function mkMd(page) {
        const layout = `l-${periodId}-${page}`;
        const pagePrefix = page === 'stats' ? '' : (
            `${page} - `
        )
        return ([
            '---',
            `layout: ${layout}`,
            `title: ${pagePrefix}${period.title}`,
            `periodId: ${periodId}`,
            '---',
            ''
        ]).join('\n')
    }

    if (periodId === timeline.current) {
        fs.writeFileSync('./docs/index.md', mkMd('stats'));
    }

    for (const page of ['stats', 'player', 'compare', 'h2h']) {
        const layout = `l-${periodId}-${page}`;
        const layoutPath = `./docs/_layouts/${layout}.html`;
        fs.writeFileSync(layoutPath, mkLayout(periodId, page));
        mkdirp.sync(`./docs/periods/${periodId}`);
        const mdPath = `./docs/periods/${periodId}/${page}.md`;
        fs.writeFileSync(mdPath, mkMd(page));
    }
}
