// DeepSI Agent sticker pack — soft-ui-glyphs / clean-flat
// One coherent family: muted matte tiles, near-black rounded monoline glyphs,
// no exterior rim, no gradients, no shadows, no text.

export const INK = "#1C1D18";

export const COLORS = {
  sage: "#C7D1BE",
  clay: "#D3A08C",
  ochre: "#D6C08A",
  blue: "#AFC0C2",
  lavender: "#C3BED0",
  olive: "#BEC7A6",
};

const SHAPES = {
  circle: (fill) => `<circle cx="80" cy="80" r="64" fill="${fill}"/>`,
  arch: (fill) =>
    `<path d="M16 132V80a64 64 0 0 1 128 0v52q0 12-12 12H28q-12 0-12-12Z" fill="${fill}"/>`,
  capsule: (fill) => `<rect x="8" y="40" width="144" height="80" rx="40" fill="${fill}"/>`,
  wide: (fill) => `<rect x="4" y="32" width="152" height="96" rx="32" fill="${fill}"/>`,
  squircle: (fill) => `<rect x="16" y="16" width="128" height="128" rx="40" fill="${fill}"/>`,
  square: (fill) => `<rect x="16" y="16" width="128" height="128" rx="28" fill="${fill}"/>`,
};

const DOT = `<circle cx="80" cy="80" r="4" fill="${INK}" stroke="none"/>`;

export const GLYPHS = {
  key: `<circle cx="64" cy="80" r="24"/><path d="M88 80h38"/><path d="M112 80v14"/><path d="M124 80v10"/>`,
  bolt: `<path d="M86 36 52 86h24l-6 38 38-52H82Z"/>`,
  shield: `<path d="M80 34 122 50v28c0 26-18 40-42 50-24-10-42-24-42-50V50Z"/><path d="m62 80 13 14 26-30"/>`,
  nodes: `<circle cx="48" cy="56" r="12"/><circle cx="112" cy="48" r="12"/><circle cx="82" cy="112" r="12"/><path d="m58 62 42-10"/><path d="m56 66 18 34"/><path d="m106 58-18 44"/>`,
  coin: `<circle cx="80" cy="80" r="42"/><path d="M80 56v48"/><path d="M64 68h32"/><path d="M64 92h32"/>`,
  terminal: `<rect x="34" y="46" width="92" height="68" rx="14"/><path d="m50 66 12 12-12 12"/><path d="M74 92h26"/>`,
  globe: `<circle cx="80" cy="80" r="42"/><path d="M38 80h84"/><path d="M80 38c-22 20-22 64 0 84"/><path d="M80 38c22 20 22 64 0 84"/>`,
  chart: `<path d="M46 116V88"/><path d="M80 116V60"/><path d="M114 116V76"/><path d="M34 128h92"/>`,
  chat: `<path d="M36 54h88a14 14 0 0 1 14 14v28a14 14 0 0 1-14 14H84l-22 18v-18H36a14 14 0 0 1-14-14V68a14 14 0 0 1 14-14Z"/><circle cx="56" cy="82" r="4" fill="${INK}" stroke="none"/><circle cx="80" cy="82" r="4" fill="${INK}" stroke="none"/><circle cx="104" cy="82" r="4" fill="${INK}" stroke="none"/>`,
  cube: `<path d="M80 34 122 56v48l-42 22-42-22V56Z"/><path d="M38 56 80 78l42-22"/><path d="M80 78v48"/>`,
  plug: `<path d="M56 44v26"/><path d="M104 44v26"/><path d="M44 70h72v14a36 36 0 0 1-72 0Z"/><path d="M80 120v16"/>`,
  lock: `<rect x="40" y="72" width="80" height="64" rx="12"/><path d="M56 72V58a24 24 0 0 1 48 0v14"/><circle cx="80" cy="102" r="5" fill="${INK}" stroke="none"/><path d="M80 107v9"/>`,
  spark: `<path d="M80 30 88 72l40 8-40 8-8 42-8-42-40-8 40-8Z"/>`,
  arrow: `<path d="M40 112c18-16 22-38 38-54 12-12 24-14 38-10"/><path d="m98 36 20 12-14 18"/>`,
  plane: `<path d="M34 78 126 40 100 122 78 92Z"/><path d="M78 92 126 40"/><path d="m78 92-16 20"/>`,
  cloud: `<path d="M46 108c-16 0-24-12-24-24 0-14 12-24 26-24 6-18 22-26 38-22 16 4 26 18 26 32 14 2 24 12 24 24 0 12-10 20-24 20H46Z"/><path d="M80 84v32"/><path d="m68 104 12 12 12-12"/>`,
  check: `<circle cx="80" cy="80" r="42"/><path d="m58 82 16 16 30-34"/>`,
  copy: `<rect x="56" y="48" width="64" height="76" rx="10"/><path d="M44 64v46a10 10 0 0 0 10 10h42"/>`,
  plus: `<circle cx="80" cy="80" r="42"/><path d="M80 58v44"/><path d="M58 80h44"/>`,
  trash: `<path d="M48 60h64"/><path d="M62 60V48h36v12"/><path d="m54 60 6 60h40l6-60"/><path d="M72 76v26"/><path d="M88 76v26"/>`,
  eye: `<path d="M30 80c14-22 30-32 50-32s36 10 50 32c-14 22-30 32-50 32S44 102 30 80Z"/><circle cx="80" cy="80" r="16"/><circle cx="80" cy="80" r="4" fill="${INK}" stroke="none"/>`,
  logout: `<path d="M66 40H42a10 10 0 0 0-10 10v60a10 10 0 0 0 10 10h24"/><path d="M84 80h42"/><path d="m108 62 18 18-18 18"/>`,
  search: `<circle cx="70" cy="70" r="30"/><path d="m92 92 30 30"/>`,
  book: `<path d="M32 48c16-6 32-4 48 6 16-10 32-12 48-6v64c-16-6-32-4-48 6-16-10-32-12-48-6Z"/><path d="M80 54v64"/>`,
  code: `<path d="m62 56-24 24 24 24"/><path d="m98 56 24 24-24 24"/><path d="m88 44-16 72"/>`,
  external: `<path d="M96 64V44H44v72h52V96"/><path d="m74 86 50-50"/><path d="M100 36h24v24"/>`,
  user: `<circle cx="80" cy="64" r="22"/><path d="M38 124c4-24 20-36 42-36s38 12 42 36"/>`,
  star: `<path d="m80 32 14 30 34 4-25 24 6 34-29-16-29 16 6-34-25-24 34-4Z"/>`,
};

