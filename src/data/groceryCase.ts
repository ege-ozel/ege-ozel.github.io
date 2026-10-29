import type { Shot, Text } from '../types';

/**
 * Copy for /projects/grocery/ and /tr/projects/grocery/.
 *
 * Every figure here was checked against the Grocery repository (github.com/ozan-ozel/grocery)
 * on 29 October 2026: commit counts from `git log`, decision counts from
 * nutrition-curriculum/DEC_REGISTER.md, formulas from src/lib/mealPersonalization.ts, open
 * problems from docs/product-relaunch/00-current-state.md. Re-check them before changing a number.
 */

export interface CaseSection {
  id: string;
  title: Text;
}

interface Step {
  id: string;
  title: Text;
  body: Text;
  shots: Array<Shot & { caption: Text }>;
}

interface Point {
  title: Text;
  body: Text;
}

const shot = (name: string, alt: Text, caption: Text) => ({ base: `/media/grocery-case/${name}`, alt, caption });

export const sections: CaseSection[] = [
  { id: 'problem', title: { en: 'The problem', tr: 'Sorun' } },
  { id: 'walkthrough', title: { en: 'Product walkthrough', tr: 'Ürün turu' } },
  { id: 'architecture', title: { en: 'Architecture', tr: 'Mimari' } },
  { id: 'nutrition', title: { en: 'Nutrition traceability', tr: 'Beslenmede izlenebilirlik' } },
  { id: 'tradeoffs', title: { en: 'Trade-offs', tr: 'Bilinçli ödünler' } },
  { id: 'status', title: { en: 'Status and next steps', tr: 'Durum ve sıradaki adımlar' } },
  { id: 'credits', title: { en: 'Who built what', tr: 'Kim neyi yaptı' } },
  { id: 'contact', title: { en: 'Work with me', tr: 'Birlikte çalışalım' } },
];

export const meta = {
  title: {
    en: 'Grocery — From Meal Planning to Shared Shopping · Ege Özel',
    tr: 'Grocery — Yemek planından ortak alışverişe · Ege Özel',
  },
  description: {
    en: 'Case study: a live full-stack app that helps Turkish households decide what to cook, plan meals around nutrition goals and keep one shared shopping list in sync. Preact, Vercel Functions, Supabase with row-level security.',
    tr: 'Vaka çalışması: Türk hanelerinin ne pişireceğine karar vermesine, öğünleri beslenme hedeflerine göre planlamasına ve ortak alışveriş listesini her cihazda güncel tutmasına yardım eden, yayındaki full-stack uygulama. Preact, Vercel Functions, satır düzeyi güvenlikli Supabase.',
  },
};

export const intro = {
  title: { en: 'Grocery', tr: 'Grocery' },
  lead: {
    en: 'A full-stack app helping Turkish households decide what to cook, plan meals around nutrition goals and keep one shared shopping list in sync.',
    tr: 'Türk hanelerinin ne pişireceğine karar vermesine, öğünleri beslenme hedeflerine göre planlamasına ve ortak alışveriş listesini her cihazda güncel tutmasına yardım eden full-stack bir uygulama.',
  },
  facts: [
    { label: { en: 'Role', tr: 'Rol' }, value: { en: 'Co-developer: product and full stack', tr: 'Ortak geliştirici: ürün ve full-stack' } },
    { label: { en: 'Timeline', tr: 'Süre' }, value: { en: 'Aug – Oct 2026', tr: 'Ağu – Eki 2026' } },
    { label: { en: 'Stack', tr: 'Teknoloji' }, value: { en: 'Preact · TypeScript · Vercel · Supabase', tr: 'Preact · TypeScript · Vercel · Supabase' } },
    { label: { en: 'Status', tr: 'Durum' }, value: { en: 'Live, small-scale use', tr: 'Yayında, küçük ölçekte kullanımda' } },
  ],
  signIn: {
    en: 'The live app needs a Google sign-in. Everything on this page is public: real screens and a screen recording with sample data.',
    tr: 'Canlı uygulama Google ile giriş ister. Bu sayfadaki her şey herkese açık: örnek verili gerçek ekranlar ve bir ekran kaydı.',
  },
  shot: shot(
    'plan',
    {
      en: 'Grocery meal plan for Friday 23 October: daily totals for calories, protein, carbs, fat and fibre above the first meal’s foods.',
      tr: '23 Ekim Cuma için Grocery yemek planı: ilk öğünün yiyeceklerinin üstünde kalori, protein, karbonhidrat, yağ ve lif günlük toplamları.',
    },
    { en: 'Meal plan with the day’s macro totals.', tr: 'Günün makro toplamlarıyla yemek planı.' },
  ),
};

