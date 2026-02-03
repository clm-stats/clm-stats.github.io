import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import cn from 'classnames';
import _timeline from './timeline.json';

const timeline = { ..._timeline };
timeline.periods = [..._timeline.periods];
timeline.periods.sort((p1, p2) => p2.periodId - p1.periodId);

const PERIODS = {}

const PERIOD_ID_BY_SEASON = {}
const SEASON_BY_PERIOD_ID = {}

for (const period of timeline.periods) {
  PERIODS[period.periodId] = period;
  PERIOD_ID_BY_SEASON[period.season] = period.periodId;
  SEASON_BY_PERIOD_ID[period.periodId] = period.season;
}

function resolveSeasonStr(str) {
  return PERIOD_ID_BY_SEASON[str] || timeline.current;
}

const PAGES = new Set(['stats', 'players', 'compare', 'h2h']);

function resolvePageStr(str) {
  return str && PAGES.has(str.toLowerCase()) ? str.toLowerCase() : 'stats';
}

const pageLoadData = {}

const cnActiveTrue = { 'is-active': true };
const cnActiveFalse = { 'is-active': false };

function cnActive(b) { return b ? cnActiveTrue : cnActiveFalse }

class CtxClass {

  constructor(state, setState) {
    this.state = state;
    this.setState = setState;
  }

  get href() { return this.state.href; }
  get page() { return resolvePageStr(this.state.page); }
  get season() { return SEASON_BY_PERIOD_ID[this.period]; }
  get period() { return this.state.period || timeline.current; }
  get periodTitle() { return PERIODS[this.period].title; }

  get isHamburgerOpen() { return !!this.state.isHamburgerOpen; }

  get isSideNavOpen() { return !!this.state.isSideNavOpen; }

  get cnBurgerActive() { return cnActive(this.isHamburgerOpen); }

  get cnSideNavActive() { return cnActive(this.isSideNavOpen); }

  get orgTree() {
    return this.state['org-tree'] || [];
  }

  toggleHamburger() { this.mergeState({ isHamburgerOpen: !this.isHamburgerOpen }); }
  toggleSideNav() { this.mergeState({ isSideNavOpen: !this.isSideNavOpen }); }

  mergeState(props) {
    this.setState({ ...this.state, ...props })
  }


  hPeriod(periodId) {
    return `/${SEASON_BY_PERIOD_ID[periodId]}/${this.page}`;
  }

  hPage(page) {
    return `/${this.season}/${page}`;
  }
}

const Ctx = createContext({});

function useCtx() {
  return useContext(Ctx);
}

function NavBarLink({ href, children, iht = false, ia = false }) {
  const className = cn('navbar-item', { 'is-hidden-touch navbar-item': iht, 'is-selected': ia });
  return (
    <a role='button' className={className} href={href} >
      {children}
    </a>
  );
}

function NF(s, marginInlineEnd = 0) {
  return <span style={{ marginInlineEnd }} className='mono'>{s}</span>
}

function Search() {
  return (
    <div className="field">
      <p className="control has-icons-right" >
        <input className="input" type="email" placeholder="Search Players..." />
        <span className="icon is-small is-right">
          {NF('')}
        </span>
      </p>
    </div>
  );
}

function Filters() {
  return (
    <div style={{ position: 'relative' }} className='dropdown is-right is-hoverable'>
      <div className="dropdown-trigger">
        <button className="button" aria-haspopup="true" aria-controls="dropdown-menu4">
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ transform: 'translateX(-30%)' }} >{NF('')}</div>
          </div>
          <span style={{ opacity: '0' }}>{''}</span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu4" role="menu">
        <div className="dropdown-content">
          <div className="dropdown-item">
            <p>
              You can insert <strong>any type of content</strong> within the
              dropdown menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


