import { render, h } from 'preact';
import CLMStats, { PureCLMStats } from './CLMStats';
import * as U from './util';

const container = document.getElementById('app');

let el;
if (process.env.NODE_ENV === "production") {
    el = h(CLMStats);
} else {
    container.innerHTML = '';
    document.title = 'clmstats - dev';
    const urlParams = new URLSearchParams(window.location.search);
    window.periodFuture = (
        fetch(`/db/periods/${U.getPeriodId(urlParams.get('season'))}.json`).then(
            function (res) { return res.json(); }
        )
    )

    el = h(PureCLMStats, {
        U: () => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlSeason = urlParams.get('season') || 'chicago_2025-3';
            const urlPage = urlParams.get('page') || 'stats';
            const urlHref = `http://localhost:8000/${urlSeason}/${urlPage}.html`;
            function urlMk({ season, page } = {}) {
                if (!season) { return '/'; }
                if (!page) { return `/?season=${season}`; }
                return `/?season=${season}&page=${page}`;
            }
            function mkPeriodFuture() {
                return window.periodFuture;
            }
            return { urlHref, urlMk, mkPeriodFuture }
        },
    })
}

render(el, container);