export const problem = {
  body: [
    {
      en: 'It’s late afternoon. You know what you had for lunch, but dinner isn’t decided. You’d like a few options that fit what’s left of the day’s calories and protein, and whatever you pick has to end up on the household’s shopping list, which someone else may be editing from the store.',
      tr: 'Öğleden sonra. Öğlen ne yediğini biliyorsun ama akşam yemeği belli değil. Günün kalan kalorisine ve proteinine uyan birkaç seçenek istiyorsun; seçtiğin şey de evin alışveriş listesine girmeli, belki o sırada biri markette aynı listeyi düzenliyor.',
    },
    {
      en: 'Most apps solve one slice of this: a recipe app, a calorie counter, a shared list. Grocery puts the three decisions in one place, in Turkish, with Turkish food names.',
      tr: 'Çoğu uygulama bunun yalnızca bir parçasını çözer: tarif uygulaması, kalori sayacı ya da ortak liste. Grocery bu üç kararı Türkçe ve Türkçe yemek adlarıyla tek bir yerde toplar.',
    },
  ] satisfies Text[],
  jobs: [
    { title: { en: 'Decide', tr: 'Karar ver' }, body: { en: 'What can I cook tonight that fits my day?', tr: 'Bu akşam günüme uyan ne pişirebilirim?' } },
    { title: { en: 'Plan', tr: 'Planla' }, body: { en: 'What does today add up to?', tr: 'Bugün toplamda ne ediyor?' } },
    { title: { en: 'Buy', tr: 'Al' }, body: { en: 'What do we need, and who is buying it?', tr: 'Neye ihtiyacımız var, kim alıyor?' } },
  ] satisfies Point[],
};

