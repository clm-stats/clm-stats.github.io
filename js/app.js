import { render, h } from 'preact';
import CLMStats, { PureCLMStats } from './CLMStats';

let el;
if (process.env.NODE_ENV === "production") {
    el = h(CLMStats);
} else {
    el = h(PureCLMStats, {
        U: () => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlPeriod = urlParams.get('period') || 13;
            const urlPage = urlParams.get('page') || 'stats';
            const urlHref = `http://localhost:8000/p/${urlPeriod}/${urlPage}.html`;
            return { urlPage, urlPeriod, urlHref }
        },
    })
}

render(el, document.getElementById('app'));
