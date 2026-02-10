import { Component } from 'preact';
import PureApp from './PureApp';
import * as U from './util';

function getUrlState() {
  const url = new URL(window.location.href);
  const hrefPath = url.pathname;
  const parts = (/^\/([a-z0-9_\-]+)\/([a-z0-9]*)(\.html)?$/).exec(hrefPath.toLowerCase());
  const periodId = U.resolveSeasonStr((parts || [])[1]);
  const page = U.resolvePageStr((parts || [])[2]);
  const sort = {
    by: U.resolveSortBy(url.searchParams.get('by')),
    dir: U.resolveSortDir(url.searchParams.get('dir')),
  };
  const filter = U.resolveFilter(
    url.searchParams.get('filter') || U.getDefaultFilterStr(periodId)
  );
  return { page, periodId, sort, filter };
}

function cleanPeriod(period) {
  for (const eventId in period.events) {
    const event = period.events[eventId];
    const eventDate = new Date(event.date * 1000);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    event.dateString = (
      new Intl.DateTimeFormat('en-US', options).format(eventDate)
    );
  }
  return period;
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { ...getUrlState(), isLoading: true };
  }

  fetchPeriod(fetchedId = this.state.periodId, plusState = {}) {
    if (this.state.fetchedId === fetchedId) { this.modState(plusState); return; }
    this.modState({ ...plusState, isLoading: true, period: undefined });
    window.fetchPeriod(fetchedId)
      .then(cleanPeriod)
      .then(period => this.setState({ period, isLoading: false, fetchedId }))
      .catch(error => this.setState({ error }))
  }

  isStateSubset(nextState) {
    for (const k in nextState) {
      if (nextState[k] !== this.state[k]) { return false }
    }
    return true;
  }

  modState(nextState) {
    if (this.isStateSubset(nextState)) { return; }
    this.setState(nextState);
  }

  componentDidMount() {
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a');
      if (!anchor) { return; }
      const href = (anchor.getAttribute && anchor.getAttribute('href')) || '';
      if (!href.startsWith('/')) { return; }
      event.preventDefault();
      history.pushState({}, null, href);
      const nextState = getUrlState();
      this.fetchPeriod(nextState.periodId, nextState);
    });
    this.fetchPeriod();
  }

  render() {
    return (<PureApp {...this.state} />);
  }
}
