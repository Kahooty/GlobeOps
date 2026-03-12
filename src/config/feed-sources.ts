import type { FeedSource } from '@/types';
import { REFRESH } from './constants';

export const FEED_SOURCES: FeedSource[] = [
  // ═══════════════════════════════════════════════════════════════
  // WORLD NEWS
  // ═══════════════════════════════════════════════════════════════
  { id: 'bbc-world', name: 'BBC', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world-news', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },
  { id: 'guardian-world', name: 'Guardian', url: 'https://www.theguardian.com/world/rss', category: 'world-news', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },
  { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world-news', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'npr-world', name: 'NPR', url: 'https://feeds.npr.org/1004/rss.xml', category: 'world-news', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'reuters-world', name: 'Reuters', url: 'https://news.google.com/rss/search?q=site:reuters.com+world&hl=en-US&gl=US&ceid=US:en', category: 'world-news', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },
  { id: 'dw-world', name: 'DW News', url: 'https://rss.dw.com/rdf/rss-en-all', category: 'world-news', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'apnews', name: 'AP News', url: 'https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en', category: 'world-news', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },

  // ═══════════════════════════════════════════════════════════════
  // US NEWS
  // ═══════════════════════════════════════════════════════════════
  { id: 'politico', name: 'Politico', url: 'https://rss.politico.com/politics-news.xml', category: 'us-news', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'the-hill', name: 'The Hill', url: 'https://thehill.com/feed/', category: 'us-news', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'cnn', name: 'CNN', url: 'https://rss.cnn.com/rss/edition.rss', category: 'us-news', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },
  { id: 'nytimes', name: 'NY Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'us-news', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },
  { id: 'wapo', name: 'Wash Post', url: 'https://feeds.washingtonpost.com/rss/world', category: 'us-news', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },

  // ═══════════════════════════════════════════════════════════════
  // DEFENSE & MILITARY
  // ═══════════════════════════════════════════════════════════════
  { id: 'defense-one', name: 'Defense One', url: 'https://www.defenseone.com/rss/', category: 'defense', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'breaking-defense', name: 'Breaking Def', url: 'https://breakingdefense.com/feed/', category: 'defense', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'defence-blog', name: 'Defence Blog', url: 'https://defence-blog.com/feed/', category: 'defense', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'high' },
  { id: 'defense-news', name: 'Defense News', url: 'https://www.defensenews.com/arc/outboundfeeds/rss/', category: 'defense', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'war-on-rocks', name: 'War on Rocks', url: 'https://warontherocks.com/feed/', category: 'defense', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'military-times', name: 'Military Times', url: 'https://www.militarytimes.com/arc/outboundfeeds/rss/', category: 'defense', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'iiss', name: 'IISS', url: 'https://www.iiss.org/rss/', category: 'defense', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // GOVERNMENT & POLICY
  // ═══════════════════════════════════════════════════════════════
  { id: 'whitehouse', name: 'White House', url: 'https://www.whitehouse.gov/feed/', category: 'government', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'state-dept', name: 'State Dept', url: 'https://www.state.gov/rss-feed/press-releases/feed/', category: 'government', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'pentagon', name: 'Pentagon', url: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945', category: 'government', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'un-news', name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', category: 'government', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },

  // ═══════════════════════════════════════════════════════════════
  // THINK TANKS & ANALYSIS
  // ═══════════════════════════════════════════════════════════════
  { id: 'cfr', name: 'CFR', url: 'https://www.cfr.org/rss.xml', category: 'think-tanks', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'brookings', name: 'Brookings', url: 'https://www.brookings.edu/feed/', category: 'think-tanks', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'rand', name: 'RAND', url: 'https://www.rand.org/news.xml', category: 'think-tanks', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'csis', name: 'CSIS', url: 'https://www.csis.org/analysis/feed', category: 'think-tanks', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'carnegie', name: 'Carnegie', url: 'https://carnegieendowment.org/rss/solr/?query=*&rows=20', category: 'think-tanks', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'chatham-house', name: 'Chatham House', url: 'https://www.chathamhouse.org/rss.xml', category: 'think-tanks', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'crisis-group', name: 'Crisis Group', url: 'https://www.crisisgroup.org/rss.xml', category: 'think-tanks', refreshInterval: REFRESH.RSS_LOW, priority: 'medium' },
  { id: 'atlantic-council', name: 'Atlantic Council', url: 'https://www.atlanticcouncil.org/feed/', category: 'think-tanks', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // FINANCE & MARKETS
  // ═══════════════════════════════════════════════════════════════
  { id: 'cnbc', name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', category: 'finance', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },
  { id: 'marketwatch', name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', category: 'finance', refreshInterval: REFRESH.RSS_HIGH, priority: 'medium' },
  { id: 'ft', name: 'FT', url: 'https://news.google.com/rss/search?q=site:ft.com+markets&hl=en-US&gl=US&ceid=US:en', category: 'finance', refreshInterval: REFRESH.RSS_HIGH, priority: 'medium' },
  { id: 'bloomberg-markets', name: 'Bloomberg', url: 'https://news.google.com/rss/search?q=site:bloomberg.com+markets&hl=en-US&gl=US&ceid=US:en', category: 'finance', refreshInterval: REFRESH.RSS_HIGH, priority: 'medium' },
  { id: 'wsj-markets', name: 'WSJ Markets', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'finance', refreshInterval: REFRESH.RSS_HIGH, priority: 'medium' },
  { id: 'yahoo-finance', name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'finance', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },

  // ═══════════════════════════════════════════════════════════════
  // TECH
  // ═══════════════════════════════════════════════════════════════
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },
  { id: 'ars', name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },
  { id: 'hn', name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'tech', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },
  { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },
  { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'tech', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // SCIENCE
  // ═══════════════════════════════════════════════════════════════
  { id: 'nasa', name: 'NASA', url: 'https://www.nasa.gov/news-release/feed/', category: 'science', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'nature', name: 'Nature', url: 'https://www.nature.com/nature.rss', category: 'science', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'phys-org', name: 'Phys.org', url: 'https://phys.org/rss-feed/', category: 'science', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // ENERGY
  // ═══════════════════════════════════════════════════════════════
  { id: 'eia-today', name: 'EIA', url: 'https://www.eia.gov/rss/todayinenergy.xml', category: 'energy', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'oilprice', name: 'OilPrice', url: 'https://oilprice.com/rss/main', category: 'energy', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'energy-voice', name: 'Energy Voice', url: 'https://www.energyvoice.com/feed/', category: 'energy', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },
  { id: 'rigzone', name: 'Rigzone', url: 'https://www.rigzone.com/news/rss/rigzone_latest.aspx', category: 'energy', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },
  { id: 'power-mag', name: 'POWER Mag', url: 'https://www.powermag.com/feed/', category: 'energy', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // HUMANITARIAN
  // ═══════════════════════════════════════════════════════════════
  { id: 'reliefweb', name: 'ReliefWeb', url: 'https://reliefweb.int/updates/rss.xml', category: 'humanitarian', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'high' },
  { id: 'unhcr', name: 'UNHCR', url: 'https://www.unhcr.org/us/news/rss.xml', category: 'humanitarian', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'icrc', name: 'ICRC', url: 'https://www.icrc.org/en/rss', category: 'humanitarian', refreshInterval: REFRESH.RSS_LOW, priority: 'medium' },
  { id: 'msf', name: 'MSF', url: 'https://www.msf.org/rss', category: 'humanitarian', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // CYBERSECURITY
  // ═══════════════════════════════════════════════════════════════
  { id: 'krebs', name: 'Krebs', url: 'https://krebsonsecurity.com/feed/', category: 'cybersecurity', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'bleeping-computer', name: 'Bleeping', url: 'https://www.bleepingcomputer.com/feed/', category: 'cybersecurity', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'the-record', name: 'The Record', url: 'https://therecord.media/feed', category: 'cybersecurity', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'high' },
  { id: 'darkreading', name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', category: 'cybersecurity', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'securityweek', name: 'SecurityWeek', url: 'https://www.securityweek.com/feed/', category: 'cybersecurity', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },
  { id: 'hackernews-cyber', name: 'Hacker News Cyber', url: 'https://feeds.feedburner.com/TheHackersNews', category: 'cybersecurity', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },

  // ═══════════════════════════════════════════════════════════════
  // CLIMATE
  // ═══════════════════════════════════════════════════════════════
  { id: 'climate-nasa', name: 'NASA Climate', url: 'https://climate.nasa.gov/news/rss.xml', category: 'climate', refreshInterval: REFRESH.RSS_LOW, priority: 'medium' },
  { id: 'carbon-brief', name: 'Carbon Brief', url: 'https://www.carbonbrief.org/feed', category: 'climate', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'climate-home', name: 'Climate Home', url: 'https://www.climatechangenews.com/feed/', category: 'climate', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // NATURAL DISASTERS & HAZARDS
  // ═══════════════════════════════════════════════════════════════
  { id: 'gdacs', name: 'GDACS', url: 'https://www.gdacs.org/xml/rss.xml', category: 'climate', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'high' },
  { id: 'reliefweb-disasters', name: 'RW Disasters', url: 'https://reliefweb.int/disasters/rss.xml', category: 'humanitarian', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'high' },
  { id: 'volcanodiscovery', name: 'VolcanoDisc', url: 'https://www.volcanodiscovery.com/rss/news.xml', category: 'climate', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'earth-observatory', name: 'NASA EO', url: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss', category: 'climate', refreshInterval: REFRESH.RSS_LOW, priority: 'medium' },

  // ═══════════════════════════════════════════════════════════════
  // COMMODITIES
  // ═══════════════════════════════════════════════════════════════
  { id: 'mining-com', name: 'Mining.com', url: 'https://www.mining.com/feed/', category: 'commodities', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'mining-weekly', name: 'Mining Weekly', url: 'https://www.miningweekly.com/page/rss', category: 'commodities', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'sp-global-cmdty', name: 'S&P Commodities', url: 'https://www.spglobal.com/commodityinsights/en/rss-feed/all.rss', category: 'commodities', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },

  // ═══════════════════════════════════════════════════════════════
  // REGIONAL — ASIA
  // ═══════════════════════════════════════════════════════════════
  { id: 'nikkei', name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss', category: 'regional-asia', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'scmp', name: 'SCMP', url: 'https://www.scmp.com/rss/91/feed', category: 'regional-asia', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'india-times', name: 'Times India', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', category: 'regional-asia', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'japantimes', name: 'Japan Times', url: 'https://www.japantimes.co.jp/feed/', category: 'regional-asia', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },
  { id: 'the-diplomat', name: 'The Diplomat', url: 'https://thediplomat.com/feed/', category: 'regional-asia', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'strait-times', name: 'Straits Times', url: 'https://www.straitstimes.com/news/asia/rss.xml', category: 'regional-asia', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },

  // ═══════════════════════════════════════════════════════════════
  // REGIONAL — EUROPE
  // ═══════════════════════════════════════════════════════════════
  { id: 'kyiv-independent', name: 'Kyiv Indep.', url: 'https://kyivindependent.com/feed/', category: 'regional-europe', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },
  { id: 'france24', name: 'France 24', url: 'https://www.france24.com/en/rss', category: 'regional-europe', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'euronews', name: 'Euronews', url: 'https://www.euronews.com/rss', category: 'regional-europe', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'euractiv', name: 'Euractiv', url: 'https://www.euractiv.com/feed/', category: 'regional-europe', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'politico-eu', name: 'Politico EU', url: 'https://www.politico.eu/feed/', category: 'regional-europe', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },

  // ═══════════════════════════════════════════════════════════════
  // REGIONAL — MIDDLE EAST
  // ═══════════════════════════════════════════════════════════════
  { id: 'middle-east-eye', name: 'ME Eye', url: 'https://www.middleeasteye.net/rss', category: 'regional-mideast', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'high' },
  { id: 'times-of-israel', name: 'Times Israel', url: 'https://www.timesofisrael.com/feed/', category: 'regional-mideast', refreshInterval: REFRESH.RSS_HIGH, priority: 'high' },
  { id: 'al-monitor', name: 'Al-Monitor', url: 'https://www.al-monitor.com/rss', category: 'regional-mideast', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'arab-news', name: 'Arab News', url: 'https://www.arabnews.com/rss.xml', category: 'regional-mideast', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },

  // ═══════════════════════════════════════════════════════════════
  // REGIONAL — AFRICA
  // ═══════════════════════════════════════════════════════════════
  { id: 'africa-news', name: 'Africanews', url: 'https://www.africanews.com/feed/', category: 'regional-africa', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'the-africa-report', name: 'Africa Report', url: 'https://www.theafricareport.com/feed/', category: 'regional-africa', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'iss-africa', name: 'ISS Africa', url: 'https://issafrica.org/iss-today/feed', category: 'regional-africa', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // REGIONAL — LATIN AMERICA
  // ═══════════════════════════════════════════════════════════════
  { id: 'mercopress', name: 'MercoPress', url: 'https://en.mercopress.com/rss/', category: 'regional-latam', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'as-coa', name: 'AS/COA', url: 'https://www.as-coa.org/rss.xml', category: 'regional-latam', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },
  { id: 'dialogo-americas', name: 'Dialogo', url: 'https://dialogo-americas.com/feed/', category: 'regional-latam', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // MARITIME & SHIPPING
  // ═══════════════════════════════════════════════════════════════
  { id: 'gcaptain', name: 'gCaptain', url: 'https://gcaptain.com/feed/', category: 'commodities', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'maritime-exec', name: 'Maritime Exec', url: 'https://maritime-executive.com/feed', category: 'commodities', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
  { id: 'splash247', name: 'Splash247', url: 'https://splash247.com/feed/', category: 'commodities', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // NUCLEAR & ARMS CONTROL
  // ═══════════════════════════════════════════════════════════════
  { id: 'arms-control', name: 'Arms Control', url: 'https://www.armscontrol.org/rss.xml', category: 'defense', refreshInterval: REFRESH.RSS_LOW, priority: 'medium' },
  { id: 'nti', name: 'NTI', url: 'https://www.nti.org/rss/', category: 'defense', refreshInterval: REFRESH.RSS_LOW, priority: 'medium' },

  // ═══════════════════════════════════════════════════════════════
  // SPACE
  // ═══════════════════════════════════════════════════════════════
  { id: 'spacenews', name: 'SpaceNews', url: 'https://spacenews.com/feed/', category: 'science', refreshInterval: REFRESH.RSS_LOW, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // RUSSIAN / EURASIAN
  // ═══════════════════════════════════════════════════════════════
  { id: 'moscow-times', name: 'Moscow Times', url: 'https://www.themoscowtimes.com/rss/news', category: 'regional-europe', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'high' },
  { id: 'meduza', name: 'Meduza', url: 'https://meduza.io/rss/en/all', category: 'regional-europe', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'high' },

  // ═══════════════════════════════════════════════════════════════
  // PACIFIC & OCEANIA
  // ═══════════════════════════════════════════════════════════════
  { id: 'rnz-pacific', name: 'RNZ Pacific', url: 'https://www.rnz.co.nz/rss/pacific.xml', category: 'regional-asia', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'low' },

  // ═══════════════════════════════════════════════════════════════
  // INDIAN DEFENSE
  // ═══════════════════════════════════════════════════════════════
  { id: 'india-defence', name: 'India Defence', url: 'https://www.indiadefencenews.com/feed/', category: 'regional-asia', refreshInterval: REFRESH.RSS_MEDIUM, priority: 'medium' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  'world-news': 'WORLD',
  'us-news': 'US',
  defense: 'DEFENSE',
  government: 'GOV',
  'think-tanks': 'THINK TANK',
  finance: 'FINANCE',
  tech: 'TECH',
  'regional-asia': 'ASIA',
  'regional-europe': 'EUROPE',
  'regional-mideast': 'MIDEAST',
  'regional-africa': 'AFRICA',
  'regional-latam': 'LATAM',
  science: 'SCIENCE',
  energy: 'ENERGY',
  humanitarian: 'HUMAN',
  cybersecurity: 'CYBER',
  climate: 'CLIMATE',
  commodities: 'CMDTY',
};

/** Get feeds by category */
export function getFeedsByCategory(category: string): FeedSource[] {
  return FEED_SOURCES.filter((f) => f.category === category);
}

/** Get high-priority feeds (for critical monitoring) */
export function getHighPriorityFeeds(): FeedSource[] {
  return FEED_SOURCES.filter((f) => f.priority === 'high');
}

// ═══════════════════════════════════════════════════════════════
// SOURCE DIVERSITY BALANCING
// ═══════════════════════════════════════════════════════════════

export interface SourceDiversityConfig {
  enabled: boolean;
  /** Max items per source within the diversity window (soft cap) */
  maxItemsPerSource: number;
  /** Time window in minutes for the soft cap */
  diversityWindowMinutes: number;
  /** Minimum guaranteed items per source that has any content */
  minSourceRepresentation: number;
  /** Priority multiplier — high-priority sources get proportionally more slots */
  priorityBoost: Record<'high' | 'medium' | 'low', number>;
}

export const SOURCE_DIVERSITY_CONFIG: SourceDiversityConfig = {
  enabled: true,
  maxItemsPerSource: 8,
  diversityWindowMinutes: 60,
  minSourceRepresentation: 1,
  priorityBoost: {
    high: 1.5,
    medium: 1.0,
    low: 0.75,
  },
};

/** Lookup FeedSource by name (for diversity balancing) */
const _sourceByName = new Map<string, FeedSource>();
for (const s of FEED_SOURCES) _sourceByName.set(s.name, s);

export function getSourceByName(name: string): FeedSource | undefined {
  return _sourceByName.get(name);
}
