import UAParser from 'ua-parser-js';

// A user-agent can't tell a laptop from a desktop, so for non-mobile devices the frontend
// sends screen.width and the smaller screens are labelled "laptop".
const LAPTOP_MAX_SCREEN_WIDTH = 1600;
const MAX_FIELD_LENGTH = 100;

const clean = (value) => String(value || 'Unknown').trim().slice(0, MAX_FIELD_LENGTH);

// Edge reports "Edg" in its user-agent together with "Chrome", so the parser's name is used, not a text search.
const getBrowserFamily = (name = '', isBrave = false, ua = '') => {
  if (isBrave) return 'other'; // Brave's user-agent says Chrome, so the frontend reports it
  if (/^edge|^ie/i.test(name)) return 'microsoft';
  if (/crios\//i.test(ua)) return 'chrome'; // Chrome on iPhone/iPad says "CriOS", not "Chrome"
  if (/chrome/i.test(name)) return 'chrome';
  return 'other';
};

// Tablets count as mobile, so they get the same login time window.
const getDeviceType = (uaDeviceType, screenWidth, clientDeviceType, ua = '') => {
  if (uaDeviceType === 'mobile' || uaDeviceType === 'tablet' || /mobile|android|iphone|ipad|ipod/i.test(ua)) {
    return 'mobile';
  }

  // If the client provided a valid non-mobile device hint ('desktop' or 'laptop'), use it
  if (clientDeviceType === 'desktop' || clientDeviceType === 'laptop') {
    return clientDeviceType;
  }

  const width = Number(screenWidth);
  // Default non-mobile devices with width > 1440 (e.g. 1080p scaled to 1536 CSS px or 1920 physical) to desktop
  return Number.isFinite(width) && width > 0 && width <= 1440
    ? 'laptop'
    : 'desktop';
};

export const getClientIp = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip; // IPv4 written in IPv6 form
};

export const getDeviceInfo = (req, screenWidth, isBrave = false, clientDeviceType = null) => {
  const ua = req.headers['user-agent'] || '';
  const { browser, os, device } = new UAParser(ua).getResult();
  return {
    browser: clean(
      [isBrave ? 'Brave' : /crios\//i.test(ua) ? 'Chrome' : browser.name, browser.major]
        .filter(Boolean)
        .join(' '),
    ),
    browserFamily: getBrowserFamily(browser.name, isBrave, ua),
    os: clean([os.name, os.version].filter(Boolean).join(' ')),
    deviceType: getDeviceType(device.type, screenWidth, clientDeviceType, ua),
    ip: clean(getClientIp(req)),
  };
};
