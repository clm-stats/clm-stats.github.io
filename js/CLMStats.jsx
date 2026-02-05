import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import cn from 'classnames';
import * as U from './util';

const pageLoadData = {}

const cnActiveTrue = { 'is-active': true };
const cnActiveFalse = { 'is-active': false };

function cnActive(b) { return b ? cnActiveTrue : cnActiveFalse }

class CtxClass {

  constructor(state, setState, urlMk, urlHrefMk) {
    this.state = state;
    this.setState = setState;
    this.urlMk = urlMk;
    this.urlHrefMk = urlHrefMk;
    this.sorts = {};
  }

  getSortedImpl() {
    console.log(this.sortKey);
    console.log(this.sort.by, this.sort.dir)
    const { events, ranks } = this.state.period;
    const res = [...ranks];
    const sortFn = (({
      ord: (r1, r2) => r1.rank - r2.rank,
      name: (r1, r2) => r1.playerIdent > r2.playerIdent ? 1 : -1,
      qual: (r1, r2) => r2.rank - r1.rank,
      acc: (r1, r2) => r1.winrate - r2.winrate,
      att: (r1, r2) => r1.prEvents - r2.prEvents,
      mru: (r1, r2) => events[r1.eventId].date - events[r2.eventId].date,
    })[this.sort.by]);
    res.sort(sortFn);
    if (this.sort.dir !== 'asc') {
      res.reverse();
    }
    return res;
  }
  get sorted() {
    return (this.sorts[this.sortKey] ||= this.getSortedImpl())
  }
  get isInitialSortDir() {
    return this.sort.dir === U.getDefaultDir(this.sort.by);
  }
  get sort() { return this.state.sort || {}; }
  get sortKey() {
    return `${this.sort.by}|${this.sort.dir}`;
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
    console.log('merging....', props);
    if (props.period && props.period !== this.state.period) {
      this.sorts = {};
    }
    this.setState({ ...this.state, ...props })
  }


  hPeriod(periodId) {
    return this.urlMk({ season: U.getSeason(periodId), page: this.page });
  }

  hPage(page) {
    return this.urlMk({ season: this.season, page });
  }

  hSort(by, dir) {
    const sort = { by, dir };
    return this.urlMk({ season: this.season, page: this.page, sort });
  }

  character(playerIdent) {
    const { players } = this.state.period;
    const player = players[playerIdent] || {};
    return U.lkupChar(player.name);
  }

  onHref(href) {
    if (href !== window.location.href) {
      console.log('push window history');
      window.history.pushState({}, null, href);
      console.log('pushed');
      const urlHref = this.urlHrefMk();
      const url = new URL(urlHref);
      const hrefPath = url.pathname;
      console.log({ urlHref, url, hrefPath })
      const parts = (/^\/([a-z0-9_\-]+)\/([a-z0-9]+)(\.html)?$/).exec(hrefPath.toLowerCase());
      const periodId = U.resolveSeasonStr((parts || [])[1]);
      const page = U.resolvePageStr((parts || [])[2]);
      const isLoadingPeriod = periodId !== this.state.periodId;
      const period = isLoadingPeriod ? null : this.state.period;
      const sort = {
        dir: U.resolveSortDir(url.searchParams.get('dir')),
        by: U.resolveSortBy(url.searchParams.get('by')),
      };
      async function after() {
        if (!isLoadingPeriod) { return {} }
        try {
          const res = await fetch(`/db/periods/${periodId}.json`);
          const period = await res.json();
          return { period, isLoadingPeriod: false };
        } catch (error) {
          return { error };
        }
      }
      const newState = (
        { periodId, page, href: urlHref, period, isLoadingPeriod, sort, after }
      );
      this.mergeState(newState);
    }
  }
}

const Ctx = createContext({});

function useCtx() {
  return useContext(Ctx);
}

function Link(props) {
  const X = useCtx();
  function onClick(e) {
    e.preventDefault();
    X.onHref(props.href);
  }
  return (
    <a {...props} onClick={onClick} />
  );
}


