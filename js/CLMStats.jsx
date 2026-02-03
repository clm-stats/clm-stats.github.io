import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import cn from 'classnames';
import * as U from './util';

const pageLoadData = {}

const cnActiveTrue = { 'is-active': true };
const cnActiveFalse = { 'is-active': false };

function cnActive(b) { return b ? cnActiveTrue : cnActiveFalse }

class CtxClass {

  constructor(state, setState, urlMk) {
    this.state = state;
    this.setState = setState;
    this.urlMk = urlMk;
  }

  get isLoadingPeriod() { return this.state.isLoadingPeriod; }
  get href() { return this.state.href; }
  get page() { return U.resolvePageStr(this.state.page); }
  get season() { return U.getSeason(this.periodId); }
  get periodId() { return this.state.periodId || U.timeline.current; }
  get periodTitle() { return U.Period(this.periodId).title; }

  get isHamburgerOpen() { return !!this.state.isHamburgerOpen; }

  get isSideNavOpen() { return !!this.state.isSideNavOpen; }

  get cnBurgerActive() { return cnActive(this.isHamburgerOpen); }

  get orgTree() {
    return this.state['org-tree'] || [];
  }

  toggleHamburger() { this.mergeState({ isHamburgerOpen: !this.isHamburgerOpen }); }

  mergeState(props) {
    this.setState({ ...this.state, ...props })
  }


  hPeriod(periodId) {
    return this.urlMk({ season: U.getSeason(periodId), page: this.page });
  }

  hPage(page) {
    return this.urlMk({ season: this.season, page });
  }

