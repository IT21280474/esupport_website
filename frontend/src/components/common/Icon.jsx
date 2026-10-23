/**
 * Line icons ported from the prototype's SVG sprite (24×24, 1.8 stroke),
 * plus a few admin-panel icons. Brand marks (social, WhatsApp) are filled.
 * Names must stay in sync with backend/app/Cms/Icons.php.
 */
const STROKE = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-ur': '<path d="M7 17L17 7M8 7h9v9"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  stock: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  truck: '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="6" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  headset: '<path d="M4 14v-2a8 8 0 0116 0v2"/><path d="M4 14h3v5H5a1 1 0 01-1-1zM20 14h-3v5h2a1 1 0 001-1zM17 19c0 1.5-2 2-4 2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  phone: '<path d="M5 3h3l2 5-2.5 1.5a11 11 0 006 6L15 13l5 2v3a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>',
  mail: '<path d="M3 5h18v14H3z"/><path d="M3 6l9 7 9-7"/>',
  pin: '<path d="M12 21s7-6.2 7-12a7 7 0 00-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  engine: '<path d="M4 9h3l2-2h5l2 2h2v3h2v-2h1v6h-1v-2h-2v3h-3l-2 2H8l-2-2H4z"/><path d="M2 11v4M9 4h5M11.5 4v3"/>',
  brake: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v2M21 12h-2M12 21v-2M3 12h2"/><path d="M16 5.5a8 8 0 012.5 3"/>',
  clutch: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
  spring: '<path d="M8 3h8M8 21h8M8 5l8 2.5-8 2.5 8 2.5-8 2.5 8 2.5-8 2"/>',
  steering: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M3.5 10h6M14.5 10h6M12 14.5V21"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  cooling: '<path d="M12 2v20M4 6l16 12M20 6L4 18"/><path d="M9 3l3 2 3-2M9 21l3-2 3 2"/>',
  gears: '<circle cx="8" cy="8" r="4"/><circle cx="16.5" cy="16.5" r="4.5"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2M16.5 10v2M16.5 21v2M10 16.5h2M21 16.5h2"/>',
  filter: '<path d="M4 4h16l-6 8v6l-4 2v-8z"/>',
  belt: '<circle cx="6" cy="12" r="3.5"/><circle cx="18" cy="12" r="3.5"/><path d="M6 8.5h12M6 15.5h12"/>',
  bearing: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="5.5" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/><circle cx="12" cy="18.5" r="1.3"/><circle cx="5.5" cy="12" r="1.3"/>',
  light: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z"/>',
  body: '<path d="M3 16v-4l3-5h9l4 5h2v4z"/><path d="M6 12h13"/><circle cx="7" cy="16.5" r="1.8"/><circle cx="17" cy="16.5" r="1.8"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14a5 5 0 015 5"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8"/>',
  book: '<path d="M4 4h6a2 2 0 012 2v14a2 2 0 00-2-2H4zM20 4h-6a2 2 0 00-2 2v14a2 2 0 012-2h6z"/>',
  heart: '<path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0112 6a4.5 4.5 0 018 3.5C20 15.3 12 20 12 20z"/>',
  hand: '<path d="M3 13h3l3 2h4a1.5 1.5 0 010 3H9M14 16.5l5-2.5a1.5 1.5 0 011.5 2.5L14 21H6l-3-2"/><path d="M12 3.5a2 2 0 013 2.7L12 9 9 6.2a2 2 0 013-2.7z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  bed: '<path d="M3 18V7M3 13h18v5M21 13a3 3 0 00-3-3h-7v3"/><circle cx="7" cy="11" r="2"/>',
  wifi: '<path d="M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0"/><circle cx="12" cy="19" r=".8"/>',
  dining: '<path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 21V3c-2.5 1-4 4-4 8h4"/>',
  parking: '<path d="M4 3h16v18H4z"/><path d="M9 17V7h4a3 3 0 010 6H9"/>',
  coffee: '<path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 10h1.5a2.5 2.5 0 010 5H17M8 3v3M12 3v3"/>',
  concierge: '<path d="M3 18h18M5 18a7 7 0 0114 0M12 8v3M10 8h4"/>',
  briefcase: '<path d="M3 7h18v13H3zM8 7V4h8v3M3 12h18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  up: '<path d="M5 15l7-7 7 7"/>',
  down: '<path d="M5 9l7 7 7-7"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 000-6H8a3 3 0 010-6h8"/>',
  calendar: '<path d="M4 5h16v16H4zM4 10h16M8 3v4M16 3v4"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-2.5 5 2.5-1.5-7"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  'steer-wheel': '<circle cx="12" cy="12" r="9"/><path d="M12 3v6M5 15l5-2M19 15l-5-2"/>',
  fleet: '<path d="M2 15V7h10v8M12 10h4l3 3v2h-7"/><circle cx="5" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/><path d="M2 20h22"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  // admin
  grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  page: '<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6M9 13h8M9 17h6"/>',
  image: '<path d="M3 5h18v14H3z"/><circle cx="8.5" cy="10" r="1.8"/><path d="M21 16l-5-5-9 8"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
  logout: '<path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0112 5c6.4 0 10 7 10 7a17.6 17.6 0 01-3.1 4M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2"/>',
  copy: '<path d="M8 8h12v12H8z"/><path d="M16 8V4H4v12h4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  file: '<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6"/>',
  lock: '<path d="M5 11h14v10H5z"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  drag: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
}

const FILLED = {
  whatsapp: '<path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.8 11.9 11.9 0 004.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z"/>',
  facebook: '<path d="M14 8h3V4h-3a4 4 0 00-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/>',
  instagram: '<path d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm0 2a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2zm5 3.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM17 6a1 1 0 110 2 1 1 0 010-2z"/>',
  linkedin: '<path d="M4 9h4v12H4zM6 3a2 2 0 110 4 2 2 0 010-4zM10 9h4v1.7c.6-1 1.9-2 3.8-2 3.4 0 4.2 2.2 4.2 5.1V21h-4v-6.3c0-1.5 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V21H10z"/>',
  youtube: '<path d="M22 8.2a3 3 0 00-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 002 8.2 31 31 0 001.6 12 31 31 0 002 15.8a3 3 0 002.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 002.1-2.1 31 31 0 00.4-3.8 31 31 0 00-.4-3.8zM10 15V9l5.2 3z"/>',
  tiktok: '<path d="M16.6 5.8A4.3 4.3 0 0115.5 3h-3.1v12.4a2.6 2.6 0 11-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 00-.8-.1A5.8 5.8 0 1015.5 15V8.7a7.4 7.4 0 004.3 1.4V7a4.3 4.3 0 01-3.2-1.2z"/>',
}

export const ICON_NAMES = Object.keys(STROKE)

export default function Icon({ name, className = 'size-5', strokeWidth = 1.8, title }) {
  const filled = FILLED[name]
  const markup = filled || STROKE[name]
  if (!markup) return null

  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      aria-label={title}
      // Static, trusted markup defined above — never user content
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
