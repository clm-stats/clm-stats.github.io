import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import cn from 'classnames';
import timeline from './timeline.json';

const PERIODS = {}

for (const period of timeline.periods) {
  PERIODS[period.periodId] = period;
}

function resolvePeriodIdStr(str) {
  const parsed = parseInt(str)
  return PERIODS[parsed] ? parsed : timeline.current;
}

const PAGES = new Set(['stats', 'player', 'compare', 'h2h']);

function resolvePageStr(str) {
  return str && PAGES.has(str.toLowerCase()) ? str.toLowerCase() : 'stats';
}

const pageLoadData = (window && window.pageLoadData) || {}

const cnActiveTrue = { 'is-active': true };
const cnActiveFalse = { 'is-active': false };

function cnActive(b) { return b ? cnActiveTrue : cnActiveFalse }

class CtxClass {

  constructor(state, setState) {
    this.state = state;
    this.setState = setState;
  }

  get page() { return resolvePageStr(this.state.page); }
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
}

const Ctx = createContext({});

function useCtx() {
  return useContext(Ctx);
}

function SideNav() {
  const X = useCtx();
  function renderTreeNode(path) {
    return function (el) {
      if (el.node === 'file') {
        return (
          <li key={el.name} >
            <a href={`${path}/${el.name}`} >
              {el.name}
            </a>
          </li>
        )
      } else {
        return (
          <li key={el.name}>
            <p className='menu-label'>{el.name}</p>
            <ul className='menu-list'>
              {el.children.map(renderTreeNode(path + "/" + el.name))}
            </ul>
          </li>
        )
      }
    }
  }
  return (
    <div className={cn('dz-docs-side-nav', X.cnSideNavActive)} >
      <aside className='menu scroll has-background-text-soft p-4'>
        <ul className='menu-list'>
          <li>
            <p className='menu-label'>org files</p>
            <ul className='menu-list'>
              {X.orgTree.map(renderTreeNode(""))}
            </ul>
          </li>
        </ul>
      </aside>
    </div>
  )
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

function hPeriod(periodId) {
  const url = new URL(window.location.href);
  if (periodId === timeline.current) {
    url.searchParams.delete('period');
  } else {
    url.searchParams.set('period', `${periodId}`);
  }
  return url.toString().replace(url.origin, '');
}

function hPage(page) {
  const url = new URL(window.location.href);
  if (page === 'stats') {
    url.searchParams.delete('page');
  } else {
    url.searchParams.set('page', page);
  }
  return url.toString().replace(url.origin, '');
}

function MenuBar() {
  const X = useCtx();
  return (
    <nav className='navbar is-fixed-top container is-max-widescreen'>
      <div className='navbar-brand is-flex-grow-1'>
        <NavBarLink href={`/?period=${X.period - 1}`}> <img src="/favicon.ico" /> CLM </NavBarLink>
        <NavBarLink ia={X.page === 'stats'} iht={true} href={hPage('stats')}> {NF('')}Stats</NavBarLink>
        <NavBarLink ia={X.page === 'player'} iht={true} href={hPage('player')}> {NF('')}Players</NavBarLink>
        <NavBarLink ia={X.page === 'compare'} iht={true} href={hPage('compare')}> {NF('')}Compare</NavBarLink>
        <NavBarLink ia={X.page === 'h2h'} iht={true} href={hPage('h2h')}> {NF('󰋁')}H2H</NavBarLink>
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
          <NavBarLink ia={X.page === 'stats'} href={hPage('stats')}> {NF('', "0.75rem")}Stats</NavBarLink>
          <NavBarLink ia={X.page === 'player'} href={hPage('player')}> {NF('', "0.75rem")}Players</NavBarLink>
          <NavBarLink ia={X.page === 'compare'} href={hPage('compare')}> {NF('', "0.75rem")}Compare</NavBarLink>
          <NavBarLink ia={X.page === 'h2h'} href={hPage('h2h')}> {NF('󰋁', "0.75rem")}H2H</NavBarLink>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  /*
  return (
    <footer className='footer'>
      <div className='content'>
        page footer
      </div>
    </footer>
  )
  */
  return null;
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

const urlParams = new URLSearchParams(window.location.search);
pageLoadData.page = resolvePageStr(urlParams.get('page'));
pageLoadData.period = resolvePeriodIdStr(urlParams.get('period'));

export default function CLMStats() {
  console.log(pageLoadData)
  console.log(useState)
  const [state, setState] = useState({ ...pageLoadData });

  const ctx = new CtxClass(state, setState)

  useEffect(() => {
    (async () => {
      const res = await fetch('/api?cmd=orgTree')
      setState({ ...state, 'org-tree': await res.json() })
    })()
  }, [])

  const urlParams = new URLSearchParams(window.location.search);

  const urlPeriod = resolvePeriodIdStr(urlParams.get('period'));
  const urlPage = resolvePageStr(urlParams.get('page'));

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

  return (
    <Ctx.Provider value={ctx}>
      <div className='container box is-max-widescreen'>
        <MenuBar />
        <div className='is-flex-grow-1 is-relative' >
          <Body />
        </div>
        <Footer />
      </div>
    </Ctx.Provider>
  )
}