export const STICKERS = [
  { name: "key", shape: "circle", color: "sage", glyph: "key", alt: "Chìa khóa API" },
  { name: "bolt", shape: "arch", color: "ochre", glyph: "bolt", alt: "Tín hiệu nhanh" },
  { name: "shield", shape: "squircle", color: "blue", glyph: "shield", alt: "Bảo mật" },
  { name: "nodes", shape: "wide", color: "sage", glyph: "nodes", alt: "Kết nối mô hình" },
  { name: "coin", shape: "circle", color: "ochre", glyph: "coin", alt: "Chi phí theo token" },
  { name: "terminal", shape: "wide", color: "lavender", glyph: "terminal", alt: "Terminal" },

  { name: "globe", shape: "circle", color: "blue", glyph: "globe", alt: "Hạ tầng tại Việt Nam" },
  { name: "chart", shape: "arch", color: "clay", glyph: "chart", alt: "Sử dụng" },
  { name: "chat", shape: "capsule", color: "sage", glyph: "chat", alt: "Hội thoại" },
  { name: "cube", shape: "square", color: "lavender", glyph: "cube", alt: "Mô hình" },
  { name: "plug", shape: "capsule", color: "ochre", glyph: "plug", alt: "Tương thích" },
  { name: "lock", shape: "arch", color: "clay", glyph: "lock", alt: "Bảo mật" },

  { name: "spark", shape: "circle", color: "ochre", glyph: "spark", alt: "Sáng tạo" },
  { name: "arrow", shape: "wide", color: "sage", glyph: "arrow", alt: "Đi tiếp" },
  { name: "plane", shape: "squircle", color: "blue", glyph: "plane", alt: "Gửi yêu cầu" },
  { name: "cloud", shape: "capsule", color: "lavender", glyph: "cloud", alt: "Đám mây" },
  { name: "check", shape: "circle", color: "sage", glyph: "check", alt: "Hoàn tất" },
  { name: "copy", shape: "square", color: "clay", glyph: "copy", alt: "Sao chép" },

  { name: "plus", shape: "circle", color: "ochre", glyph: "plus", alt: "Thêm" },
  { name: "trash", shape: "arch", color: "clay", glyph: "trash", alt: "Xóa" },
  { name: "eye", shape: "capsule", color: "blue", glyph: "eye", alt: "Hiện mật khẩu" },
  { name: "logout", shape: "square", color: "sage", glyph: "logout", alt: "Đăng xuất" },
  { name: "search", shape: "circle", color: "lavender", glyph: "search", alt: "Tìm kiếm" },
  { name: "book", shape: "arch", color: "ochre", glyph: "book", alt: "Tài liệu" },

  { name: "code", shape: "wide", color: "blue", glyph: "code", alt: "Mã nguồn" },
  { name: "external", shape: "squircle", color: "sage", glyph: "external", alt: "Mở liên kết" },
  { name: "user", shape: "circle", color: "clay", glyph: "user", alt: "Tài khoản" },
  { name: "star", shape: "arch", color: "ochre", glyph: "star", alt: "Đánh dấu" },
];

export function stickerSvg(sticker) {
  const fill = COLORS[sticker.color];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  ${SHAPES[sticker.shape](fill)}
  <g fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
    ${GLYPHS[sticker.glyph]}
  </g>
</svg>`;
}

export function sheetSvg(stickers) {
  const cols = stickers.length === 4 ? 2 : 3;
  const rows = Math.ceil(stickers.length / cols);
  const width = cols === 2 ? 1000 : 1400;
  const height = rows === 1 ? 560 : 1000;
  const cell = 400;
  const baseX = cols === 2 ? 100 : 80;
  const baseY = 80;
  const rowOffset = 20;
  const parts = [];
  stickers.forEach((sticker, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = baseX + col * 420 + (row % 2 === 1 ? rowOffset : 0);
    const y = baseY + row * 500;
    parts.push(
      `<g transform="translate(${x} ${y}) scale(2.5)">${stickerSvg(sticker)}</g>`,
    );
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#FF00FF"/>
  ${parts.join("\n")}
</svg>`;
}
