import type { LinkKind, Project } from '../types';

/** Featured projects render in this order; `placement: 'more'` goes to the compact list. */
export const projects: Project[] = [
  {
    id: 'trackmesh',
    title: 'TrackMesh',
    placement: 'featured',
    device: 'desktop',
    accent: '#7FDCB4',
    status: 'preview',
    summary: {
      en: 'A Windows app that sends Ableton Live and FL Studio project folders PC to PC: signed versions, only the changed parts travel, and every device joins with an explicit approval.',
      tr: 'Ableton Live ve FL Studio proje klasörlerini bilgisayardan bilgisayara gönderen Windows uygulaması: imzalı sürümler, yalnızca değişen parçalar gider ve her cihaz açık onayla katılır.',
    },
    myPart: {
      en: 'Solo project: product definition, architecture, the Tauri desktop app with its React interface, the transfer and pairing services, the VST3 status plugin, the installer and the product film.',
      tr: 'Tek kişilik proje: ürün tanımı, mimari, React arayüzlü Tauri masaüstü uygulaması, aktarım ve eşleştirme servisleri, VST3 durum eklentisi, kurulum dosyası ve ürün filmi.',
    },
    notes: {
      challenge: {
        en: 'Moving multi-gigabyte projects between home studios without a cloud copy, and without one side silently overwriting the other.',
        tr: 'Çok gigabaytlık projeleri ev stüdyoları arasında bulut kopyası olmadan taşımak; bir tarafın diğerinin üzerine sessizce yazmasına izin vermeden.',
      },
      approach: {
        en: 'A share saves the folder as a signed version. Files are split into 4 MiB chunks checked with BLAKE3, so a small edit sends only what changed and a stopped download resumes. Before anything is replaced, the collaborator sees which files change, and the old files are kept as a backup. There is no automatic merge: if both sides changed, the app asks which version to keep. CI type-checks the frontend and runs rustfmt and clippy on Windows.',
        tr: 'Paylaşım, klasörü imzalı bir sürüm olarak kaydeder. Dosyalar BLAKE3 ile doğrulanan 4 MiB’lık parçalara bölünür; küçük bir değişiklikte yalnızca değişen kısım gider ve yarıda kalan indirme kaldığı yerden sürer. Bir şey değiştirilmeden önce iş arkadaşı hangi dosyaların değişeceğini görür ve eski dosyalar yedek olarak saklanır. Otomatik birleştirme yoktur: iki taraf da değiştirdiyse uygulama hangi sürümün kalacağını sorar. CI, frontend’in tip kontrolünü yapar; Windows’ta rustfmt ve clippy çalıştırır.',
      },
      status: {
        en: 'Early preview 0.1.0: sharing has been checked live on one network; separate networks have had little live testing.',
        tr: 'Erken önizleme 0.1.0: paylaşım tek bir ağda canlı olarak denendi; farklı ağlarda henüz az test edildi.',
      },
    },
    tags: ['Rust', 'Tauri 2', 'React', 'TypeScript', 'VST3', 'BLAKE3'],
    video: '/media/trackmesh.mp4',
    poster: {
      base: '/media/trackmesh',
      alt: {
        en: 'TrackMesh panel over a DAW: project Neon Forest, connected to Studio B, with a Share current version button.',
        tr: 'DAW üzerinde TrackMesh paneli: Neon Forest projesi, Studio B’ye bağlı, Mevcut sürümü paylaş düğmesiyle.',
      },
    },
    links: [
      { kind: 'release', href: 'https://github.com/ege-ozel/trackmesh/releases/latest' },
      { kind: 'code', href: 'https://github.com/ege-ozel/trackmesh' },
    ],
  },
  {
    id: 'grocery',
    title: 'Grocery',
    placement: 'featured',
    device: 'mobile',
    accent: '#9BCB6B',
    status: 'live',
    summary: {
      en: 'A shopping list and meal-planning app for households, synced across devices, with nutrition guidance.',
      tr: 'Haneler için cihazlar arasında eşitlenen alışveriş listesi ve yemek planlama uygulaması; beslenme rehberliğiyle.',
    },
    myPart: {
      en: 'Built with Ozan Özel. My part: the meal-planning and nutrition features, per-user data access behind Supabase row-level security, the account deletion flow and most of the interface.',
      tr: 'Ozan Özel ile birlikte geliştirildi. Benim payım: yemek planlama ve besin özellikleri, Supabase satır düzeyi güvenliğiyle kullanıcıya özel veri erişimi, hesap silme akışı ve arayüzün büyük bölümü.',
    },
    notes: {
      challenge: {
        en: 'Keeping one household’s lists in sync across devices and members, with clear ownership.',
        tr: 'Bir hanenin listelerini cihazlar ve üyeler arasında, sahipliği net tutarak eşitlemek.',
      },
      approach: {
        en: 'Preact with shadcn/ui running through preact/compat, Supabase for data and auth, one Vercel function per API route. Google sign-in, sessions, account deletion, household sharing by email and owner/member permissions.',
        tr: 'shadcn/ui’ın preact/compat üzerinden çalıştığı Preact, veri ve kimlik doğrulama için Supabase, her API rotası için bir Vercel fonksiyonu. Google ile giriş, oturumlar, hesap silme, e-postayla hane paylaşımı ve sahip/üye yetkileri.',
      },
    },
    tags: ['Preact', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Vercel Functions'],
    video: '/media/grocery.mp4',
    poster: {
      base: '/media/grocery',
      alt: {
        en: 'Grocery meal plan on a phone: daily macro rings for calories, protein, carbs, fat and fibre above the day’s meals.',
        tr: 'Telefonda Grocery yemek planı: günün öğünlerinin üstünde kalori, protein, karbonhidrat, yağ ve lif için günlük makro halkaları.',
      },
    },
    links: [{ kind: 'demo', href: 'https://grocery-five-ecru.vercel.app' }],
  },
  {
    id: 'metronome',
    title: 'Chronobeat',
    placement: 'featured',
    device: 'desktop',
    accent: '#69D8CC',
    status: 'live',
    summary: {
      en: 'A practice metronome with subdivisions and polyrhythms that runs as a web app, an offline PWA and a Windows desktop app.',
      tr: 'Alt bölümler ve poliritimlerle çalışan bir pratik metronomu; web uygulaması, çevrimdışı PWA ve Windows masaüstü uygulaması olarak çalışır.',
    },
    myPart: {
      en: 'Solo project: audio scheduling, canvas visualisers, sound management and the UI.',
      tr: 'Tek kişilik proje: ses zamanlaması, canvas görselleştiricileri, ses yönetimi ve arayüz.',
    },
    notes: {
      challenge: {
        en: 'Browser timers drift. A metronome cannot.',
        tr: 'Tarayıcı zamanlayıcıları kayar; metronom kayamaz.',
      },
      approach: {
        en: 'Clicks are scheduled ahead on the AudioContext clock from a worker tick, and beat times are accumulated instead of re-measured. After a stall it skips missed beats rather than playing a burst. Visuals are a pure function of the heard time, drawn on canvas from cached sprites. One TypeScript codebase without a UI framework ships to web, PWA and Tauri.',
        tr: 'Vuruşlar bir worker tick’inden AudioContext saatine önceden planlanır; vuruş zamanları yeniden ölçülmez, toplanarak ilerler. Takılmadan sonra kaçan vuruşlar topluca çalınmaz, atlanır. Görseller duyulan zamanın saf fonksiyonudur ve önbelleğe alınmış sprite’larla canvas’a çizilir. UI framework’ü olmayan tek bir TypeScript kod tabanı web, PWA ve Tauri’ye çıkar.',
      },
      status: {
        en: 'Live on the web; the Android release is in progress.',
        tr: 'Web’de yayında; Android sürümü hazırlanıyor.',
      },
    },
    tags: ['TypeScript', 'Web Audio API', 'Canvas', 'Vite', 'PWA', 'Tauri 2'],
    video: '/media/metronome.mp4',
    poster: {
      base: '/media/metronome',
      alt: {
        en: 'Chronobeat in 4/4 at 120 BPM: a circular beat visualiser above the tempo dial.',
        tr: '4/4 ve 120 BPM’de Chronobeat: tempo kadranının üstünde dairesel vuruş görselleştiricisi.',
      },
    },
    links: [
      { kind: 'demo', href: 'https://ege-ozel.github.io/metronome/' },
      { kind: 'code', href: 'https://github.com/ege-ozel/metronome' },
    ],
  },
  {
    id: 'desktuk',
    title: 'DeskTuk',
    placement: 'featured',
    device: 'desktop',
    accent: '#E8B86B',
    status: 'inDevelopment',
    summary: {
      en: 'Groups Windows desktop files into movable circles that open on hover. Files stay where they are; circles only hold references to them.',
      tr: 'Windows masaüstündeki dosyaları üzerine gelince açılan, taşınabilir çemberlerde toplar. Dosyalar yerinde kalır; çemberler yalnızca onlara referans tutar.',
    },
    myPart: {
      en: 'Solo project: product idea, desktop window hosting, Explorer-matching icons and file opening, DPI handling and the installer.',
      tr: 'Tek kişilik proje: ürün fikri, masaüstü pencere yerleşimi, Explorer ile aynı simgeler ve dosya açma, DPI yönetimi ve kurulum dosyası.',
    },
    notes: {
      challenge: {
        en: 'Living on the Windows desktop next to Explorer’s own icons without fighting it: z-order, Show desktop and per-monitor DPI.',
        tr: 'Windows masaüstünde Explorer’ın kendi simgelerinin yanında, onunla çatışmadan yaşamak: pencere sırası, Masaüstünü göster ve monitör başına DPI.',
      },
      approach: {
        en: 'Written in Rust against the raw Win32 API, with no GUI framework or WebView. Items open through ShellExecuteEx exactly as Explorer would and are only referenced by path, never moved, renamed or changed. The way the window attaches to the desktop is swappable, so different hosting strategies can be compared.',
        tr: 'GUI framework’ü ya da WebView olmadan, doğrudan Win32 API ile Rust’ta yazıldı. Öğeler Explorer’ın yaptığı gibi ShellExecuteEx ile açılır ve yalnızca yollarıyla referans alınır; asla taşınmaz, yeniden adlandırılmaz ya da değiştirilmez. Pencerenin masaüstüne bağlanma biçimi değiştirilebilir; böylece farklı yerleşim stratejileri karşılaştırılabilir.',
      },
      status: {
        en: 'Builds, unit tests and fixture checks pass; the manual checks of the circles view are not finished yet.',
        tr: 'Derleme, birim testleri ve fixture kontrolleri geçiyor; çember görünümünün elle yapılan kontrolleri henüz bitmedi.',
      },
    },
    tags: ['Rust', 'Win32 API', 'Windows Shell'],
    video: '/media/desktuk.mp4',
    poster: {
      base: '/media/desktuk',
      alt: {
        en: 'DeskTuk on the desktop: the Music circle open with eight files around a search field, Recent and Apps circles on the left, the DeskTuk panel on the right.',
        tr: 'Masaüstünde DeskTuk: arama alanının çevresinde sekiz dosyayla açık Music dairesi, solda Recent ve Apps daireleri, sağda DeskTuk paneli.',
      },
    },
    links: [{ kind: 'code', href: 'https://github.com/ege-ozel/desktuk' }],
  },
  {
    id: 'interval-timer',
    title: 'Interval Timer',
    placement: 'featured',
    device: 'desktop',
    accent: '#F08A5D',
    status: 'live',
    summary: {
      en: 'A work/break timer for Windows and the web, with presets, an always-on-top mini window and alarms from local files, YouTube or Spotify.',
      tr: 'Hazır ayarlar, her zaman üstte duran mini pencere ve yerel dosya, YouTube ya da Spotify alarmlarıyla Windows ve web için çalışma/mola zamanlayıcısı.',
    },
    myPart: {
      en: 'Solo project: timer logic, alarm sources, the Electron app, the PWA and the release pipeline.',
      tr: 'Tek kişilik proje: zamanlayıcı mantığı, alarm kaynakları, Electron uygulaması, PWA ve sürüm hattı.',
    },
    notes: {
      challenge: {
        en: 'Three very different alarm sources have to behave the same way: pause, resume and a duration cap.',
        tr: 'Birbirinden çok farklı üç alarm kaynağı aynı şekilde davranmalı: duraklatma, devam etme ve süre sınırı.',
      },
      approach: {
        en: 'One shared core runs as an Electron desktop app and as an installable PWA. Alarms play a local file, a YouTube video or a Spotify track and fall back to the local sound when a source fails. The mini window stays above fullscreen apps, and the timer keeps ticking from the tray with background throttling disabled and a power-save blocker.',
        tr: 'Ortak bir çekirdek hem Electron masaüstü uygulaması hem de kurulabilir PWA olarak çalışır. Alarmlar yerel dosya, YouTube videosu ya da Spotify parçası çalar; bir kaynak başarısız olursa yerel sese döner. Mini pencere tam ekran uygulamaların üstünde kalır; arka plan kısıtlaması kapatılıp güç tasarrufu engellenerek zamanlayıcı sistem tepsisinden çalışmaya devam eder.',
      },
    },
    tags: ['JavaScript', 'Electron', 'PWA', 'YouTube IFrame API', 'Spotify Web API'],
    poster: null,
    links: [
      { kind: 'site', href: 'https://ege-ozel.github.io/interval-timer/' },
      { kind: 'release', href: 'https://github.com/ege-ozel/interval-timer/releases/latest' },
      { kind: 'code', href: 'https://github.com/ege-ozel/interval-timer' },
    ],
  },
  {
    id: 'pdf-reader',
    title: 'PDF Reader',
    placement: 'more',
    device: 'desktop',
    accent: '#8AB4F8',
    status: 'inDevelopment',
    summary: {
      en: 'A lightweight PDF and Word reader for Windows and Android that only renders the pages in view and caps canvas memory.',
      tr: 'Windows ve Android için yalnızca görünen sayfaları çizen ve canvas belleğini sınırlayan hafif bir PDF ve Word okuyucu.',
    },
    myPart: { en: 'Solo project.', tr: 'Tek kişilik proje.' },
    tags: ['Tauri 2', 'JavaScript', 'PDF.js', 'Rust', 'Vitest'],
    poster: null,
    links: [{ kind: 'code', href: 'https://github.com/ege-ozel/pdf-reader' }],
  },
  {
    id: 'wsm',
    title: 'Workspace Agent Session Manager',
    placement: 'more',
    device: 'desktop',
    accent: '#A992FF',
    status: 'live',
    summary: {
      en: 'A VS Code extension that lists Claude Code and Codex sessions for every folder of a workspace, with context and usage limits in the status bar.',
      tr: 'Claude Code ve Codex oturumlarını çalışma alanındaki her klasör için listeleyen, bağlam ve kullanım sınırlarını durum çubuğunda gösteren VS Code eklentisi.',
    },
    myPart: {
      en: 'Solo project, published on the VS Code Marketplace.',
      tr: 'Tek kişilik proje; VS Code Marketplace’te yayında.',
    },
    tags: ['TypeScript', 'VS Code Extension API', 'Node.js'],
    video: '/media/wsm.mp4',
    poster: {
      base: '/media/wsm',
      alt: {
        en: 'VS Code side bar with the extension’s usage bars for Claude and Codex and its sessions grouped by repo.',
        tr: 'Eklentinin Claude ve Codex kullanım çubuklarını ve depoya göre gruplanmış oturumlarını gösteren VS Code kenar çubuğu.',
      },
    },
    links: [
      {
        kind: 'marketplace',
        href: 'https://marketplace.visualstudio.com/items?itemName=egeozel.workspace-agent-session-manager',
      },
      { kind: 'code', href: 'https://github.com/ege-ozel/workspace-agent-session-manager' },
    ],
  },
  {
    id: 'woodcraft',
    title: 'Woodcraft 3D Workshop',
    placement: 'more',
    device: 'desktop',
    accent: '#D9A066',
    status: 'prototype',
    summary: {
      en: 'A browser-based woodworking modeler: build furniture from typed wood parts that snap together at connection points.',
      tr: 'Tarayıcıda çalışan ahşap modelleme aracı: türleri belli ahşap parçalar bağlantı noktalarından birbirine oturarak mobilyaya dönüşür.',
    },
    myPart: {
      en: 'Solo project: engine choice, data model, snapping logic, the React Three Fiber scene and the UI.',
      tr: 'Tek kişilik proje: motor seçimi, veri modeli, yakalama mantığı, React Three Fiber sahnesi ve arayüz.',
    },
    tags: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Zustand', 'Vitest'],
    poster: {
      base: '/media/woodcraft',
      alt: {
        en: 'Woodcraft scene with wooden boards and a dowel on a grid, green connection points marked on one board.',
        tr: 'Izgara üzerinde ahşap tahtalar ve bir çubuk; bir tahtada yeşil bağlantı noktaları işaretli Woodcraft sahnesi.',
      },
    },
    links: [
      { kind: 'demo', href: 'https://ege-ozel.github.io/woodcraft-prototype/' },
      { kind: 'code', href: 'https://github.com/ege-ozel/woodcraft-prototype' },
    ],
  },
  {
    id: 'voice-type',
    title: 'VoiceType',
    placement: 'more',
    device: 'desktop',
    accent: '#2EF2D0',
    status: 'live',
    summary: {
      en: 'Press a hotkey, speak, and the text is pasted into the focused window. A single ~460 KB Rust app using OpenAI speech-to-text, good with mixed Turkish and English.',
      tr: 'Kısayola bas, konuş; metin odaktaki pencereye yapıştırılır. OpenAI konuşmadan metne servisini kullanan, karışık Türkçe ve İngilizceyi iyi işleyen ~460 KB’lık tek bir Rust uygulaması.',
    },
    myPart: { en: 'Solo project.', tr: 'Tek kişilik proje.' },
    tags: ['Rust', 'Windows', 'OpenAI API'],
    poster: null,
    links: [{ kind: 'code', href: 'https://github.com/ege-ozel/voice-type' }],
  },
  {
    id: 'mert-ozkan',
    title: 'Mert Özkan site concept',
    placement: 'more',
    device: 'desktop',
    accent: '#C9A227',
    summary: {
      en: 'A personal site design for an economics writer: desk, lab and card layouts sharing one settings sheet and theme picker.',
      tr: 'Bir ekonomi yazarı için kişisel site tasarımı: tek bir ayar paneli ve tema seçiciyi paylaşan masa, laboratuvar ve kart düzenleri.',
    },
    myPart: { en: 'Solo project: design and build.', tr: 'Tek kişilik proje: tasarım ve geliştirme.' },
    tags: ['HTML', 'CSS', 'JavaScript'],
    poster: null,
    links: [
      { kind: 'demo', href: 'https://ege-ozel.github.io/mert-ozkan/' },
      { kind: 'code', href: 'https://github.com/ege-ozel/mert-ozkan' },
    ],
  },
  {
    id: 'trackmesh-film',
    title: 'TrackMesh product film',
    placement: 'more',
    device: 'desktop',
    accent: '#7FDCB4',
    summary: {
      en: 'A 30-second product film made in Blender: two studios, the real app screens inside the scene, split-screen link shots, in horizontal and vertical cuts.',
      tr: 'Blender’da hazırlanan 30 saniyelik ürün filmi: iki stüdyo, sahnenin içinde uygulamanın gerçek ekranları, bölünmüş ekran bağlantı planları; yatay ve dikey kurgu.',
    },
    myPart: {
      en: 'Solo project: scenes, lighting, cameras, screen captures, edit and render pipeline.',
      tr: 'Tek kişilik proje: sahneler, ışık, kameralar, ekran kayıtları, kurgu ve render hattı.',
    },
    tags: ['Blender', 'Python', 'Playwright', 'FFmpeg'],
    poster: null,
    links: [{ kind: 'code', href: 'https://github.com/ege-ozel/track-mesh-blender-product-video' }],
  },
];

export const featuredProjects = projects.filter((p) => p.placement === 'featured');
export const moreProjects = projects.filter((p) => p.placement === 'more');

/** Links that let a visitor open or install the project, not only read its code. */
const SHIPPED: readonly LinkKind[] = ['demo', 'site', 'release', 'marketplace'];

/** How many projects a visitor can open or download right now. */
export const shippedCount = projects.filter((p) => p.links.some((l) => SHIPPED.includes(l.kind))).length;