export const walkthrough = {
  intro: {
    en: 'The screens are stills from a real recording of the app with sample household data (October 2026). The interface is in Turkish; the captions translate it.',
    tr: 'Ekranlar, uygulamanın örnek hane verisiyle yapılmış gerçek bir kaydından alınan karelerdir (Ekim 2026).',
  },
  steps: [
    {
      id: 'shopping',
      title: { en: 'Shared shopping', tr: 'Ortak alışveriş' },
      body: {
        en: 'One list per household, synced across devices. New items are filed into store aisles automatically, using Turkish stemming, curated keyword lists and a head-noun fallback for compound names like “chia tohumu”. A household’s own corrections win and sync to every member, and autocomplete comes from what the household bought before.',
        tr: 'Her hanenin cihazlar arasında eşitlenen tek bir listesi var. Yeni ürünler otomatik olarak reyonlara yerleşir: Türkçe kök bulma, özenle hazırlanmış anahtar kelime listeleri ve “chia tohumu” gibi birleşik adlar için baş isim kuralı. Hanenin kendi düzeltmeleri önceliklidir ve tüm üyelere eşitlenir; otomatik tamamlama hanenin daha önce aldıklarından gelir.',
      },
      shots: [
        shot(
          'list',
          {
            en: 'Shopping list “Haftalık alışveriş” with 2 of 10 items done, grouped under fruit and vegetables, dairy, eggs and poultry.',
            tr: '“Haftalık alışveriş” listesi, 10 üründen 2’si tamam; meyve ve sebze, süt ürünleri, yumurta ve kanatlı başlıklarında gruplanmış.',
          },
          { en: 'Items filed into aisles automatically.', tr: 'Ürünler otomatik olarak reyonlara ayrılır.' },
        ),
        shot(
          'autocomplete',
          {
            en: 'The add-item field open with a “most bought” list: milk, eggs, tomatoes, chicken breast, rice, broccoli.',
            tr: 'Ürün ekleme alanı açık, “en çok alınan” listesiyle: süt, yumurta, domates, tavuk göğsü, pirinç, brokoli.',
          },
          { en: 'Autocomplete from what the household buys most.', tr: 'Hanenin en çok aldıklarından otomatik tamamlama.' },
        ),
      ],
    },
    {
      id: 'planning',
      title: { en: 'Daily meal plan', tr: 'Günlük yemek planı' },
      body: {
        en: 'The day is split into meal slots. Food comes from the nutrition catalog (macros per 100 g, portion in grams), from ready-made meals or from the user’s own saved meals and recipes. A summary card adds up the day against the targets, and clearing a slot or a day can be undone up to five steps back.',
        tr: 'Gün öğünlere bölünür. Yiyecekler besin kataloğundan (100 g başına makrolar, gram cinsinden porsiyon), hazır yemeklerden ya da kullanıcının kaydettiği yemek ve tariflerden eklenir. Özet kartı günü hedeflerle karşılaştırır; bir öğünü ya da günü temizlemek beş adıma kadar geri alınabilir.',
      },
      shots: [
        shot(
          'plan',
          {
            en: 'Meal plan for Friday 23 October: calories 2940, protein 101 g, carbohydrate 456 g, fat 90 g, fibre 41 g, then the first meal with eggs, white cheese and wholewheat bread.',
            tr: '23 Ekim Cuma yemek planı: kalori 2940, protein 101 g, karbonhidrat 456 g, yağ 90 g, lif 41 g; ardından yumurta, beyaz peynir ve tam buğday ekmekli ilk öğün.',
          },
          { en: 'The day’s totals above each meal.', tr: 'Her öğünün üstünde günün toplamları.' },
        ),
        shot(
          'picker',
          {
            en: 'Food picker searching for salmon: 142 kcal per 100 g with protein and fat, a 100 g portion field and an Add button.',
            tr: 'Somon aranan yiyecek seçici: 100 g’da 142 kcal, protein ve yağ değerleri, 100 g porsiyon alanı ve Ekle düğmesi.',
          },
          { en: 'Adding salmon by weight.', tr: 'Somonu gram olarak ekleme.' },
        ),
        shot(
          'undo',
          {
            en: 'Meal plan with a “salmon added” message and an Undo link at the bottom of the screen.',
            tr: 'Ekranın altında “somon eklendi” mesajı ve Geri al bağlantısıyla yemek planı.',
          },
          { en: 'Every change can be undone.', tr: 'Her değişiklik geri alınabilir.' },
        ),
      ],
    },
    {
      id: 'suggestions',
      title: { en: 'Meal suggestions', tr: 'Öğün önerileri' },
      body: {
        en: 'Suggestions rank the meals the user can already pick against the share of the day’s remaining macros that the slot should take. It is a pure, deterministic function: no network call and no language model, so the same day gives the same suggestions and the ranking can be checked by hand. Its weights are documented as MVP tuning values, not as science.',
        tr: 'Öneriler, kullanıcının zaten seçebildiği yemekleri, günün kalan makrolarından o öğüne düşen paya göre sıralar. Bu saf ve deterministik bir fonksiyondur: ağ çağrısı ve dil modeli yoktur; aynı gün aynı önerileri verir ve sıralama elle kontrol edilebilir. Ağırlıkları bilimsel değer olarak değil, MVP ayarı olarak belgelenmiştir.',
      },
      shots: [
        shot(
          'suggestions',
          {
            en: 'Evening suggestions under the day’s meals: minced beef with rice, 25 minutes, 763 kcal and 29 g protein, with buttons to add it to the list, mark it as being prepared or log it as eaten.',
            tr: 'Günün öğünlerinin altında akşam önerileri: dana kıyma ve pirinç, 25 dakika, 763 kcal ve 29 g protein; listeye ekleme, hazırlanıyor ve yedim düğmeleriyle.',
          },
          { en: 'Evening suggestions with calories and protein.', tr: 'Kalori ve proteinle akşam önerileri.' },
        ),
      ],
    },
  ] satisfies Step[],
  more: [
    {
      title: { en: 'Recipes and saved meals', tr: 'Tarifler ve kayıtlı yemekler' },
      body: {
        en: 'Users save their own meals and recipes and add them to any slot. Ready-made meals come from a curated set with gram amounts per portion.',
        tr: 'Kullanıcılar kendi yemeklerini ve tariflerini kaydedip istedikleri öğüne ekler. Hazır yemekler, porsiyon başına gram miktarları belli, özenle seçilmiş bir setten gelir.',
      },
    },
    {
      title: { en: 'Personal targets', tr: 'Kişisel hedefler' },
      body: {
        en: 'Age, sex, height, weight, activity and goal become an energy target and macro ranges. A “show sources” switch names the reference behind each part. Until a profile is saved, the targets are labelled as an example.',
        tr: 'Yaş, cinsiyet, boy, kilo, aktivite ve hedef; bir enerji hedefine ve makro aralıklarına dönüşür. “Kaynakları göster” anahtarı her bölümün dayandığı kaynağı gösterir. Profil kaydedilene kadar hedefler “Örnek hedef” olarak işaretlenir.',
      },
    },
    {
      title: { en: 'Nutrition catalog', tr: 'Besin kataloğu' },
      body: {
        en: 'Searchable foods with macros per 100 g, and a side-by-side comparison of two foods. Each Turkish name is mapped by hand to a USDA FoodData Central record; packaged goods use Turkish label values.',
        tr: '100 g başına makrolarıyla aranabilir yiyecekler ve iki yiyeceğin yan yana karşılaştırması. Her Türkçe ad elle bir USDA FoodData Central kaydına eşlenir; paketli ürünlerde Türkiye’deki etiket değerleri kullanılır.',
      },
    },
  ] satisfies Point[],
  video: {
    src: '/media/grocery.mp4',
    poster: '/media/grocery-case/list-390.webp',
    title: { en: 'The 15-second recording', tr: '15 saniyelik kayıt' },
    caption: {
      en: 'Real screen recording with sample data, no sound: the shopping list, then building a meal in the plan.',
      tr: 'Örnek verili gerçek ekran kaydı, sessiz: önce alışveriş listesi, sonra planda bir öğün oluşturma.',
    },
  },
};