function Periods() {
  const X = useCtx();
  return (
    <div style={{ position: 'relative' }} className='dropdown is-right is-hoverable'>
      <div className="dropdown-trigger">
        <button className="button" aria-haspopup="true" aria-controls="dropdown-menu4">
          <span className='has-text-info'>
            {X.periodTitle}
          </span>&nbsp;&nbsp;&nbsp;{NF('')}
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu4" role="menu">
        <div className="dropdown-content">
          {timeline.periods.map(({ periodId, title }) => (
            <a
              key={periodId}
              href={X.hPeriod(periodId)}
              className={cn('dropdown-item', { 'is-active': periodId === X.period })}
            >
              {title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuBar() {
  const X = useCtx();

  return (
    <nav className='navbar is-fixed-top container is-max-widescreen'>
      <div className='navbar-brand is-flex-grow-1'>
        <NavBarLink href={`/?period=${X.period - 1}`}> <img src="/favicon.ico" /> CLM </NavBarLink>
        <NavBarLink ia={X.page === 'stats'} iht={true} href={X.hPage('stats')}> {NF('')}Stats</NavBarLink>
        <NavBarLink ia={X.page === 'players'} iht={true} href={X.hPage('players')}> {NF('')}Players</NavBarLink>
        <NavBarLink ia={X.page === 'compare'} iht={true} href={X.hPage('compare')}> {NF('')}Compare</NavBarLink>
        <NavBarLink ia={X.page === 'h2h'} iht={true} href={X.hPage('h2h')}> {NF('󰋁')}H2H</NavBarLink>
        <div
          className='navbar-item navitem-right'
          style={{ marginInlineStart: 'auto' }}
        >
          <Search />
        </div>
        <div className='navbar-item navitem-right' style={{}} > <Filters /> </div>
        <div className='navbar-item navitem-right' style={{ marginInlineEnd: '0.375rem' }} > <Periods /> </div>
        <a
          role='button'
          className={cn('navbar-burger', X.cnBurgerActive)}
          aria-label='menu'
          aria-expanded={X.isHamburgerOpen}
          data-target='docsNavbar'
          onClick={() => X.toggleHamburger()}
          style={{ marginInlineStart: '0.375rem' }}
        >
          <span /> <span /> <span /> <span />
        </a>
      </div>
      <div style={{ flex: 0 }} className={cn('navbar-menu', X.cnBurgerActive)} >
        <div className='navbar-start is-hidden-desktop'>
          <NavBarLink ia={X.page === 'stats'} href={X.hPage('stats')}> {NF('', "0.75rem")}Stats</NavBarLink>
          <NavBarLink ia={X.page === 'players'} href={X.hPage('players')}> {NF('', "0.75rem")}Players</NavBarLink>
          <NavBarLink ia={X.page === 'compare'} href={X.hPage('compare')}> {NF('', "0.75rem")}Compare</NavBarLink>
          <NavBarLink ia={X.page === 'h2h'} href={X.hPage('h2h')}> {NF('󰋁', "0.75rem")}H2H</NavBarLink>
        </div>
      </div>
    </nav>
  )
}

function Body() {
  const X = useCtx();
  return (
    <div className={cn('dz-docs-body', X.cnSideNavActive)} >
      <div className='section'>
        <div className='container'>
          BODY
        </div>
      </div>
    </div>
  )
}

export function PureCLMStats({ U }) {
  const { urlHref } = U();
  const hrefPath = (new URL(urlHref)).pathname;
  const parts = (/^\/([a-z0-9\-]+)\/([a-z0-9]+)(\.html)?$/).exec(hrefPath.toLowerCase());
  const urlPeriod = resolveSeasonStr((parts || [])[1]);
  const urlPage = resolvePageStr((parts || [])[2]);
  // const urlPeriod, urlPage, 
  pageLoadData.page = urlPage;
  pageLoadData.period = urlPeriod;
  pageLoadData.href = urlHref;
  const [state, setState] = useState({ ...pageLoadData });

  const ctx = new CtxClass(state, setState)

  useEffect(() => {
    if (urlPeriod !== ctx.period) {
      ctx.mergeState({ period: urlPeriod })
    }
  }, [urlPeriod]);
  useEffect(() => {
    if (urlPage !== ctx.page) {
      ctx.mergeState({ page: urlPage })
    }
  }, [urlPage]);
  useEffect(() => {
    if (urlHref !== ctx.href) {
      ctx.mergeState({ href: urlHref })
    }
  }, [urlHref])

  return (
    <Ctx.Provider value={ctx}>
      <div className='container box is-max-widescreen'>
        <MenuBar />
        <Body />
      </div>
    </Ctx.Provider>
  )
}

export default function CLMStats() {
  function U() {
    const urlHref = window.location.href;
    return { urlHref }
  }
  return <PureCLMStats U={U} />
}