import * as U from './util';
import Icon from './Icon';
import cn from 'classnames';

export default function PureApp(props) {

  const { page, periodId, isLoading, period, error } = props;
  const season = U.getSeason(periodId);
  const title = U.getTitle(periodId);

  console.log({ page, periodId, isLoading, period, error, season, title });

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
      <ul className={cn('menu', ulCn)}>
        {liEl('stats', (<Icon.chartColumn />), 'Stats')}
        {liEl('players', (<Icon.user />), 'Players')}
        {liEl('compare', (<Icon.userGroup />), 'Compare')}
        {liEl('h2h', (<Icon.tableCells />), 'H2H')}
      </ul>
    );
  }

  const tableRow = (rowCn) => (...cells) => {
    const cell = (i) => (
      <div
        className={cn(
          'left-0 top-0 absolute h-full w-full flex items-center',
          i === 1 ? 'justify-start px-4' : 'justify-center'
        )}
      >
        {cells[i]}
      </div>
    );
    return (
      <div className={cn('table text-base w-[100%] min-w-175', rowCn)} >
          <div className='table-row'>
            <div
              style={{ width: '5rem' }}
              className='relative table-cell'
            >
              {cell(0)}
            </div>
            <div className='relative table-cell min-w-80 w-auto'>
              {cell(1)}
            </div>
            <div
              style={{ width: '7rem' }}
              className='relative table-cell'
            >
              {cell(2)}
            </div>
            <div
              style={{ width: '7rem' }}
              className='relative table-cell'
            >
              {cell(3)}
            </div>
            <div
              style={{ width: '7rem' }}
              className='relative table-cell'
            >
              {cell(4)}
            </div>
            <div
              style={{ width: 'max(11rem, 16vw)' }}
              className='relative table-cell'
            >
              {cell(5)}
            </div>
          </div>
      </div>
    );
  }

  function statsHeader() {
    return tableRow(
      'h-10 bg-base-300 rounded-none border-b-2 border-gray-300 dark:border-gray-700'
    )(
      (<span className='font-bold'>#</span>),
      (<a href='/' className='font-bold hover:underline hover:text-primary'>Player</a>),
      3, 
      4, 
      5, 
      6
    );
  }

  return (
    <div className='container rounded-none min-h-screen mx-auto px-0 card bg-base-100 shadow-xl m-4 my-0'>
      <div className='flex flex-col self-stretch sticky z-40 top-0'>
        <div className='navbar border-b-2 border-gray-300 dark:border-gray-700 relative z-50 p-2 min-h-auto bg-base-200 shadow-sm'>
          <div className='navbar-start w-auto gap-4'>
            <div className='btn btn-ghost' tabIndex={0} role='button'>
              <img className='w-8 h-8' src='/favicon.ico' />
              <span className='hidden lg:inline'>CLM</span>
            </div>
            {periodMenu('menu-horizontal hidden lg:flex px-1 gap-2')}
          </div>
          <div className='navbar-end flex-1 gap-4'>
            <div className='join rounded border-gray-100 dark:border-gray-900 border-1'>
              <div className='border join-item border-gray-300 dark:border-gray-700'>
                <label className='input h-9 border-0'>
                  <Icon.magnifyingGlass />
                  <input type="text" />
                </label>
              </div>
              <div className='dropdown dropdown-hover dropdown-end join-item border border-gray-300 dark:border-gray-700'>
                <button tabIndex={0} role='button' className='btn btn-sm h-full btn-soft rounded-none border-0'>
                  <Icon.filter />
                </button>
                <div className='dropdown-content'>
                  some shit
                </div>
              </div>
              <div key={periodId} className='dropdown dropdown-hover dropdown-end join-item border border-gray-300 dark:border-gray-700'>
                <button tabIndex={0} role='button' className='btn btn-sm h-full btn-soft rounded-none border-0'>
                  <Icon.calendar />
                  <span className='hidden lg:inline'>
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
            <details key={page} style={{display: 'none'}} className='group dropdown dropdown-end'>
              <summary className='btn btn-ghost lg:hidden'>
                <div className='swap swap-rotate group-open:swap-active'>
                  <Icon.bars className='size-6 swap-off' />
                  <Icon.xmark className='size-6 swap-on group-open:rotate-0' />
                </div>
              </summary>
              {periodMenu('menu-sm dropdown-content bg-base-200 gap-1 rounded-box z-1 mt-3 w-52 p-2 shadow')}
            </details>
          </div>
        </div>
        {(page === 'stats') ? statsHeader() : null }
      </div>
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
      {tableRow('h-25')(10, 20, 30, 40, 50, 60)}
    </div>
  );
}