export const architecture = {
  intro: {
    en: 'A small system with two independent authorization layers. The browser talks only to its own API, and the database checks every row again.',
    tr: 'İki bağımsız yetkilendirme katmanı olan küçük bir sistem. Tarayıcı yalnızca kendi API’siyle konuşur; veritabanı her satırı yeniden denetler.',
  },
  diagram: {
    browser: { en: 'Browser', tr: 'Tarayıcı' },
    browserDetail: { en: 'Preact + TypeScript, cached views', tr: 'Preact + TypeScript, önbellekli görünümler' },
    functions: { en: 'Vercel Functions (12)', tr: 'Vercel Functions (12)' },
    functionsDetail: { en: 'requireUser · requireHouseholdAccess', tr: 'requireUser · requireHouseholdAccess' },
    database: { en: 'Supabase Postgres', tr: 'Supabase Postgres' },
    databaseDetail: { en: 'Row Level Security on every table', tr: 'Her tabloda satır düzeyi güvenlik' },
    google: { en: 'Google OAuth', tr: 'Google OAuth' },
    googleNote: { en: 'sign-in only', tr: 'yalnızca girişte' },
    browserRole: { en: 'Holds no keys', tr: 'Anahtar tutmaz' },
    functionsRole: { en: 'Check 1', tr: '1. denetim' },
    databaseRole: { en: 'Check 2', tr: '2. denetim' },
    cookie: { en: 'httpOnly cookie', tr: 'httpOnly çerez' },
    session: { en: 'caller’s own session', tr: 'kullanıcının kendi oturumu' },
    label: {
      en: 'Diagram: the browser calls Vercel Functions with an httpOnly session cookie; the functions sign in with Google OAuth and query Supabase Postgres with the caller’s own session, where row-level security applies again.',
      tr: 'Diyagram: tarayıcı Vercel Functions’ı httpOnly oturum çereziyle çağırır; fonksiyonlar Google OAuth ile giriş yapar ve Supabase Postgres’i kullanıcının kendi oturumuyla sorgular; orada satır düzeyi güvenlik yeniden uygulanır.',
    },
  },
  points: [
    {
      title: { en: 'Sign-in', tr: 'Giriş' },
      body: {
        en: 'Server-side Google OAuth ends in an httpOnly session cookie. The browser holds no Supabase or Google credential and runs no Supabase client.',
        tr: 'Sunucu tarafındaki Google OAuth akışı httpOnly bir oturum çereziyle biter. Tarayıcıda Supabase ya da Google kimlik bilgisi tutulmaz, Supabase istemcisi çalışmaz.',
      },
    },
    {
      title: { en: 'Authorization', tr: 'Yetkilendirme' },
      body: {
        en: 'Every request is checked in the function and again by Postgres row-level security, because functions query the database with the caller’s own session, not a service key. The service role is kept for identity linking, account deletion and admin catalog writes, and admin access fails closed when its allowlist is empty.',
        tr: 'Her istek fonksiyonda ve ardından Postgres satır düzeyi güvenliğiyle yeniden denetlenir; çünkü fonksiyonlar veritabanını servis anahtarıyla değil, kullanıcının kendi oturumuyla sorgular. Servis rolü yalnızca kimlik eşleme, hesap silme ve yönetici katalog yazımları için kullanılır; izin listesi boşsa yönetici erişimi kapalı kalır.',
      },
    },
    {
      title: { en: 'Household sync', tr: 'Hane eşitlemesi' },
      body: {
        en: 'Each household list is one JSON document with a version number. Clients poll and send debounced writes; a stale write gets HTTP 409 with the current state, which the client adopts. Last write wins on purpose: it is easy to reason about and enough for two to four people.',
        tr: 'Her hane listesi, sürüm numarası olan tek bir JSON belgesidir. İstemciler düzenli aralıklarla sorgular ve yazmaları geciktirerek gönderir; eski sürüme yapılan yazma, güncel durumla birlikte HTTP 409 alır ve istemci bu durumu benimser. Son yazan kazanır, bilerek: anlaşılması kolaydır ve iki ila dört kişi için yeterlidir.',
      },
    },
    {
      title: { en: 'Performance', tr: 'Performans' },
      body: {
        en: 'The nutrition, meal plan, personal plan and settings views load on demand, and so does the categorization engine. Cached data paints first. The boot sequence was restructured to remove a request waterfall, and a duplicate request was found and removed through browser testing.',
        tr: 'Besin, yemek planı, kişisel plan ve ayarlar görünümleri ihtiyaç anında yüklenir; kategorilendirme motoru da öyle. Önce önbellekteki veri çizilir. Açılış akışı bir istek şelalesini kaldıracak şekilde yeniden düzenlendi; tekrarlanan bir istek de tarayıcı testiyle bulunup kaldırıldı.',
      },
    },
    {
      title: { en: 'Platform limit', tr: 'Platform sınırı' },
      body: {
        en: 'The Vercel Hobby plan allows twelve functions and the project uses all twelve, so new endpoints are routed into existing functions with rewrites.',
        tr: 'Vercel Hobby planı on iki fonksiyona izin veriyor ve proje on ikisini de kullanıyor; bu yüzden yeni uç noktalar yönlendirmelerle mevcut fonksiyonlara bağlanıyor.',
      },
    },
    {
      title: { en: 'Lessons from production', tr: 'Canlı ortamdan dersler' },
      body: {
        en: 'Two security rules came out of incidents and are now documented invariants: a table’s read policy never re-queries the same table, and row-level security is never switched on without its policies in the same migration.',
        tr: 'İki güvenlik kuralı yaşanan olaylardan çıktı ve artık belgelenmiş değişmezler: bir tablonun okuma politikası aynı tabloyu yeniden sorgulamaz ve satır düzeyi güvenlik, politikaları aynı migration’da olmadan açılmaz.',
      },
    },
  ] satisfies Point[],
};

