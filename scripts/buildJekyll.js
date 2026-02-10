import { mkdirp } from 'mkdirp';
import PureApp from '../js/PureApp';
import timeline from '../js/timeline.json';
import * as U from '../js/util';
import { render } from 'preact-render-to-string';
import { h } from 'preact';
import fs from 'node:fs';

const mkHtml = (appMarkup) => (`
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title> {{ page.title }} </title>
        <link href="/index.css" rel="stylesheet">
        <script>
            var periodFutureCache = {};
            function fetchPeriodImpl(periodId) {
                periodFutureCache[periodId] = new Promise((done, fail) => {
                    fetch("/db/periods/" + periodId + ".json")
                        .then((res) => res.json())
                        .then((period) => done(period))
                        .catch((error) => { 
                            delete periodFutureCache[periodId];
                            fail(error);
                        });
                });
                return periodFutureCache[periodId];
            }
            window.fetchPeriod = function(periodId) {
                if (!periodFutureCache[periodId]) {
                    return fetchPeriodImpl(periodId);
                } else {
                    return periodFutureCache[periodId];
                }
            };
            window.fetchPeriod({{ page.periodId }});
        </script>
        <script defer src="/index.js"></script>
        <script>
            /*to prevent Firefox FOUC, this must be here*/
            let FF_FOUC_FIX;
        </script>
    </head>
    <body class="min-h-screen bg-info dark:bg-info-content">
        ${appMarkup}
    </body>
</html>   
`).trim();

function mkLayout(periodId, page) {
    const props = {
        periodId,
        page,
        isLoading: true,
        sort: { by: U.resolveSortBy(), dir: U.resolveSortDir() },
        filter: {
            outOfRegion: true,
            inadAttendance: periodId !== U.timeline.current,
        },
    };
    return mkHtml(render(h(PureApp, props)));
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

    for (const page of U.PageTypes) {
        const layout = `l-${periodId}-${page}`;
        const layoutPath = `./docs/_layouts/${layout}.html`;
        fs.writeFileSync(layoutPath, mkLayout(periodId, page));
        mkdirp.sync(`./docs/${season}`);
        const mdPath = `./docs/${season}/${page}.md`;
        fs.writeFileSync(mdPath, mkMd(page));
        if (page === 'stats') {
            const mdPath = `./docs/${season}.md`;
            fs.writeFileSync(mdPath, mkMd(page));
        }
    }
}
