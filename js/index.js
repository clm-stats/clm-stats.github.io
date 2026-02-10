import { render, h } from 'preact';
import App from './App';

document.addEventListener("DOMContentLoaded", function () {
    render(h(App, {}), document.body);
});