function NavBarLink({ href, children, iht = false, ia = false }) {
  const className = cn('navbar-item', { 'is-hidden-touch navbar-item': iht, 'is-selected': ia });
  return (
    <Link role='button' className={className} href={href} >
      {children}
    </Link>
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
            <Link
              key={periodId}
              href={X.hPeriod(periodId)}
              className={cn('dropdown-item', { 'is-active': periodId === X.periodId })}
            >
              {title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function THCell({ className, by, text }) {
  const X = useCtx();
  const isAsc = X.sort.dir === 'asc';
  const isActive = X.sort.by === by;
  const sym = !isActive ? '' : (
    isAsc ? '' : ''
  )
  const nextDir = !isActive ? U.getDefaultDir(by) : (isAsc ? 'desc' : 'asc');
  return (
    <th className={className || ''}>
      <Link
        className={cn('has-text-strong', { 'is-underlined': isActive })}
        href={X.hSort(by, nextDir)}
      >
        {text}&nbsp;
        <span className='rel'>
          <span className='curr-sort'>
            {NF(sym)}
          </span>
          <span className='next-sort is-overlay is-flex'>
            {NF(nextDir === 'asc' ? '' : '')}
          </span>
        </span>
      </Link>
    </th>
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

const defaultProfileImage = '/img/CLM_Logo_Avatar_Placeholder.png';

function ProfileImage(props) {
  const [hasError, setHasError] = useState(false);
  const className = cn(props.className || '', { defaultProfile: hasError });
  const src = hasError ? defaultProfileImage : props.src;
  function onError() { if (!hasError) { setHasError(true); } }
  return (
    <img {...props} className={className} src={src} onError={onError} />
  );
}

function PureRow(props) {
  return (
    <tr>
      <td
        className='has-text-weight-extrabold is-size-3 has-text-centered'
      >
        <div>
          {props.ord}
        </div>
      </td>
      <td>
        <Link
          href={props.href}
          className='is-flex is-flex-direction-row is-align-items-center player-info'
        >
          <div >
            {props.profileImage}
          </div>
          <div className='is-flex is-flex-direction-column'>
            <div className='no_wrap has-text-weight-bold is-size-5'>{props.name}</div>
            {!props.pronouns ? null : (
              <div
                className='no_wrap is-size-7'
              >
                {props.pronouns}
              </div>
            )}
            {props.character}
          </div>
        </Link>
      </td>
      <td className='py-5 nowrap has-text-centered'>{props.qual}</td>
      <td className='nowrap has-text-centered'>{props.acc}</td>
      <td className='nowrap has-text-centered'>{props.att}</td>
      <td className=''>
        <div className='is-flex is-flex-direction-column is-justify-content-center'>
          {props.mruLink}
          <div className='nowrap'>
            {props.mruPlacing}
          </div>
          <div className='nowrap has-text-weak'>
            {props.mruDate}
          </div>
        </div>
      </td>
    </tr>
  );
}

function StatsTable() {
  const X = useCtx();

  const skelEl = (
    <PureRow
      ord={(<button className='button is-skeleton' />)}
      profileImage={(<div className='skeleton-block' />)}
      name={(<div className='skeleton-lines'><div /></div>)}
      pronouns={<span className='tag is-skeleton'>pronouns</span>}
      character={<span className='icon is-skeleton'>c</span>}
      qual={(<div className='skeleton-lines'><div /></div>)}
      acc={(<div className='skeleton-lines'><div /></div>)}
      att={(<div className='skeleton-lines'><div /></div>)}
      mruLink={(<div className='skeleton-lines'><div /></div>)}
      mruPlacing={<span className='tag is-skeleton'>placing</span>}
      mruDate={<span className='tag is-skeleton'>date</span>}
    />
  );

  const skel = (
    <tbody>
      {skelEl}{skelEl}{skelEl}{skelEl}{skelEl}{skelEl}{skelEl}
      {skelEl}{skelEl}{skelEl}{skelEl}{skelEl}{skelEl}{skelEl}
      {skelEl}{skelEl}{skelEl}{skelEl}{skelEl}{skelEl}{skelEl}
    </tbody>
  )

  const el = (X.isLoadingPeriod ? (() => skel) : (() => {
    const { players, events } = X.state.period;
    const filtered = X.sorted.filter(rank => U.inRegion(rank.playerIdent));
    const rows = filtered.map((rank, nth) => {
      const player = players[rank.playerIdent];
      const character = X.character(rank.playerIdent);
      const event = events[rank.eventId]
      const eventDate = new Date(event.date * 1000);

      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const dstr = new Intl.DateTimeFormat('en-US', options).format(eventDate);
      const defaultProfile = (
        player.image === defaultProfileImage
      );

      return (
        <tr key={rank.playerIdent} >
          <td
            className='has-text-weight-extrabold is-size-3 has-text-centered'
          >
            <div>
              {X.isInitialSortDir ? (nth + 1) : (filtered.length - nth)}
            </div>
          </td>
          <td>
            <a className='is-flex is-flex-direction-row is-align-items-center player-info' href="#">
              <div >
                <ProfileImage
                  src={player.image}
                  className={cn({ defaultProfile })}
                  loading="lazy"
                  alt='start.gg profile image'
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
              <div className='nowrap has-text-weak'>
                {dstr}
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
              <th className='has-text-centered'> # </th>
              <THCell by="name" text="Player" />
              <THCell className='has-text-centered' by="qual" text="Rating" />
              <THCell className='has-text-centered' by="acc" text="W - L" />
              <THCell className='has-text-centered' by="att" text="PR Events" />
              <THCell by="mru" text="Last Event" />
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

let __state;
let initialState;
export function PureCLMStats(props) {
  const { urlHrefMk, urlMk, mkPeriodFuture } = props.U();
  if (!pageLoadData.isDone) {
    console.log('doing this shit!')
    const urlHref_ = urlHrefMk();
    const url = new URL(urlHref_);
    const hrefPath = url.pathname;
    const parts = (/^\/([a-z0-9_\-]+)\/([a-z0-9]+)(\.html)?$/).exec(hrefPath.toLowerCase());
    const urlPeriod = U.resolveSeasonStr((parts || [])[1]);
    const urlPage = U.resolvePageStr((parts || [])[2]);
    // const urlPeriod, urlPage, 
    pageLoadData.page = urlPage;
    pageLoadData.periodId = urlPeriod;
    pageLoadData.href = urlHref_;
    pageLoadData.isLoadingPeriod = true;
    console.log(url.searchParams)
    pageLoadData.sort = {
      dir: U.resolveSortDir(url.searchParams.get('dir')),
      by: U.resolveSortBy(url.searchParams.get('by')),
    };
    initialState = { ...pageLoadData }
    pageLoadData.isDone = true;
  }

  const [state, _setState] = useState(initialState);
  function setState(newState) {
    __state = newState;
    _setState(newState);
  }

  const ctx = new CtxClass(state, setState, urlMk, urlHrefMk);
  ctx.state = state;

  console.log(state.sort)

  useEffect(() => {
    if (state.after) {
      state.after().then((ups) => setState({ ...__state, ...ups }))
    }
  }, [state.after])

  useEffect(() => {
    console.log('mounting app entry')
    mkPeriodFuture()
      .then((period) => ctx.mergeState({ period, isLoadingPeriod: false }))
      .catch((error) => ctx.mergeState({ error }))
  }, [])

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
    const urlHrefMk = () => window.location.href;
    function mkPeriodFuture() {
      return window.periodFuture;
    }
    function urlMk({ season, page, sort = {} } = {}) {
      const base = ((() => {
        if (!season) { return '/'; }
        if (!page) { return `/${season}`; }
        return `/${season}/${page}`;
      })());
      return base + U.mkQs(U.resolveSort(sort));
    }
    return { urlHrefMk, urlMk, mkPeriodFuture }
  }
  return <PureCLMStats U={U} />
}