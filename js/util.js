import _timeline from './timeline.json';

export const PageTypes = ['stats', 'players', 'compare', 'h2h'];

export const timeline = { ..._timeline };
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

export function resolveSeasonStr(str) {
    return PERIOD_ID_BY_SEASON[str] || timeline.current;
}

const PAGES = new Set(PageTypes);

export const defaultPage = 'stats';

export function resolvePageStr(str) {
    return str && PAGES.has(str.toLowerCase()) ? str.toLowerCase() : defaultPage;
}

export function getSeason(periodId) {
    return SEASON_BY_PERIOD_ID[periodId] || SEASON_BY_PERIOD_ID[timeline.current];
}

export function getPeriodId(season) {
    return PERIOD_ID_BY_SEASON[season] || timeline.current;
}

export function Period(periodId) {
    return PERIODS[periodId] || PERIODS[timeline.current];
}

const PLAYER_DATA = {
    "shabo": { "character": "FOX" },
    "Skerzo": { "character": "FOX" },
    "Michael": { "character": "JIGGLYPUFF", "lastRank": 2 },
    "JustJoe": { "character": "FOX" },
    "Ober": { "character": "FALCO", "lastRank": 1 },
    "bestprincess": { "character": "PEACH" },
    "Killablue": { "character": "FALCO" },
    "Ferocitii": { "character": "PEACH" },
    "GI0GOAT": { "character": "FOX", "summerRank": 15, "lastRank": 3 },
    "Larfen": { "character": "SHEIK" },
    "FoxCap": { "character": "FOX" },
    "Azzu": { "character": "FALCO" },
    "Forest": { "character": "MARTH" },
    "Mattchu": { "character": "FALCO" },
    "Unsure": { "character": "SHEIK", "lastRank": 8 },
    "Umma": { "character": "MARTH" },
    "Dragoid": { "character": "FALCO" },
    "Hyunnies": { "character": "MARTH" },
    "macdaddy69": { "character": "CAPTAIN_FALCON" },
    "Scooby": { "character": "SHEIK" },
    "Frost": { "character": "SAMUS" },
    "Peanutphobia": { "character": "YOSHI" },
    "Josh": { "character": "JIGGLYPUFF" },
    "ORLY": { "character": "CAPTAIN_FALCON", "lastRank": 6 },
    "chef": { "character": "FOX" },
    "Certified": { "character": "FOX" },
    "Fluid": { "character": "ICE_CLIMBERS" },
    "Q?": { "character": "DR_MARIO" },
    "IMDRR": { "character": "FALCO" },
    "lovestory4a": { "character": "SHEIK", "lastRank": 5 },
    "Fasthands": { "character": "MEWTWO" },
    "natebug01": { "character": "JIGGLYPUFF" },
    "Blue": { "character": "FOX" },
    "dz": { "character": "YOSHI" },
    "Latin": { "character": "MARTH", "lastRank": 4 },
    "Fry": { "character": "PEACH", "lastRank": 7 },
    "anxious": { "character": "SHEIK", "lastRank": 9 },
    "Jackie": { "character": "GANONDORF", "lastRank": 10 }
}

export function lkupChar(player) {
    return (PLAYER_DATA[player] || {}).character;
}