  character(playerIdent) {
    const { players } = this.state.period;
    const player = players[playerIdent] || {};
    return U.lkupChar(player.name);
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
  return (
    <span
      style={{
        marginInlineEnd,
        display: 'inline-block',
        position: 'relative',
      }}
    >
      <span
        style={{ visibility: 'hidden' }}
      >
        {s}
      </span>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          className='mono'
        >
          {s}
        </span>
      </div>
    </span>
  )
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
          <span className='has-text-info is-hidden-touch'>
            {X.periodTitle}
          </span>
          <span className='has-text-info is-hidden-desktop'>
            {NF('')}
          </span>
          &nbsp;&nbsp;&nbsp;
          <span className='has-text-info'>
            {NF('')}
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu4" role="menu">
        <div className="dropdown-content">
          {U.timeline.periods.map(({ periodId, title }) => (
            <a
              key={periodId}
              href={X.hPeriod(periodId)}
              className={cn('dropdown-item', { 'is-active': periodId === X.periodId })}
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
        <NavBarLink href="https://chicagomelee.com/"> <img src="/favicon.ico" /> CLM </NavBarLink>
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

function StatsTable() {
  const X = useCtx();

  const skelEl = (
    <tr>
      <td>
        <h2 className='subtitle is-skeleton' >1</h2>
      </td>
      <td className='is-flex is-flex-direction-row'>
        <span className='icon is-skeleton' >1</span>
        <div className='mx-2' />
        <div className='skeleton-lines is-flex-grow-1'> <div /><div /> </div>
      </td>
      <td>
        <div className='skeleton-lines is-flex-grow-1'> <div /> </div>
      </td>
      <td>
        <div className='skeleton-lines is-flex-grow-1'> <div /> </div>
      </td>
      <td>
        <div className='skeleton-lines is-flex-grow-1'> <div /> </div>
      </td>
      <td>
        <div className='skeleton-lines is-flex-grow-1'> <div /> <div /> </div>
      </td>
    </tr>
  );
  const skel = (
    <tbody>{skelEl}{skelEl}{skelEl}{skelEl}{skelEl}{skelEl}{skelEl}</tbody>
  )

  const el = (X.isLoadingPeriod ? (() => skel) : (() => {
    const { players, ranks, events } = X.state.period;
    const rows = ranks.map((rank) => {
      const player = players[rank.playerIdent];
      const character = X.character(rank.playerIdent);
      const event = events[rank.eventId]
      return (
        <tr key={rank.playerIdent} >
          <td
            className='has-text-weight-extrabold is-size-3 has-text-centered'
          >
            <div> {rank.rank || '-'} </div>
          </td>
          <td>
            <a className='is-flex is-flex-direction-row is-align-items-center player-info' href="#">
              <div
                href='#'
              >
                <img
                  src={player.image}
                  loading="lazy"
                  alt='profile pic'
                />
              </div>
              <div className='is-flex is-flex-direction-column'>
                <div className='no_wrap has-text-weight-bold is-size-5'>{player.name}</div>
                {!player.pronouns ? null : (
                  <div
                    className='no_wrap is-size-7'
                  >
                    {player.pronouns}
                  </div>
                )}
                {!character ? null : (
                  <img
                    style={{ height: '1.25rem', width: '1.25rem' }}
                    src={`/chars/${character}.png`}
                  />
                )}
              </div>
            </a>
          </td>
          <td className='py-5 nowrap has-text-centered'>{rank.rating}</td>
          <td className='nowrap has-text-centered'>{rank.wins || 0} - {rank.losses || 0}</td>
          <td className='nowrap has-text-centered'>{rank.prEvents || 0}</td>
          <td className=''>
            <div className='is-flex is-flex-direction-column is-justify-content-center'>
              <a
                className='nowrap'
                href={`https://start.gg/${event.slug}`}
              >
                {event.tournamentName}
              </a>
              <div className='nowrap'>
                {rank.placingString} of {event.numEntrants}
              </div>
              <div className='nowrap'>
                date
              </div>
            </div>
          </td>
        </tr>
      );
    });
    return (
      <tbody>
        {rows}
      </tbody>
    );
  }))();
  return (
    <div className='is-flex-grow-1 is-flex is-flex-direction-column is-align-items-stretch rel' >
      <div
        className='table-container'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        <table
          className='table'
        >
          <thead>
            <tr>
              <th className='has-text-centered'>
                <a href="#">
                  #&nbsp;{NF('')}
                </a>
              </th>
              <th>Player</th>
              <th className='has-text-centered'>Elo</th>
              <th className='has-text-centered'>W-L</th>
              <th className='has-text-centered'>PR Events</th>
              <th>Last Event</th>
            </tr>
          </thead>
          {el}
        </table>
      </div>
    </div>
  );
}

function Body() {
  const X = useCtx();
  return (
    <div className='section p-0 is-flex-grow-1 is-flex is-flex-direction-column'>
      <div className='container is-flex-grow-1 is-flex is-flex-direction-column'>
        <StatsTable />
      </div>
    </div>
  )
}

export function PureCLMStats(props) {
  const { urlHref, urlMk, mkPeriodFuture } = props.U();
  const hrefPath = (new URL(urlHref)).pathname;
  const parts = (/^\/([a-z0-9_\-]+)\/([a-z0-9]+)(\.html)?$/).exec(hrefPath.toLowerCase());
  const urlPeriod = U.resolveSeasonStr((parts || [])[1]);
  const urlPage = U.resolvePageStr((parts || [])[2]);
  // const urlPeriod, urlPage, 
  pageLoadData.page = urlPage;
  pageLoadData.periodId = urlPeriod;
  pageLoadData.href = urlHref;
  pageLoadData.isLoadingPeriod = true;
  const [state, setState] = useState({ ...pageLoadData });

  const ctx = new CtxClass(state, setState, urlMk);

  useEffect(() => {
    mkPeriodFuture()
      .then((period) => ctx.mergeState({ period, isLoadingPeriod: false }))
      .catch((error) => ctx.mergeState({ error }))
  }, [])

  useEffect(() => {
    if (urlPeriod !== ctx.periodId) {
      ctx.mergeState({ periodId: urlPeriod })
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
      <div className='container px-0 box is-max-widescreen is-flex is-flex-direction-column'>
        <MenuBar />
        <Body />
      </div>
    </Ctx.Provider>
  )
}

export default function CLMStats() {
  function U() {
    const urlHref = window.location.href;
    function mkPeriodFuture() {
      return window.periodFuture;
    }
    function urlMk({ season, page } = {}) {
      if (!season) { return '/'; }
      if (!page) { return `/${season}`; }
      return `/${season}/${page}`;
    }
    return { urlHref, urlMk, mkPeriodFuture }
  }
  return <PureCLMStats U={U} />
}