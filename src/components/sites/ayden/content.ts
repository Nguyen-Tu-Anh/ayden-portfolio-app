export const ASSET = "/sites/ayden";

// Header (afrojack.com layout): socials split either side of the centred logo.
const FACEBOOK = "https://www.facebook.com/ayden.musix/";
const INSTAGRAM = "https://www.instagram.com/ayden.musix/";
const SOUNDCLOUD = "https://soundcloud.com/ayden_musix";
export const email = "aydenmusix@gmail.com";

export const headerLeft = [
  { label: "FACEBOOK", icon: "facebook", href: FACEBOOK },
  { label: "INSTAGRAM", icon: "instagram", href: INSTAGRAM },
] as const;

// Hero profile card, read top to bottom (replaces the demo player for now).
export const profile = [
  { label: "Họ và tên", value: "Nguyễn Tú Anh" },
  { label: "Nghệ danh", value: "Ayden" },
  { label: "Năm sinh", value: "2002" },
  { label: "Định hướng âm nhạc", value: "Open Format" },
];

export const phone = { label: "0889 117 861", tel: "+84889117861" };

export const headerRight = [
  { label: "SOUNDCLOUD", icon: "soundcloud", href: SOUNDCLOUD },
  { label: "CONTACT", icon: "phone", href: `tel:${phone.tel}` },
] as const;

// Hero vinyl player. Placeholder loops come from scripts/generate-demo-audio.mjs —
// replace with your own tracks (any browser-playable format: mp3, m4a, wav).
export const demoTracks = [
  { title: "NIGHT SHIFT", src: `${ASSET}/audio/demo-01.m4a` },
  { title: "BASEMENT HOURS", src: `${ASSET}/audio/demo-02.m4a` },
  { title: "SUNRISE TAPE", src: `${ASSET}/audio/demo-03.m4a` },
  { title: "SIGNAL", src: `${ASSET}/audio/demo-04.m4a` },
  { title: "LAST TRAIN", src: `${ASSET}/audio/demo-05.m4a` },
];

// Placeholder copy: the source's bio prose is not reproduced. Replace with your own story.
export const bio = {
  label: "THE STORY",
  heading: "HARD WORK OVER TALENT",
  paragraphs: [
    "DJ AYDEN theo đuổi phong cách âm nhạc Open Format. Với tinh thần trẻ trung, năng lượng cao và tư duy âm nhạc hiện đại, AYDEN tập trung xây dựng hình ảnh của một DJ chuyên nghiệp dành cho club lớn và các sân khấu sự kiện sôi động.",
    "Không giới hạn trong một màu nhạc cố định, AYDEN mang đến những set nhạc linh hoạt, giàu cảm xúc và giữ nhịp năng lượng mạnh mẽ, giúp không gian biểu diễn luôn bùng nổ và cuốn hút.",
  ],
  quote: "Amplify Your Deepest Energy Now!",
};

// Coordinated studio portraits with charcoal backgrounds and natural skin tones.
// Full 2:3 frames preserve the face, hair and clothing in each photograph.
export const portfolio = {
  heading: "PORTFOLIO",
  left: [
    { src: `${ASSET}/portfolio/portrait-23521.jpg`, alt: "Chân dung cận mặt Ayden mặc áo đen, tay chạm cổ và cằm", href: "#portfolio", shape: "v" },
    { src: `${ASSET}/portfolio/portrait-23536.jpg`, alt: "Ayden trong áo khoác đỏ gạch và áo thun trắng", href: "#portfolio", shape: "v" },
  ],
  right: [
    { src: `${ASSET}/portfolio/portrait-23451.jpg`, alt: "Ayden mặc sơ mi đen, một tay chạm ngực và một tay trong túi", href: "#portfolio", shape: "v" },
    { src: `${ASSET}/portfolio/portrait-23440.jpg`, alt: "Ayden mặc áo khoác đỏ gạch và áo thun trắng, nhìn nghiêng sang phải", href: "#portfolio", shape: "v" },
  ],
} as const;

export const linkCards = [
  { title: "SPOTIFY", sub: "LISTEN", href: "https://open.spotify.com/" },
  { title: "SOUNDCLOUD", sub: "MIXES", href: SOUNDCLOUD },
  { title: "INSTAGRAM", sub: "BEHIND THE DECKS", href: INSTAGRAM },
  { title: "FACEBOOK", sub: "COMMUNITY", href: FACEBOOK },
  { title: "YOUTUBE", sub: "VIDEOS", href: "https://www.youtube.com/" },
  { title: "BOOKING", sub: phone.label, href: `tel:${phone.tel}` },
];

export const footerLinks = [
  { label: "FACEBOOK", href: FACEBOOK },
  { label: "INSTAGRAM", href: INSTAGRAM },
  { label: "SOUNDCLOUD", href: SOUNDCLOUD },
  { label: "EMAIL", href: `mailto:${email}` },
  { label: "CONTACT", href: `tel:${phone.tel}` },
];

export const intents = [
  { key: "new_music", label: "new music" },
  { key: "shows_near_me", label: "shows near me" },
  { key: "dj_producer", label: "I’m a DJ / producer" },
] as const;

export type IntentKey = (typeof intents)[number]["key"];

export function isExternal(href: string) {
  return href.startsWith("http");
}
