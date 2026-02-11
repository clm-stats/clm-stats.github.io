import { Component } from 'preact';
import * as U from './util';
import Icon from './Icon';
import cn from 'classnames';

const Sorteds = {};


const defaultProfileImage = '/img/CLM_Logo_Avatar_Placeholder.png';

class ProfileImage extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  setHasError() { this.setState({ hasError: true }); }
  render() {
    const { state: { hasError }, props } = this;
    const src = hasError ? defaultProfileImage : props.src;
    const onError = () => { if (!hasError) { this.setHasError(); } }
    const isDefaultSrc = src === defaultProfileImage;
    const className = cn(
      props.className || '',
      'text-transparent bg-base-300',
      { 'dark:filter-[brightness(55%)_contrast(1000%)]': isDefaultSrc }
    );
    return (
      <img
        {...props}
        className={className}
        src={src}
        onError={onError}
      />
    );
  }
}

export default function PureApp(props) {

  const { page, periodId, isLoading, period, error, sort, filter, fetchedId, prevState } = props;
  const season = U.getSeason(periodId);
  const title = U.getTitle(periodId);
  const isDefaultSortDir = sort.dir === U.getDefaultDir(sort.by);
  const isAscSort = sort.dir === 'asc';
  const opDir = isAscSort ? 'desc' : 'asc';
  const wasFetched = fetchedId === prevState.fetchedId;

  const players = (period || {}).players || {};
  const events = (period || {}).events || {};
  const ranks = (period || {}).ranks || [];
  const sortedRanks = ((() => {
    if (!ranks.length) { return []; }
    Sorteds[periodId] ||= {};
    Sorteds[periodId][sort.by] ||= {};
    if (Sorteds[periodId][sort.by][sort.dir]) {
      return Sorteds[periodId][sort.by][sort.dir];
    }
    if (Sorteds[periodId][sort.by][opDir]) {
      Sorteds[periodId][sort.by][sort.dir] = [
        ...(Sorteds[periodId][sort.by][opDir])
      ];
      Sorteds[periodId][sort.by][sort.dir].reverse();
      return Sorteds[periodId][sort.by][sort.dir];
    }
    Sorteds[periodId][sort.by][sort.dir] = [...ranks];
    const sortFn = (({
      ord: (r1, r2) => r1.rank - r2.rank,
      name: (r1, r2) => r1.playerIdent > r2.playerIdent ? 1 : -1,
      qual: (r1, r2) => r2.rank - r1.rank,
      acc: (r1, r2) => r1.winrate - r2.winrate,
      att: (r1, r2) => r1.prEvents - r2.prEvents,
      mru: (r1, r2) => events[r1.eventId].date - events[r2.eventId].date,
    })[sort.by]);
    Sorteds[periodId][sort.by][sort.dir].sort(sortFn);
    if (!isAscSort) {
      Sorteds[periodId][sort.by][sort.dir].reverse();
    }
    for (const rank of Sorteds[periodId][sort.by][sort.dir]) {
      rank.player = players[rank.playerIdent];
      rank.event = events[rank.eventId];
    }
    return Sorteds[periodId][sort.by][sort.dir];
  })());

  function doesMeetActivity(rank) {
    return rank.prEvents >= 8;
  }

  const displayRanks = sortedRanks.filter(rank => (
    (!filter.outOfRegion || U.inRegion(rank.player.name)) &&
    (!filter.inadAttendance || doesMeetActivity(rank))
  ));

  console.log({
    page, periodId, isLoading, period, error, season, title, sort,
    isDefaultSortDir, filter
  });

  function genUrl(overrides = {}) {
    const P = { periodId, page, sort, filter, ...overrides };
    P.sort = U.resolveSort(P.sort);
    return `/${U.getSeason(P.periodId)}/${P.page}${U.mkQs(P.sort, U.asSearchParams(P.filter))}`;
  }

  function menuCn(isActive) {
    return cn(
      'active:bg-primary/25 active:dark:bg-primary-content/25',
      'active:text-base-content',
      { 'active bg-primary/25 dark:bg-primary-content/25': isActive }
    );
  }

  function periodMenu(ulCn) {
    const pageHref = (page) => `/${season}/${page}`;
    const liEl = (liPage, icon, txt) => (
      <li key={liPage}>
        <a href={pageHref(liPage)} className={menuCn(page === liPage)}>
          {icon}&nbsp;{txt}
        </a>
      </li>
    );
    return (
      <ul tabIndex={-1} className={cn('menu', ulCn)}>
        {liEl('stats', (<Icon.chartColumn />), 'Stats')}
        {liEl('players', (<Icon.user />), 'Players')}
        {liEl('compare', (<Icon.userGroup />), 'Compare')}
        {liEl('h2h', (<Icon.tableCells />), 'H2H')}
      </ul>
    );
  }

  const tableRow = (rowCn, key) => (...cells) => {
    const cell = (i) => (
      <div
        className={cn(
          'left-0 top-0 absolute h-full w-full flex items-center',
          (i === 1 || i === 5) ? 'justify-start' : 'justify-center'
        )}
      >
        {cells[i]}
      </div>
    );
    return (
      <div key={key || 0} className={cn('table text-base w-[100%] min-w-240', rowCn)} >
        <div className='table-row'>
          <div className='relative table-cell w-22'>
            {cell(0)}
          </div>
          <div className='relative table-cell min-w-80 w-auto'>
            {cell(1)}
          </div>
          <div className='relative table-cell w-28'>
            {cell(2)}
          </div>
          <div className='relative table-cell w-28'>
            {cell(3)}
          </div>
          <div className='relative table-cell w-28'>
            {cell(4)}
          </div>
          <div
            style={{ width: 'max(16rem, 18vw)' }}
            className='relative table-cell'
          >
            {cell(5)}
          </div>
        </div>
      </div>
    );
  }

  function statsHeader() {
    function shLink(by, content) {
      const isBy = by === sort.by;
      const nDir = isBy ? (isAscSort ? 'desc' : 'asc') : U.getDefaultDir(by);
      return (
        <a
          href={genUrl({ sort: { by, dir: nDir } })}
          className={cn(
            'group transition ease-in-out duration-300 whitespace-nowrap',
            'flex font-bold hover:underline hover:text-primary items-center',
            { 'text-primary underline': isBy }
          )}
        >
          {content}
          &nbsp;
          <span className='relative'>
            <span className={isBy ? 'group-hover:opacity-25' : 'group-hover:opacity-0'}>
              {isBy ?
                (isAscSort ? <Icon.sortUp.s4 /> : <Icon.sortDown.s4 />) :
                (<Icon.sort.s4 />)}
            </span>
            <div
              className={cn(
                'absolute top-0 left-0 w-full h-full',
                'flex justify-center items-center',
                'hidden group-hover:block',
              )}
            >
              {(nDir === 'asc') ? (<Icon.sortUp.s4 />) : (<Icon.sortDown.s4 />)}
            </div>
          </span>
        </a>
      );
    }
    const rowEl = tableRow(
      'h-10 bg-base-300 rounded-none border-b-2 border-gray-300 dark:border-gray-700'
    )(
      (<span className='font-bold'>#</span>),
      shLink('name', 'Player'),
      shLink('qual', 'Rating'),
      shLink('acc', 'W - L'),
      shLink('att', 'PR Events'),
      shLink('mru', 'Last Event'),
    );
    return (<div className='sticky z-30 top-16'>{rowEl}</div>);
  }

  function statsPage() {
    function tbRow(args) {
      return tableRow('h-25 border-b-1 border-gray-300 dark:border-gray-700 rounded-none ' + args.cn || '', args.key)(
        (<div className='font-extrabold text-4xl'>{args.ord}</div>),
        ((body => args.playerHref ? (<a href={args.playerHref} className='group flex items-center justify-start flex-1'>{body}</a>) : (<div className='flex items-center justify-start flex-1'>{body}</div>))(
          <>
            <div className='w-2' />
            <div className='h-13 w-13 rounded-full overflow-hidden shadow-md group-hover:shadow-primary'>
              {args.profileImage}
            </div>
            <div className='w-4' />
            <div className='flex flex-col justify-center flex-1 relative overflow-hidden'>
              <div className='whitespace-nowrap text-xl font-bold text-primary group-hover:underline'>
                {args.name}
              </div>
              <div className='text-sm'>{args.pronouns}</div>
              <div>{args.character}</div>
            </div>
          </>
        )),
        (<div className=''>{args.qual}</div>),
        (<div className=''>{args.acc}</div>),
        (<div className=''>{args.att}</div>),
        (
          <div className='flex flex-col overflow-hidden'>
            <div className='overflow-hidden whitespace-nowrap text-ellipsis'>{args.mruLink}</div>
            <div className='overflow-hidden whitespace-nowrap text-sm text-ellipsis'>{args.mruPlacing}</div>
            <div className='overflow-hidden whitespace-nowrap text-sm text-ellipsis opacity-75'>{args.mruDate}</div>
          </div>
        ),
      );
    }
    const skelRow = (key) => tbRow({
      key,
      ord: (<div className='skeleton h-6 w-10' />),
      profileImage: (<div className='skeleton w-full h-full' />),
      name: (<div className='skeleton h-4 w-25' />),
      pronouns: (<div className='skeleton h-3 w-7' />),
      character: (<div className='skeleton h-3 w-3' />),
      qual: (<div className='skeleton h-4 w-12' />),
      acc: (
        <div className='flex gap-1'>
          <div className='skeleton h-4 w-6' />
          <div className='skeleton h-4 w-6' />
        </div>
      ),
      att: (<div className='skeleton h-4 w-9' />),
      mruLink: (<div className='skeleton h-4 w-19' />),
      mruPlacing: (<div className='skeleton h-4 w-8' />),
      mruDate: (<div className='skeleton h-4 w-6' />),
    });
    return (
      <>
        {statsHeader()}
        {isLoading ? (
          <>
            {skelRow(1)}
            {skelRow(2)}
            {skelRow(3)}
            {skelRow(4)}
            {skelRow(5)}
            {skelRow(6)}
            {skelRow(7)}
            {skelRow(8)}
            {skelRow(9)}
            {skelRow(10)}
            {skelRow(11)}
            {skelRow(12)}
            {skelRow(13)}
            {skelRow(14)}
            {skelRow(15)}
            {skelRow(16)}
          </>
        ) : (
          displayRanks.map((rank, ind) => tbRow({
            key: rank.playerIdent,
            wasFetched,
            ord: (
              isDefaultSortDir ? (ind + 1) : (displayRanks.length - ind)
            ),
            playerHref: genUrl({ players: [rank.playerIdent] }),
            profileImage: (
              <ProfileImage
                src={rank.player.image}
                className={cn('object-cover w-full h-full')}
                loading="lazy"
                alt='start.gg profile image'
              />
            ),
            name: (rank.player.name),
            pronouns: (rank.player.pronouns),
            character: (((imgName) => !imgName ? null : (
              <img
                style={{ height: '1.25rem', width: '1.25rem' }}
                src={`/chars/${imgName}.png`}
              />)
            )(U.lkupChar(rank.player.name))),
            qual: (rank.rating),
            acc: `${rank.wins || 0} - ${rank.losses || 0}`,
            att: rank.prEvents || 0,
            mruLink: (
              <a
                className='nowrap text-primary hover:underline'
                href={`https://start.gg/${rank.event.slug}`}
              >
                {rank.event.tournamentName}
              </a>
            ),
            mruPlacing: `${rank.placingString} of ${rank.event.numEntrants}`,
            mruDate: rank.event.dateString,
          }))
        )
        }
      </>
    );
  }

  function playersPage() {
    return (
      <div>
        players
      </div>
    );
  }

  function comparePage() {
    return (
      <div>
        comparePage
      </div>
    );
  }

  function h2hPage() {
    return (
      <div>
        h2hPage
      </div>
    );
  }

  const PAGE_GENS = {
    stats: statsPage,
    players: playersPage,
    compare: comparePage,
    h2h: h2hPage,
  };

  return (
    <div className='container max-w-290 rounded-none min-h-screen mx-auto px-0 card bg-base-100 shadow-xl m-4 my-0'>
      <div className='w-auto max-w-screen min-h-screen max-h-screen overflow-scroll'>
        <div className='flex max-w-screen flex-col self-stretch sticky z-40 left-0 top-0'>
          <div className='navbar h-15 border-b-2 border-gray-300 dark:border-gray-700 relative z-50 p-2 py-0 bg-base-200 shadow-sm'>
            <div className='navbar-start w-auto gap-4'>
              <a href='https://chicagomelee.com/' className='btn btn-ghost px-1' tabIndex={0} role='button'>
                <img className='w-8 h-8' src='/favicon.ico' />
                <span className='hidden lg:inline'>CLM</span>
              </a>
              {periodMenu('menu-horizontal hidden lg:flex px-1 gap-2')}
              <div className='w-4' />
            </div>
            <div className='navbar-end flex-1 gap-4'>
              <div className='join rounded border-gray-100 dark:border-gray-900 border-1'>
                <div className='border join-item border-gray-300 dark:border-gray-700'>
                  <label className='input h-9 border-0'>
                    <Icon.magnifyingGlass />
                    <input type="text" placeholder='Search Players...' />
                  </label>
                </div>
                {(page !== 'stats') ? null : (
                  <div className='dropdown dropdown-hover dropdown-end join-item border border-gray-300 dark:border-gray-700'>
                    <button tabIndex={0} role='button' className='btn btn-sm h-full btn-soft rounded-none border-0'>
                      <Icon.filter />
                    </button>
                    <ul tabIndex={-1} className='dropdown-content menu bg-base-200 rounded-box z-50 w-62 p-2 shadow-sm'>
                      <li>Filter Players:</li>
                      <li>
                        <a
                          className={menuCn(false)}
                          href={genUrl({ filter: { ...filter, outOfRegion: !filter.outOfRegion } })}
                        >
                          <label>
                            <input type='checkbox' checked={filter.outOfRegion} className='checkbox h-5 w-5 checkbox-primary' />
                            &nbsp;
                            Out of Region
                          </label>
                        </a>
                      </li>
                      <li>
                        <a
                          className={menuCn(false)}
                          href={genUrl({ filter: { ...filter, inadAttendance: !filter.inadAttendance } })}
                        >
                          <label>
                            <input type='checkbox' checked={filter.inadAttendance} className='checkbox h-5 w-5 checkbox-primary' />
                            &nbsp;
                            Insufficient Attendance
                          </label>
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
                <div key={page} className='lg:hidden dropdown dropdown-hover dropdown-end join-item border border-gray-300 dark:border-gray-700'>
                  <button tabIndex={0} role='button' className='btn btn-sm h-full btn-soft rounded-none border-0'>
                    <Icon.bars />
                  </button>
                  {periodMenu('menu-sm dropdown-content bg-base-200 gap-1 rounded-box z-50 w-52 p-2 shadow')}
                </div>
                <div key={periodId} className='dropdown dropdown-hover dropdown-end join-item border border-gray-300 dark:border-gray-700'>
                  <button tabIndex={0} role='button' className='btn btn-sm h-full btn-soft rounded-none border-0'>
                    <Icon.calendar />
                    <span className='text-base hidden lg:inline'>
                      {title}
                    </span>
                  </button>
                  <ul tabIndex={-1} className='dropdown-content menu bg-base-200 rounded-box z-50 w-52 p-2 shadow-sm'>
                    {(U.timeline.periods.map((p) => (
                      <li key={p.periodId}>
                        <a
                          href={`/${U.getSeason(p.periodId)}/${page}`}
                          className={menuCn(p.periodId === periodId)}
                        >
                          {p.title}
                        </a>
                      </li>
                    )))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {PAGE_GENS[page]()}
      </div>
    </div>
  );
}