/** Counts from nutrition-curriculum/DEC_REGISTER.md; they must add up to 112. */
export const decisionStatus = [
  { id: 'shipped', count: 11, label: { en: 'Shipped', tr: 'Yayında' } },
  { id: 'provisional', count: 4, label: { en: 'Provisional', tr: 'Geçici' } },
  { id: 'partial', count: 1, label: { en: 'Partial', tr: 'Kısmi' } },
  { id: 'covered', count: 15, label: { en: 'Covered', tr: 'Karşılanıyor' } },
  { id: 'deferred', count: 7, label: { en: 'Deferred', tr: 'Ertelendi' } },
  { id: 'blocked', count: 74, label: { en: 'Blocked', tr: 'Bekliyor' } },
] as const;

export const nutrition = {
  intro: {
    en: 'Nutrition logic in Grocery isn’t improvised. It comes from a research corpus kept in the repository: seven nutrition-science textbooks and one culinary textbook, condensed into a 213-topic curriculum and 112 application decisions (DEC-001 to DEC-112). Each decision has a readiness status, and code is written only for what a decision specifies.',
    tr: 'Grocery’deki beslenme mantığı doğaçlama değil. Depoda tutulan bir araştırma derlemesinden geliyor: yedi beslenme bilimi ders kitabı ve bir mutfak ders kitabı; 213 konuluk bir müfredata ve 112 uygulama kararına (DEC-001 – DEC-112) dönüştürüldü. Her kararın bir hazırlık durumu var ve kod yalnızca kararın tanımladığı kadar yazılıyor.',
  },
  statusTitle: { en: 'The 112 decisions today', tr: 'Bugün 112 karar' },
  statusNote: {
    en: 'Most decisions are blocked on purpose, waiting for a missing subsystem or a human safety decision. The register is a map of the problem, not a feature count.',
    tr: 'Kararların çoğu bilerek bekletiliyor: eksik bir alt sistemi ya da bir insanın güvenlik kararını bekliyorlar. Kayıt bir özellik sayısı değil, problemin haritası.',
  },
  chainTitle: { en: 'One decision, end to end: daily protein (DEC-031)', tr: 'Bir karar, baştan sona: günlük protein (DEC-031)' },
  chain: [
    {
      title: { en: 'Source', tr: 'Kaynak' },
      body: {
        en: 'Jeukendrup & Gleeson, Sport Nutrition, 4th edition (2025): the extra muscle-building benefit of protein levels off at about 1.6–1.7 g per kg of body weight a day.',
        tr: 'Jeukendrup & Gleeson, Sport Nutrition, 4. baskı (2025): proteinin kas yapımına ek faydası, günde kilo başına yaklaşık 1,6–1,7 g’da sabitlenir.',
      },
    },
    {
      title: { en: 'Decision', tr: 'Karar' },
      body: {
        en: 'DEC-031 sets protein in g/kg tiers. A review gate kept the 1.6–2.2 g/kg band but ruled that its upper half may not be presented as an extra muscle-building benefit.',
        tr: 'DEC-031 proteini g/kg kademeleriyle belirler. Bir inceleme kapısı 1,6–2,2 g/kg bandını korudu, ancak üst yarısının ek kas faydası gibi sunulamayacağına karar verdi.',
      },
    },
    {
      title: { en: 'Implementation', tr: 'Uygulama' },
      body: {
        en: 'calculateTargets() uses 2.0 g/kg for weight loss, 1.6 g/kg for weight gain or high activity, and 1.2 g/kg otherwise.',
        tr: 'calculateTargets(), kilo vermede 2,0 g/kg, kilo almada ya da yüksek aktivitede 1,6 g/kg, diğer durumlarda 1,2 g/kg kullanır.',
      },
    },
    {
      title: { en: 'Verification', tr: 'Doğrulama' },
      body: {
        en: 'Marked SHIPPED in the decision register, meaning implemented and checked. In the app, the personal plan’s source list names the book next to the macro targets.',
        tr: 'Karar kaydında SHIPPED olarak işaretli: uygulandı ve kontrol edildi. Uygulamada kişisel planın kaynak listesi, makro hedeflerinin yanında kitabı gösterir.',
      },
    },
  ] satisfies Point[],
  method: {
    en: 'Energy: Mifflin–St Jeor for resting energy, an activity multiplier, then a conservative −400 kcal for weight loss or +250 kcal for gain (the curriculum says ±500; that is an open tuning question). BMI and waist size are shown as context, never as a diagnosis. There are no automatic targets for minors, pregnancy, medical conditions or eating-disorder recovery.',
    tr: 'Enerji: dinlenme enerjisi için Mifflin–St Jeor, bir aktivite çarpanı, ardından kilo vermede temkinli −400 kcal, almada +250 kcal (müfredat ±500 diyor; bu açık bir ayar sorusu). Beden kitle indeksi ve bel çevresi teşhis olarak değil, bağlam olarak gösterilir. Reşit olmayanlar, gebelik, tıbbi durumlar ve yeme bozukluğundan iyileşme için otomatik hedef verilmez.',
  },
  limitsTitle: { en: 'What it is not, and what is still open', tr: 'Ne değildir, ne hâlâ açık' },
  limits: [
    {
      en: 'Not clinically validated software, and not medical advice.',
      tr: 'Klinik olarak doğrulanmış bir yazılım ya da tıbbi tavsiye değildir.',
    },
    {
      en: 'Protein, carbohydrate and fat ranges are still calculated independently. The plan picks one point inside them that adds up to the calorie target; when no such point exists, it says so and makes no suggestions rather than step outside the ranges.',
      tr: 'Protein, karbonhidrat ve yağ aralıkları hâlâ birbirinden bağımsız hesaplanıyor. Plan bu aralıkların içinden kalori hedefini tutan tek bir nokta seçiyor; böyle bir nokta yoksa aralıkların dışına çıkmak yerine bunu açıkça söylüyor ve öneri yapmıyor.',
    },
    {
      en: 'The plan does not yet separate planned meals from eaten ones, and a household shares one plan while targets are personal.',
      tr: 'Plan henüz planlanan öğünlerle yenenleri ayırmıyor; ayrıca hane tek bir planı paylaşırken hedefler kişisel.',
    },
  ] satisfies Text[],
};

