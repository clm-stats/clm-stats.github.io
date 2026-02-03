import { mkdirp } from 'mkdirp'
import { PureCLMStats } from '../js/CLMStats'
import timeline from '../js/timeline.json'
import { render } from 'preact-render-to-string'
import { h } from 'preact'
import fs from 'node:fs';

const baseHtml = fs.readFileSync('./docs/index.html', 'utf-8');
fs.rmSync('./docs/index.html');

function mkLayout(urlSeason, urlPage) {
    const urlHref = `http://localhost:8080/${urlSeason}/${urlPage}.html`;
    const U = () => ({ urlHref });
    const appStr = render(h(PureCLMStats, { U }));
    const html = baseHtml.replace('__PRERENDER__', appStr);
    return html;
}

mkdirp.sync('./docs/_layouts/');
mkdirp.sync('./docs/p/');

for (const period of timeline.periods) {
    const periodId = period.periodId;
    const season = period.season;

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

    for (const page of ['stats', 'players', 'compare', 'h2h']) {
        const layout = `l-${periodId}-${page}`;
        const layoutPath = `./docs/_layouts/${layout}.html`;
        fs.writeFileSync(layoutPath, mkLayout(season, page));
        mkdirp.sync(`./docs/${season}`);
        const mdPath = `./docs/${season}/${page}.md`;
        fs.writeFileSync(mdPath, mkMd(page));
    }
}