export const tradeoffs: Point[] = [
  {
    title: { en: 'Polling, not WebSockets', tr: 'WebSocket değil, sorgulama' },
    body: {
      en: 'Fits households of two to four people; costs a few seconds of delay between devices.',
      tr: 'İki ila dört kişilik hanelere uyar; cihazlar arasında birkaç saniyelik gecikmeye mal olur.',
    },
  },
  {
    title: { en: 'Last write wins', tr: 'Son yazan kazanır' },
    body: {
      en: 'Simple and predictable. Two people editing the same list at the same moment can overwrite each other.',
      tr: 'Basit ve öngörülebilir. Aynı listeyi aynı anda düzenleyen iki kişi birbirinin değişikliğini ezebilir.',
    },
  },
  {
    title: { en: 'No session refresh', tr: 'Oturum yenileme yok' },
    body: {
      en: 'A session lasts as long as its access token, then the user signs in again. Documented as a decision, not forgotten.',
      tr: 'Oturum, erişim belirteci geçerli olduğu sürece sürer; sonra kullanıcı yeniden giriş yapar. Unutulmadı, karar olarak belgelendi.',
    },
  },
  {
    title: { en: 'No test framework', tr: 'Test framework’ü yok' },
    body: {
      en: 'Strict TypeScript is the automated gate, and behavior is checked in a real browser. Removing the unit tests was deliberate; it means catching regressions depends on that discipline.',
      tr: 'Otomatik kapı katı TypeScript; davranış gerçek tarayıcıda kontrol ediliyor. Birim testlerini kaldırmak bilinçli bir karardı; gerilemeleri yakalamak bu disipline bağlı.',
    },
  },
  {
    title: { en: 'Twelve functions', tr: 'On iki fonksiyon' },
    body: {
      en: 'Endpoints share functions through rewrites instead of moving to a paid plan.',
      tr: 'Ücretli plana geçmek yerine uç noktalar yönlendirmelerle fonksiyonları paylaşıyor.',
    },
  },
  {
    title: { en: 'Rules, not a model', tr: 'Model değil, kurallar' },
    body: {
      en: 'Deterministic suggestions are explainable and free to run, and less flexible than a learned ranker.',
      tr: 'Deterministik öneriler açıklanabilir ve çalıştırması ücretsizdir; öğrenen bir sıralayıcıdan daha az esnektir.',
    },
  },
];

export const status = {
  body: {
    en: 'Grocery is live and in use on a small scale. It has no established user base and no growth numbers to report. Work in progress:',
    tr: 'Grocery yayında ve küçük ölçekte kullanılıyor. Yerleşik bir kullanıcı kitlesi ya da paylaşılacak büyüme rakamı yok. Üzerinde çalışılanlar:',
  },
  next: [
    { en: 'Separate planned meals from eaten ones.', tr: 'Planlanan öğünleri yenenlerden ayırmak.' },
    {
      en: 'Expand the food catalog and its allergen mappings (35 of 103 foods so far) with USDA-mapped foods and Turkish label values.',
      tr: 'Besin kataloğunu ve alerjen eşlemelerini (şimdilik 103 yiyecekten 35’i) USDA’ya eşlenmiş yiyecekler ve Türkiye etiket değerleriyle genişletmek.',
    },
    { en: 'Design a guest demo that works without signing in.', tr: 'Giriş yapmadan çalışan bir misafir demosu tasarlamak.' },
  ] satisfies Text[],
};

export const credits = {
  body: [
    {
      en: 'Grocery is a two-person project. Ozan Özel started it in August 2026: the first web app and shopping categories, the initial database schema, the household, sync and nutrition APIs, the first authentication guard, and several research and roadmap documents.',
      tr: 'Grocery iki kişilik bir proje. Ozan Özel projeyi Ağustos 2026’da başlattı: ilk web uygulaması ve alışveriş kategorileri, ilk veritabanı şeması, hane, eşitleme ve besin API’leri, ilk kimlik doğrulama koruması ve birkaç araştırma ile yol haritası belgesi.',
    },
    {
      en: 'I built Google sign-in and sessions, the versioned sync layer, meal planning, the personal plan, most of the row-level security policies, account deletion, most of the interface and most of the nutrition curriculum, about 430 of the 465 commits.',
      tr: 'Ben Google ile girişi ve oturumları, sürümlü eşitleme katmanını, yemek planlamayı, kişisel planı, satır düzeyi güvenlik politikalarının çoğunu, hesap silmeyi, arayüzün büyük bölümünü ve beslenme müfredatının büyük kısmını geliştirdim; 465 commit’in yaklaşık 430’u.',
    },
  ] satisfies Text[],
};

export const contact = {
  body: {
    en: 'I’m open to full-stack and product engineering roles, and to selected freelance work: complete web applications, from the first requirement to deployment and upkeep.',
    tr: 'Full-stack ve ürün mühendisliği rollerine, ayrıca seçili serbest projelere açığım: ilk gereksinimden yayına almaya ve bakıma kadar eksiksiz web uygulamaları.',
  },
};

export const links = {
  code: 'https://github.com/ozan-ozel/grocery',
  app: 'https://grocery-five-ecru.vercel.app',
};
