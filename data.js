export const PLAYERS = [
  {
    id: 'arda', type: 'player',
    name: 'Arda Güler', nickname: 'El Joven', nicknameEn: 'The Wonder Kid',
    sub: 'Real Madrid · #11', nat: 'Türkiye', role: 'Orta Saha / Sol Kanat', league: 'La Liga',
    icon: 'ti-wand',
    bannerColor: '#E30A17', avatarBg: '#E30A17', avatarText: '#ffffff',
    fanScore: 9.2, overall: 87, marketValue: '€85M',
    stats: [{ l: 'Maç', v: 47 }, { l: 'Gol', v: 12 }, { l: 'Asist', v: 9 }, { l: 'Puan Ort.', v: '8.3' }, { l: 'Yaş', v: 19 }],
    badges: [{ t: 'badge-type', l: 'Oyuncu' }, { t: 'badge-nat', l: '🇹🇷 Türkiye' }, { t: 'badge-role', l: 'Orta Saha' }],
    perfs: [
      { label: 'Teknik', val: 94, color: '#E30A17' },
      { label: 'Vizyon', val: 91, color: '#1D9E75' },
      { label: 'Şut', val: 88, color: '#378ADD' },
      { label: 'Pas', val: 86, color: '#1D9E75' },
      { label: 'Hız', val: 81, color: '#c9a84c' },
      { label: 'Fizik', val: 72, color: '#888780' }
    ],
    trophies: [
      { icon: 'ti-trophy', title: 'La Liga', club: 'Real Madrid', yr: '2024–25' },
      { icon: 'ti-medal', title: 'Süper Kupa', club: 'Real Madrid', yr: '2024' },
      { icon: 'ti-star', title: 'EURO 2024 Maç Adamı', club: 'Türkiye MT', yr: '2024' },
      { icon: 'ti-award', title: 'Golden Boy Aday', club: 'UEFA', yr: '2024' }
    ],
    timeline: [
      { yr: '2014', title: 'Fenerbahçe Altyapısı', desc: '8 yaşında Fenerbahçe\'nin gözüne girdi.', tag: 'İlk Adım' },
      { yr: '2021', title: 'İlk Profesyonel Sözleşme', desc: '15 yaşında — Türkiye\'nin en genç profesyoneli.', tag: 'Rekor' },
      { yr: '2022', title: 'Süper Lig\'deki İlk Gol', desc: 'Galatasaray\'a karşı serbest vuruştan tarihi gol.', tag: 'Tarihi Gol' },
      { yr: '2023', title: 'Real Madrid Transferi', desc: '20M € bonservis. Bernabéu kazandı.', tag: 'Kariyer Sıçraması' },
      { yr: '2024', title: 'EURO 2024 Fenomeni', desc: 'Gürcistan ve Çekya\'ya attığı gollerle dünya sahnesine çıktı.', tag: 'Dünya Sahnesi' },
      { yr: '2025', title: 'UCL İlk Golü', desc: 'Man City\'ye karşı. Ancelotti\'nin tam güveni kazanıldı.', tag: 'Şampiyonlar Ligi' }
    ],
    chemistry: [
      { initials: 'VJ', name: 'Vinicius Jr.', pos: 'Sol Kanat', pct: 95, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'HC', name: 'Hakan Çalhanoğlu', pos: 'Orta Saha (MT)', pct: 91, bg: '#FAEEDA', tc: '#633806' },
      { initials: 'JB', name: 'Jude Bellingham', pos: 'Orta Saha', pct: 88, bg: '#FBEAF0', tc: '#72243E' },
      { initials: 'KM', name: 'Kylian Mbappé', pos: 'Forvet', pct: 82, bg: '#E1F5EE', tc: '#085041' }
    ],
    aiStrong: 'Dar alanlarda ani dönüşler ve yön değiştirme hızı eşsiz. Sol ayak şutu uzak mesafeden isabetli. Oyun okuma yeteneği yaşına göre olağanüstü.',
    aiStrong_chips: ['Dar alan dehası', 'Sol ayak', 'Oyun okuma', 'Baskı altında sakin'],
    aiWeak: 'Fiziksel olarak güçlü rakiplere karşı top kaybı artıyor. Sağ ayak kullanımı kısıtlı. Defansif katkı düşük.',
    aiWeak_chips: ['Fizik', 'Sağ ayak', 'Pressing'],
    aiFuture: 'Mevcut hızda 22–23 yaşında Ballon d\'Or adayı. 2 sezon içinde Avrupa\'nın en değerli 5 oyuncusundan biri olabilir.',
    milestones: [
      { icon: 'ti-file-certificate', bg: '#FAEEDA', ic: '#633806', title: 'İlk profesyonel sözleşme (2021)', desc: 'Türk futbolunun en genç sözleşmeli oyuncusu.' },
      { icon: 'ti-ball-football', bg: '#FCEBEB', ic: '#791F1F', title: 'Süper Lig\'deki ilk gol (2022)', desc: 'Galatasaray\'a karşı serbest vuruştan.' },
      { icon: 'ti-plane', bg: '#E6F1FB', ic: '#0C447C', title: 'Real Madrid transferi (2023)', desc: 'Türk futbolunun en prestijli transferi.' },
      { icon: 'ti-crown', bg: '#EEEDFE', ic: '#3C3489', title: 'UCL ilk golü (2025)', desc: 'Manchester City\'ye karşı.' }
    ]
  },
  {
    id: 'hakan', type: 'player',
    name: 'Hakan Çalhanoğlu', nickname: 'Il Regista', nicknameEn: 'The Maestro',
    sub: 'Inter Milan · #20', nat: 'Türkiye', role: 'Defansif Orta Saha', league: 'Serie A',
    icon: 'ti-music',
    bannerColor: '#E30A17', avatarBg: '#ffffff', avatarText: '#E30A17',
    fanScore: 9.0, overall: 88, marketValue: '€50M',
    stats: [{ l: 'Maç', v: 312 }, { l: 'Gol', v: 68 }, { l: 'Asist', v: 97 }, { l: 'Puan Ort.', v: '8.1' }, { l: 'Yaş', v: 31 }],
    badges: [{ t: 'badge-type', l: 'Oyuncu' }, { t: 'badge-nat', l: '🇹🇷 Türkiye' }, { t: 'badge-role', l: 'Defansif OS' }],
    perfs: [
      { label: 'Pas', val: 96, color: '#185FA5' },
      { label: 'Vizyon', val: 93, color: '#1D9E75' },
      { label: 'Top Kesme', val: 88, color: '#c9a84c' },
      { label: 'Şut', val: 82, color: '#378ADD' },
      { label: 'Liderlik', val: 91, color: '#c9a84c' },
      { label: 'Hız', val: 74, color: '#888780' }
    ],
    trophies: [
      { icon: 'ti-trophy', title: 'Serie A (Scudetto)', club: 'Inter Milan', yr: '2023–24' },
      { icon: 'ti-medal', title: 'Coppa Italia', club: 'Inter Milan', yr: '2023' },
      { icon: 'ti-star', title: 'Serie A Sezonun Oyuncusu', club: 'Lega Serie A', yr: '2024' },
      { icon: 'ti-award', title: 'EURO 2024 Kaptanı', club: 'Türkiye MT', yr: '2024' }
    ],
    timeline: [
      { yr: '2010', title: 'Trabzonspor Altyapısı', desc: 'Karadeniz\'den çıkan mücadeleci oyun kurucu.', tag: 'Başlangıç' },
      { yr: '2014', title: 'Bayer Leverkusen', desc: 'Bundesliga\'da serbest vuruş uzmanı olarak öne çıktı.', tag: 'Almanya' },
      { yr: '2017', title: 'AC Milan', desc: 'Serie A\'da 5 sezon ekibin motoru.', tag: 'İtalya' },
      { yr: '2021', title: 'Inter Milan', desc: 'Defansif regista rolüne mükemmel uyum.', tag: 'Dönüşüm' },
      { yr: '2023', title: 'Scudetto & Kaptanlık', desc: 'Inter\'i şampiyonluğa taşıdı. Serie A\'nın en iyisi.', tag: 'Şampiyon' }
    ],
    chemistry: [
      { initials: 'LM', name: 'Lautaro Martínez', pos: 'Forvet', pct: 94, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'NB', name: 'Nicolò Barella', pos: 'Orta Saha', pct: 90, bg: '#FAEEDA', tc: '#633806' },
      { initials: 'MT', name: 'Marcus Thuram', pos: 'Forvet', pct: 85, bg: '#E1F5EE', tc: '#085041' },
      { initials: 'FD', name: 'Federico Dimarco', pos: 'Sol Bek', pct: 82, bg: '#EEEDFE', tc: '#3C3489' }
    ],
    aiStrong: 'Serie A\'nın en iyi regista\'larından biri. Pas isabeti %94 ile zirvede. Serbest vuruş ustalığı kariyeri boyunca değişmedi.',
    aiStrong_chips: ['Regista', 'Pas isabeti', 'Serbest vuruş', 'Liderlik'],
    aiWeak: 'Yüksek tempolu pressing oyununda fiziksel limitler devreye giriyor. 31 yaşında hız düşüyor.',
    aiWeak_chips: ['Hız', 'Pressing yoğunluğu'],
    aiFuture: '1–2 sezon daha Serie A\'da. Ardından MLS veya Süper Lig\'e dönüş ihtimali. Teknik direktörlük entelektüel altyapısı mevcut.',
    milestones: [
      { icon: 'ti-trophy', bg: '#FAEEDA', ic: '#633806', title: 'Inter Scudetto (2023)', desc: 'Şampiyonlukta anahtar figür. Serie A\'nın en iyisi.' },
      { icon: 'ti-arrow-shuffle', bg: '#E6F1FB', ic: '#0C447C', title: 'Pozisyon dönüşümü (2021)', desc: 'Klasik orta sahadan regista\'ya.' },
      { icon: 'ti-flag', bg: '#E1F5EE', ic: '#085041', title: 'EURO 2024 kaptanlığı', desc: 'Türkiye\'yi çeyrek finale taşıdı.' }
    ]
  },
  {
    id: 'vedat', type: 'player',
    name: 'Vedat Muriqi', nickname: 'Tigri i Kosovës', nicknameEn: 'The Kosovo Tiger',
    sub: 'RCD Mallorca · #9', nat: 'Kosova', role: 'Santrfor', league: 'La Liga',
    icon: 'ti-bolt',
    bannerColor: '#CC0000', avatarBg: '#CC0000', avatarText: '#ffffff',
    fanScore: 8.1, overall: 82, marketValue: '€20M',
    stats: [{ l: 'Maç', v: 340 }, { l: 'Gol', v: 130 }, { l: 'Asist', v: 28 }, { l: 'Puan Ort.', v: '7.1' }, { l: 'Yaş', v: 31 }],
    badges: [{ t: 'badge-type', l: 'Oyuncu' }, { t: 'badge-nat', l: '🦅 Kosova' }, { t: 'badge-role', l: 'Santrfor' }],
    perfs: [
      { label: 'Kafa Topu', val: 94, color: '#CC0000' },
      { label: 'Fiziksel Güç', val: 92, color: '#333333' },
      { label: 'Top Tutma', val: 87, color: '#c9a84c' },
      { label: 'Şut', val: 83, color: '#378ADD' },
      { label: 'Hız', val: 76, color: '#1D9E75' },
      { label: 'Pas', val: 61, color: '#888780' }
    ],
    trophies: [
      { icon: 'ti-star', title: 'La Liga Golcü Ödülü', club: 'RCD Mallorca', yr: '2023–24' },
      { icon: 'ti-trophy', title: 'Kosovo Süper Ligi', club: 'FC Prishtina', yr: '2013' },
      { icon: 'ti-award', title: 'Kosovo MT Tüm Zamanlar Golcüsü', club: 'Kosovo Millî Takımı', yr: '2024' },
      { icon: 'ti-medal', title: 'Türkiye Kupası', club: 'Fenerbahçe', yr: '2023' }
    ],
    timeline: [
      { yr: '2012', title: 'FC Prishtina', desc: 'Kosova futbol liginde kariyerine başladı. 18 yaşında ilk profesyonel sözleşme.', tag: 'İlk Adım' },
      { yr: '2014', title: 'Bursaspor', desc: 'Türkiye\'de ilk yabancı deneyimi. Süper Lig\'in ağır defanslarını eğitti.', tag: 'Türkiye' },
      { yr: '2018', title: 'Alanyaspor', desc: 'Türkiye\'de olgunlaştı; her sezon gol sayısını artırdı.', tag: 'Büyüme' },
      { yr: '2019', title: 'Fenerbahçe', desc: '11M € bonservis — Kosova\'nın o güne kadar en pahalı transferi.', tag: 'Rekor Transfer' },
      { yr: '2021', title: 'Lazio', desc: 'Serie A\'ya geçiş. İtalya\'da fiziksel gücü konuşturdu.', tag: 'İtalya' },
      { yr: '2022', title: 'RCD Mallorca', desc: 'La Liga\'da sürpriz yıldız. 24 gol ile İspanya\'yı salladı.', tag: 'İspanya Fırtınası' }
    ],
    chemistry: [
      { initials: 'DR', name: 'Dani Rodríguez', pos: 'Sağ Kanat', pct: 91, bg: '#FBEAF0', tc: '#72243E' },
      { initials: 'AF', name: 'Amir Abrashi (Millî)', pos: 'Orta Saha', pct: 87, bg: '#FAEEDA', tc: '#633806' },
      { initials: 'CS', name: 'Çağlar Söyüncü (MT)', pos: 'Stoper', pct: 83, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'LK', name: 'Lee Kang-in (Mallorca)', pos: 'Orta Saha', pct: 80, bg: '#E1F5EE', tc: '#085041' }
    ],
    aiStrong: 'İspanya\'nın hava topundaki en tehlikeli forveti. Kafa topunda La Liga\'da 3 sezon üst üste birinci. Rakip defansları yoran beden gücü ve baskı oyunu 90 dakika boyunca yıpratıcı.',
    aiStrong_chips: ['Kafa topu', 'Fiziksel güç', 'Top tutma', 'Pressing'],
    aiWeak: 'Teknik kombinasyonlarda sınırlı. Dar alanlarda top kaybı fazla. UCL seviyesinde maç deneyimi kısıtlı.',
    aiWeak_chips: ['Teknik', 'Dar alan', 'Pas kalitesi'],
    aiFuture: 'Mallorca ile sözleşmesi sürerken MLS veya Suudi Ligi\'nden teklifler bekleniyor. 33–34 yaşına kadar üst düzey oynayabilir.',
    milestones: [
      { icon: 'ti-transfer-in', bg: '#FCEBEB', ic: '#791F1F', title: 'Fenerbahçe transferi (2019)', desc: 'Kosova futbolunun o dönemin en pahalı transferi.' },
      { icon: 'ti-ball-football', bg: '#FAEEDA', ic: '#633806', title: 'Mallorca\'da 24 gol (2023–24)', desc: 'La Liga\'da küçük takım stereotipini yırttı.' },
      { icon: 'ti-flag', bg: '#E6F1FB', ic: '#0C447C', title: 'Kosovo MT rekor golcüsü', desc: 'Ulusal tarihin tüm zamanlar gol rekorunu kırdı.' }
    ]
  },
  {
    id: 'sidiki', type: 'player',
    name: 'Sidiki Chérif', nickname: 'Le Faucon', nicknameEn: 'The Falcon',
    sub: 'SC Braga · #7', nat: 'Gine', role: 'Sol Kanat / Forvet', league: 'Liga Portugal',
    icon: 'ti-wind',
    bannerColor: '#CC2229', avatarBg: '#ffffff', avatarText: '#CC2229',
    fanScore: 7.8, overall: 78, marketValue: '€12M',
    stats: [{ l: 'Maç', v: 210 }, { l: 'Gol', v: 68 }, { l: 'Asist', v: 44 }, { l: 'Puan Ort.', v: '7.2' }, { l: 'Yaş', v: 28 }],
    badges: [{ t: 'badge-type', l: 'Oyuncu' }, { t: 'badge-nat', l: '🇬🇳 Gine' }, { t: 'badge-role', l: 'Sol Kanat' }],
    perfs: [
      { label: 'Hız', val: 93, color: '#CC2229' },
      { label: 'Dribling', val: 89, color: '#1D9E75' },
      { label: 'Kanat Oyunu', val: 87, color: '#c9a84c' },
      { label: 'Şut', val: 82, color: '#378ADD' },
      { label: 'Pas', val: 79, color: '#1D9E75' },
      { label: 'Savunma', val: 62, color: '#888780' }
    ],
    trophies: [
      { icon: 'ti-trophy', title: 'Taça de Portugal', club: 'SC Braga', yr: '2024' },
      { icon: 'ti-star', title: 'Liga Portugal Ayın Oyuncusu', club: 'SC Braga', yr: '2024–25' },
      { icon: 'ti-award', title: 'Gine MT Kaptanı', club: 'Gine Millî Takımı', yr: '2024' },
      { icon: 'ti-medal', title: 'AFCON Kadrosu', club: 'Gine Millî Takımı', yr: '2023' }
    ],
    timeline: [
      { yr: '2016', title: 'Conakry FK', desc: 'Gine\'de yetişti; hız ve bireysel becerisiyle erken dikkat çekti.', tag: 'Başlangıç' },
      { yr: '2018', title: 'Fransa Macerası', desc: 'Ligue 2 kulüpleriyle kiralık süreç. Avrupa futboluna ilk adım.', tag: 'Fransa' },
      { yr: '2020', title: 'Gil Vicente', desc: 'Portekiz\'de kanat oyunuyla fark yarattı. Liga Portugal keşfetti.', tag: 'Portekiz' },
      { yr: '2022', title: 'SC Braga', desc: 'Braga\'ya transfer; Avrupa kupaları sahnesine çıktı.', tag: 'Avrupa' },
      { yr: '2024', title: 'Taça de Portugal', desc: 'Kupada 8 maçta 6 golle şampiyona kritik katkı sağladı.', tag: 'Kupa Kahramanı' }
    ],
    chemistry: [
      { initials: 'RH', name: 'Ricardo Horta', pos: 'Sağ Kanat', pct: 90, bg: '#FBEAF0', tc: '#72243E' },
      { initials: 'AR', name: 'Abel Ruiz', pos: 'Santrfor', pct: 87, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'ND', name: 'Naby Diallo (Millî)', pos: 'Orta Saha', pct: 84, bg: '#E1F5EE', tc: '#085041' },
      { initials: 'MK', name: 'Mohamed Camara (Millî)', pos: 'Defansif OS', pct: 81, bg: '#FAEEDA', tc: '#633806' }
    ],
    aiStrong: 'Portekiz\'in en hızlı kanatlarından biri. Dribling\'de rakip defansları tek başına çözüyor. Dar zamanda üretkenlik kapasitesi Braga\'nın hücum gücünün temelidir.',
    aiStrong_chips: ['Sürat', 'Dribling', 'Kanat açılımı', '1v1'],
    aiWeak: 'Son pas kararlarında tutarsızlık. Defansif görevleri ihmal ediyor. Büyük kulüp tecrübesi henüz sınırlı.',
    aiWeak_chips: ['Son pas', 'Defans katkısı', 'Büyük maç'],
    aiFuture: 'Premier Lig veya La Liga\'dan büyük transfer teklifi kaçınılmaz. 28 yaşında kariyer zirvesine yaklaşıyor.',
    milestones: [
      { icon: 'ti-plane', bg: '#E6F1FB', ic: '#0C447C', title: 'Portekiz\'e adım (2020)', desc: 'Gil Vicente ile kariyer dönüm noktası.' },
      { icon: 'ti-trophy', bg: '#FAEEDA', ic: '#633806', title: 'Taça de Portugal (2024)', desc: '6 golle kupanın kahramanı oldu.' },
      { icon: 'ti-flag', bg: '#E1F5EE', ic: '#085041', title: 'Gine MT Kaptanlığı (2024)', desc: 'Ülkesinin yeni yıldızı ve lideri.' }
    ]
  },
  {
    id: 'ederson', type: 'player',
    name: 'Ederson', nickname: 'O Guardião', nicknameEn: 'The Guardian',
    sub: 'Manchester City · #31', nat: 'Brezilya', role: 'Kaleci', league: 'Premier Lig',
    icon: 'ti-shield',
    bannerColor: '#6CABDD', avatarBg: '#6CABDD', avatarText: '#1C2C5B',
    fanScore: 9.1, overall: 91, marketValue: '€45M',
    stats: [{ l: 'Maç', v: 352 }, { l: 'Temiz Kale', v: 142 }, { l: 'Kurtarış%', v: '72%' }, { l: 'Puan Ort.', v: '7.8' }, { l: 'Yaş', v: 31 }],
    badges: [{ t: 'badge-type', l: 'Oyuncu' }, { t: 'badge-nat', l: '🇧🇷 Brezilya' }, { t: 'badge-role', l: 'Kaleci' }],
    perfs: [
      { label: 'Pas (GK)', val: 93, color: '#1C2C5B' },
      { label: 'Pozisyon', val: 91, color: '#6CABDD' },
      { label: 'Refleks', val: 90, color: '#6CABDD' },
      { label: 'Kurtarış', val: 89, color: '#378ADD' },
      { label: 'Komuta', val: 88, color: '#c9a84c' },
      { label: 'Top Ayağı', val: 87, color: '#1D9E75' }
    ],
    trophies: [
      { icon: 'ti-trophy', title: 'Premier Lig x5', club: 'Manchester City', yr: '2018–2024' },
      { icon: 'ti-medal', title: 'Şampiyonlar Ligi', club: 'Manchester City', yr: '2023' },
      { icon: 'ti-star', title: 'Copa América', club: 'Brezilya Millî Takımı', yr: '2019' },
      { icon: 'ti-award', title: 'PL En İyi Kaleci', club: 'Premier Lig', yr: '2023–24' }
    ],
    timeline: [
      { yr: '2009', title: 'São Paulo Altyapısı', desc: 'Brezilya\'nın en prestijli akademilerinden birinde yetişti.', tag: 'Başlangıç' },
      { yr: '2012', title: 'Ribeirão (Kiralık)', desc: 'Portekiz liginde deneyim kazandı. Avrupa futboluna uyum.', tag: 'Portekiz' },
      { yr: '2015', title: 'Benfica', desc: 'Avrupa\'nın dikkatini çekti. UCL\'de muhteşem performanslar.', tag: 'Avrupa' },
      { yr: '2017', title: 'Manchester City', desc: 'Guardiola\'nın ilk tercihi. £35M bonservis dönemin rekoru.', tag: 'Premier Lig' },
      { yr: '2019', title: 'Copa América', desc: 'Brezilya\'nın şampiyonluğunda kilit katkı.', tag: 'Millî Şampiyonluk' },
      { yr: '2023', title: 'UCL Şampiyonu', desc: 'Treble sezonunda Inter\'e karşı final. City tarihe geçti.', tag: 'Efsane' }
    ],
    chemistry: [
      { initials: 'RD', name: 'Rúben Dias', pos: 'Stoper', pct: 96, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'KW', name: 'Kyle Walker', pos: 'Sağ Bek', pct: 93, bg: '#FAEEDA', tc: '#633806' },
      { initials: 'MA', name: 'Manuel Akanji', pos: 'Stoper', pct: 90, bg: '#E1F5EE', tc: '#085041' },
      { initials: 'PF', name: 'Phil Foden', pos: 'Orta Saha', pct: 83, bg: '#FBEAF0', tc: '#72243E' }
    ],
    aiStrong: 'Modern futbolun en iyi sweeper-keeper\'larından biri. Ayakla pas kurma yeteneği tam bir defansif forvet gibi etkili. 142 temiz kale ile Premier Lig tarihinin en verimli kalecirlserinden biri.',
    aiStrong_chips: ['Ayak kullanımı', 'Temiz kale', 'Sweeper-keeper', 'Komuta'],
    aiWeak: 'Reflekse dayalı anlık kurtarışlarda konumlanmayı tercih ediyor. 31 yaşında patlayıcı tepki biraz düşüyor. Uzak köşe şutlarında bazen geç kalıyor.',
    aiWeak_chips: ['Patlayıcı refleks', 'Uzak köşe'],
    aiFuture: '1–2 sezon daha City\'de. Ardından MLS ya da Suudi Ligi\'nde kariyerini tamamlayabilir. Antrenörlük kapasitesi yüksek.',
    milestones: [
      { icon: 'ti-transfer-in', bg: '#E6F1FB', ic: '#0C447C', title: 'Manchester City transferi (2017)', desc: '£35M ile dönemin en pahalı kaleci transferi.' },
      { icon: 'ti-trophy', bg: '#FAEEDA', ic: '#633806', title: 'Premier Lig 5. şampiyonluk (2023–24)', desc: 'Ligin en çok şampiyon olan kalecisi oldu.' },
      { icon: 'ti-crown', bg: '#EEEDFE', ic: '#3C3489', title: 'UCL Şampiyonu (2023)', desc: 'Treble sezonunda Avrupa zirvesi.' }
    ]
  },
  {
    id: 'caglar', type: 'player',
    name: 'Çağlar Söyüncü', nickname: 'Duvar', nicknameEn: 'The Wall',
    sub: 'Fenerbahçe · #4', nat: 'Türkiye', role: 'Stoper', league: 'Süper Lig',
    icon: 'ti-wall',
    bannerColor: '#003DA5', avatarBg: '#003DA5', avatarText: '#FFD700',
    fanScore: 8.3, overall: 83, marketValue: '€18M',
    stats: [{ l: 'Maç', v: 252 }, { l: 'Gol', v: 14 }, { l: 'Asist', v: 7 }, { l: 'Puan Ort.', v: '7.3' }, { l: 'Yaş', v: 29 }],
    badges: [{ t: 'badge-type', l: 'Oyuncu' }, { t: 'badge-nat', l: '🇹🇷 Türkiye' }, { t: 'badge-role', l: 'Stoper' }],
    perfs: [
      { label: 'Hava Topu', val: 91, color: '#003DA5' },
      { label: 'Müdahale', val: 89, color: '#003DA5' },
      { label: 'Top Kesme', val: 87, color: '#c9a84c' },
      { label: 'Hız', val: 84, color: '#1D9E75' },
      { label: 'Liderlik', val: 85, color: '#c9a84c' },
      { label: 'Top Oyunu', val: 78, color: '#888780' }
    ],
    trophies: [
      { icon: 'ti-trophy', title: 'FA Cup', club: 'Leicester City', yr: '2021' },
      { icon: 'ti-star', title: 'EURO 2024 Çeyrek Final', club: 'Türkiye Millî Takımı', yr: '2024' },
      { icon: 'ti-medal', title: 'Premier Lig Yılın Stoperiı', club: 'Premier Lig', yr: '2019–20' },
      { icon: 'ti-award', title: 'Türkiye MT Kaptanı', club: 'Türkiye Millî Takımı', yr: '2023' }
    ],
    timeline: [
      { yr: '2014', title: 'Altınordu', desc: 'İzmir\'in yetiştirdiği kaya. Türk futbolunun parlayan yeni stoperi.', tag: 'Başlangıç' },
      { yr: '2016', title: 'Freiburg (Bundesliga)', desc: 'Almanya\'da sertlik ve zekayla öne çıktı. Bundesliga ona okul oldu.', tag: 'Bundesliga' },
      { yr: '2019', title: 'Leicester City', desc: '£21M bonservis. Premier Lig\'de milli takımın kalkan stoperi oldu.', tag: 'Premier Lig' },
      { yr: '2021', title: 'FA Cup Şampiyonu', desc: 'Leicester tarihî kupayı kazandı. Söyüncü savunmanın kilit taşıydı.', tag: 'Şampiyonluk' },
      { yr: '2024', title: 'Atletico Madrid (Kiralık)', desc: 'La Liga\'da kısa ama güçlü deneyim. Simeone sistemine uyum.', tag: 'La Liga' },
      { yr: '2025', title: 'Fenerbahçe', desc: 'Türk futboluna döndü. Süper Lig\'de şampiyonluk ve Avrupa hedefi.', tag: 'Eve Dönüş' }
    ],
    chemistry: [
      { initials: 'HC', name: 'Hakan Çalhanoğlu', pos: 'Orta Saha (MT)', pct: 93, bg: '#FAEEDA', tc: '#633806' },
      { initials: 'MM', name: 'Mert Müldür (MT)', pos: 'Sağ Bek', pct: 89, bg: '#E1F5EE', tc: '#085041' },
      { initials: 'WF', name: 'Wout Faes (Leicester)', pos: 'Stoper', pct: 86, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'AO', name: 'Abdülkadir Ömür (MT)', pos: 'Orta Saha', pct: 80, bg: '#FBEAF0', tc: '#72243E' }
    ],
    aiStrong: 'Sert ve direkt müdahale tarzıyla Premier Lig\'de zirveye çıktığında Avrupa\'nın en iyi stoperlerinden biri sayıldı. Hız ve hava topu kombinasyonu rakip forveti bunaltıyor. EURO 2024\'te Türkiye savunmasının kilit taşıydı.',
    aiStrong_chips: ['Hava topu', 'Sert müdahale', 'Hız', 'Savunma liderliği'],
    aiWeak: 'Sakatlık geçmişi kariyer sürekliliğini sekteye uğrattı. Top kontrolünde kritik anlarda hatalar çıkabiliyor.',
    aiWeak_chips: ['Sakatlık', 'Top kontrolü', 'Süreklilik'],
    aiFuture: '29 yaşında Fenerbahçe ile şampiyonluk ve UCL hedefi. Sonrasında 1–2 sezon orta kademe Avrupa ligi planlanabilir.',
    milestones: [
      { icon: 'ti-transfer-in', bg: '#E6F1FB', ic: '#0C447C', title: 'Leicester City transferi (2019)', desc: '£21M — Türk stoper tarihinin en büyük transferlerinden biri.' },
      { icon: 'ti-trophy', bg: '#FAEEDA', ic: '#633806', title: 'FA Cup (2021)', desc: 'Leicester\'ın tarihî şampiyonluğunda savunmanın direği.' },
      { icon: 'ti-flag', bg: '#E1F5EE', ic: '#085041', title: 'EURO 2024', desc: 'Türkiye\'yi çeyrek finale taşıyan savunma duvarı.' }
    ]
  },
  {
    id: 'mert', type: 'player',
    name: 'Mert Müldür', nickname: 'Il Freccia', nicknameEn: 'The Arrow',
    sub: 'Atalanta BC · #2', nat: 'Türkiye', role: 'Sağ Bek / Sağ Kanat Bek', league: 'Serie A',
    icon: 'ti-arrow-right',
    bannerColor: '#1B3F8C', avatarBg: '#1B3F8C', avatarText: '#ffffff',
    fanScore: 7.9, overall: 80, marketValue: '€22M',
    stats: [{ l: 'Maç', v: 178 }, { l: 'Gol', v: 9 }, { l: 'Asist', v: 31 }, { l: 'Puan Ort.', v: '7.1' }, { l: 'Yaş', v: 26 }],
    badges: [{ t: 'badge-type', l: 'Oyuncu' }, { t: 'badge-nat', l: '🇹🇷 Türkiye' }, { t: 'badge-role', l: 'Sağ Bek' }],
    perfs: [
      { label: 'Hız', val: 90, color: '#1B3F8C' },
      { label: 'Kanat Katkısı', val: 87, color: '#1D9E75' },
      { label: 'Dribling', val: 83, color: '#378ADD' },
      { label: 'Savunma', val: 82, color: '#c9a84c' },
      { label: 'Pas', val: 79, color: '#1D9E75' },
      { label: 'Fizik', val: 77, color: '#888780' }
    ],
    trophies: [
      { icon: 'ti-trophy', title: 'Serie A 4. liği', club: 'Sassuolo', yr: '2021–22' },
      { icon: 'ti-star', title: 'EURO 2024 Kadrosu', club: 'Türkiye Millî Takımı', yr: '2024' },
      { icon: 'ti-medal', title: 'Serie A En İyi Genç Sağ Bek', club: 'Atalanta BC', yr: '2024–25' },
      { icon: 'ti-award', title: 'Türkiye MT Asist Rekoru (Bek)', club: 'Türkiye Millî Takımı', yr: '2024' }
    ],
    timeline: [
      { yr: '2016', title: 'Bursaspor Altyapısı', desc: 'Türkiye\'de büyüdü. Hız ve agresif kanat oyunuyla göz doldurdu.', tag: 'Başlangıç' },
      { yr: '2019', title: 'Sassuolo', desc: 'Serie A\'ya geçiş. İtalyan futbolunun sert sınavını geçti.', tag: 'İtalya' },
      { yr: '2021', title: 'Millî Takım Kıdemlisi', desc: 'Düzenli milli takım oyuncusu. Sağ kanat bek pozisyonunu kilitledi.', tag: 'Millî Takım' },
      { yr: '2023', title: 'Serie A\'da Olgunlaşma', desc: 'İtalya\'nın en hızlı sağ beklerinden biri konumuna yükseldi.', tag: 'Büyüme' },
      { yr: '2024', title: 'Atalanta BC', desc: 'Sassuolo\'dan Atalanta\'ya. Avrupa kupalarında boy gösterdi.', tag: 'Avrupa Adımı' }
    ],
    chemistry: [
      { initials: 'CS', name: 'Çağlar Söyüncü (MT)', pos: 'Stoper', pct: 89, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'HC', name: 'Hakan Çalhanoğlu (MT)', pos: 'Orta Saha', pct: 85, bg: '#FAEEDA', tc: '#633806' },
      { initials: 'GG', name: 'Gianluca Gaetano', pos: 'Orta Saha', pct: 82, bg: '#FBEAF0', tc: '#72243E' },
      { initials: 'TK', name: 'Teun Koopmeiners', pos: 'Orta Saha', pct: 80, bg: '#E1F5EE', tc: '#085041' }
    ],
    aiStrong: 'Sürat ve kanat açılım kapasitesiyle Serie A\'nın en agresif sağ bek-kanat melezi. Atalanta\'nın 3-4-3 sisteminde hem savunma hem hücumda çift yönlü kritik dişli.',
    aiStrong_chips: ['Sürat', 'Kanat katkısı', 'Çift yönlü katkı', 'Agresif baskı'],
    aiWeak: 'Savunma pozisyonunda bazı boşluklar bırakabiliyor. Hava topunda boy dezavantajı var. Büyük maç deneyimi olgunlaşmaya devam ediyor.',
    aiWeak_chips: ['Hava topu', 'Savunma güvenilirliği', 'Büyük maç'],
    aiFuture: '26 yaşında kariyerinin en kritik döneminde. 2–3 sezon içinde top 5 Avrupa kulübünden büyük teklif gelebilir.',
    milestones: [
      { icon: 'ti-plane', bg: '#FAEEDA', ic: '#633806', title: 'Sassuolo\'ya transfer (2019)', desc: 'Serie A macerasının başlangıcı. İtalya ona yaraştı.' },
      { icon: 'ti-flag', bg: '#E6F1FB', ic: '#0C447C', title: 'EURO 2024 kadrosu', desc: 'Türkiye milli takımının vazgeçilmez sağ beği.' },
      { icon: 'ti-rocket', bg: '#E1F5EE', ic: '#085041', title: 'Atalanta transferi (2024)', desc: 'Avrupa kupaları sahnesine büyük adım.' }
    ]
  },
  {
    id: 'zidane', type: 'player',
    name: 'Zinedine Zidane', nickname: 'Zizou', nicknameEn: 'The Magician',
    sub: 'Real Madrid · #5 (Efsane)', nat: 'Fransa', role: 'Oyun Kurucu / Orta Saha', league: 'La Liga',
    icon: 'ti-crown',
    bannerColor: '#003087', avatarBg: '#003087', avatarText: '#ffffff',
    fanScore: 9.8, overall: 98, marketValue: 'Efsane',
    stats: [{ l: 'Maç', v: 489 }, { l: 'Gol', v: 95 }, { l: 'Asist', v: 92 }, { l: 'Puan Ort.', v: '9.4' }, { l: 'Dünya Kupası', v: '1998' }],
    badges: [{ t: 'badge-type', l: 'Oyuncu' }, { t: 'badge-nat', l: '🇫🇷 Fransa' }, { t: 'badge-role', l: 'Oyun Kurucu' }],
    perfs: [
      { label: 'Teknik', val: 99, color: '#003087' },
      { label: 'Vizyon', val: 97, color: '#1D9E75' },
      { label: 'Denge', val: 96, color: '#c9a84c' },
      { label: 'Pas', val: 94, color: '#378ADD' },
      { label: 'Liderlik', val: 95, color: '#c9a84c' },
      { label: 'Şut', val: 88, color: '#888780' }
    ],
    trophies: [
      { icon: 'ti-world', title: 'FIFA Dünya Kupası', club: 'Fransa Millî Takımı', yr: '1998' },
      { icon: 'ti-star', title: 'UEFA Avrupa Şampiyonası', club: 'Fransa Millî Takımı', yr: '2000' },
      { icon: 'ti-trophy', title: 'UEFA Şampiyonlar Ligi', club: 'Real Madrid', yr: '2002' },
      { icon: 'ti-medal', title: 'Ballon d\'Or', club: 'FIFA', yr: '1998' },
      { icon: 'ti-award', title: 'La Liga (2x)', club: 'Real Madrid', yr: '2001–03' },
      { icon: 'ti-trophy', title: 'Serie A (2x)', club: 'Juventus', yr: '1997–98' }
    ],
    timeline: [
      { yr: '1989', title: 'Cannes Altyapısı', desc: 'Marsilya\'nın varoşlarından futbol rüyası. Cannes akademisinin erken parlayan yıldızı.', tag: 'İlk Adım' },
      { yr: '1992', title: 'Girondins de Bordeaux', desc: 'Ligue 1\'de ilk büyük sıçrama. Fransız futboluna damgasını vurdu.', tag: 'Yükseliş' },
      { yr: '1996', title: 'Juventus Transferi', desc: '23M € ile Serie A\'ya geçiş. İtalya\'nın en iyileriyle rekabet etti.', tag: 'İtalya' },
      { yr: '1998', title: 'Dünya Kupası Efsanesi', desc: 'Finale 2 kafa golü. Fransa\'yı ilk kez şampiyona taşıdı. Ballon d\'Or kazandı.', tag: 'Dünya Şampiyonu' },
      { yr: '2001', title: 'Real Madrid Transferi', desc: '73.5M € — dönemin rekor bonservisi. Galaktikolar\'ın kalbi.', tag: 'Tarihi Transfer' },
      { yr: '2002', title: 'UCL Volley Golü', desc: 'Leverkusen\'e karşı yarı volley — tüm zamanların en güzel golü.', tag: 'Şampiyonlar Ligi' },
      { yr: '2006', title: 'Son Dans', desc: 'İtalya finalinde Materazzi\'ye kafa darbesi. Kırmızı kartla kapanan efsanevi kariyer.', tag: 'Veda' }
    ],
    chemistry: [
      { initials: 'RC', name: 'Roberto Carlos', pos: 'Sol Bek', pct: 97, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'LF', name: 'Luis Figo', pos: 'Sağ Kanat', pct: 95, bg: '#FAEEDA', tc: '#633806' },
      { initials: 'TH', name: 'Thierry Henry', pos: 'Forvet (Millî)', pct: 96, bg: '#E1F5EE', tc: '#085041' },
      { initials: 'LT', name: 'Lilian Thuram', pos: 'Sağ Bek (Millî)', pct: 92, bg: '#FBEAF0', tc: '#72243E' }
    ],
    aiStrong: 'Tüm zamanların en büyük oyun kurucularından biri. Dar alanda topla denge ve kontrol eşsiz. Sol ayak roulette tekniği futbolun DNA\'sına işledi. Büyük sahnelerde soğukkanlılık rakipsiz.',
    aiStrong_chips: ['Teknik', 'Top kontrolü', 'Oyun okuma', 'Büyük maç oyuncusu'],
    aiWeak: 'Temperament sorunu: baskı altında patlama riski. Defansif katkı minimum. Sprint hızı elit standartta değil.',
    aiWeak_chips: ['Temperament', 'Defans katkısı', 'Hız'],
    aiFuture: 'Teknik direktörlükte 3 Şampiyonlar Ligi kazandı (Real Madrid). Futbol tarihinin en eksiksiz kariyerlerinden birini tamamladı.',
    milestones: [
      { icon: 'ti-world', bg: '#FAEEDA', ic: '#633806', title: 'Dünya Kupası (1998)', desc: 'Finale 2 kafa golü ile Fransa\'yı ilk kez şampiyona taşıdı.' },
      { icon: 'ti-transfer-in', bg: '#E6F1FB', ic: '#0C447C', title: 'Real Madrid transferi (2001)', desc: '73.5M € — futbol tarihinin o dönemki rekor bonservisi.' },
      { icon: 'ti-ball-football', bg: '#E1F5EE', ic: '#085041', title: 'UCL Volley Golü (2002)', desc: 'Tüm zamanların en güzel golü olarak tarihe geçti.' },
      { icon: 'ti-flag', bg: '#FCEBEB', ic: '#791F1F', title: 'Kafa darbesiyle veda (2006)', desc: 'Final\'de kırmızı kartla kapanan unutulmaz kariyer sonu.' }
    ]
  }
];

export const COACHES = [
  {
    id: 'mourinho', type: 'coach',
    name: 'José Mourinho', nickname: 'The Special One', nicknameEn: 'The Special One',
    sub: 'S.L. Benfica · Teknik Direktör', nat: 'Portekiz', role: 'Teknik Direktör', league: 'Liga Portugal',
    icon: 'ti-crown',
    bannerColor: '#cc0000', avatarBg: '#cc0000', avatarText: '#ffffff',
    fanScore: 8.9, overall: 94, marketValue: '—',
    stats: [{ l: 'Maç', v: 1108 }, { l: 'Galibiyet', v: 684 }, { l: 'Kupa', v: 26 }, { l: 'Galibiyet%', v: '62%' }, { l: 'Yaş', v: 62 }],
    badges: [{ t: 'badge-type', l: 'Teknik Direktör' }, { t: 'badge-nat', l: '🇵🇹 Portekiz' }, { t: 'badge-role', l: 'Savunma Odaklı' }],
    perfs: [
      { label: 'Taktik', val: 97, color: '#cc0000' },
      { label: 'Motivasyon', val: 96, color: '#c9a84c' },
      { label: 'Büyük Maç', val: 98, color: '#1D9E75' },
      { label: 'Kadro Yönt.', val: 88, color: '#378ADD' },
      { label: 'Basın İlt.', val: 91, color: '#c9a84c' },
      { label: 'Oyuncu Gel.', val: 72, color: '#888780' }
    ],
    trophies: [
      { icon: 'ti-trophy', title: 'Şampiyonlar Ligi x2', club: 'Porto & Inter Milan', yr: '2004, 2010' },
      { icon: 'ti-medal', title: 'Premier Lig x3', club: 'Chelsea & Man United', yr: '2005, 2006, 2013' },
      { icon: 'ti-award', title: 'Serie A x2', club: 'Inter Milan', yr: '2009, 2010' },
      { icon: 'ti-star', title: 'Conference League', club: 'AS Roma', yr: '2022' },
      { icon: 'ti-flag', title: 'Portekiz Ligi', club: 'FC Porto', yr: '2003, 2004' }
    ],
    timeline: [
      { yr: '2002', title: 'FC Porto – UCL Efsanesi', desc: 'Porto\'yu Avrupa zirvesine taşıdı.', tag: 'İlk Mucize' },
      { yr: '2004', title: 'Chelsea – "The Special One"', desc: 'Stamford Bridge\'de tarihi basın toplantısı. İki lig şampiyonluğu.', tag: 'The Special One' },
      { yr: '2010', title: 'Inter Milan – Treble', desc: 'Tarihin en büyük treble\'ını yaptı.', tag: 'Tarihi Treble' },
      { yr: '2013', title: 'Real Madrid', desc: 'La Liga rekoru: 100 puan.', tag: 'Rekortmen' },
      { yr: '2022', title: 'AS Roma – Conference League', desc: 'Roma\'yı Avrupa kupasına kavuşturdu.', tag: 'Roma' },
      { yr: '2025', title: 'S.L. Benfica', desc: 'Evine döndü. Lizbon\'da şampiyonluk peşinde.', tag: 'Eve Dönüş' }
    ],
    chemistry: [
      { initials: 'AO', name: 'Orkun Kökçü', pos: 'Orta Saha', pct: 88, bg: '#FAEEDA', tc: '#633806' },
      { initials: 'VP', name: 'Vangelis Pavlidis', pos: 'Forvet', pct: 85, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'NO', name: 'Nicolás Otamendi', pos: 'Stoper', pct: 82, bg: '#E1F5EE', tc: '#085041' },
      { initials: 'FA', name: 'Fredrik Aursnes', pos: 'Orta Saha', pct: 79, bg: '#EEEDFE', tc: '#3C3489' }
    ],
    formations: [{ name: '4-2-3-1', sub: 'Birincil' }, { name: '4-4-2', sub: 'Kontra atak' }, { name: '5-3-2', sub: 'Savunma bloku' }],
    aiStrong: 'Büyük maçlarda taktiksel üstünlük kurma kabiliyeti 25 yıldır eşsiz. Psikolojik baskı yönetimi hâlâ zirvede.',
    aiStrong_chips: ['Büyük maç', 'Psikoloji', 'Savunma', 'Karizmatik liderlik'],
    aiWeak: 'Uzun vadeli kadro geliştirme tutarsız. Yönetimle gergin ilişkiler bir süre sonra patlıyor.',
    aiWeak_chips: ['Genç oyuncu', 'Yönetim ilişkisi'],
    aiFuture: 'Benfica ile Portekiz şampiyonluğu ve UCL yolculuğu gündemde. Kariyerini doğduğu ülkede bir kupa ile taçlandırmak istiyor.',
    milestones: [
      { icon: 'ti-trophy', bg: '#FAEEDA', ic: '#633806', title: 'Inter treble\'ı (2010)', desc: 'UCL, Serie A ve Coppa Italia. Tarihte nadiren tekrar edilen başarı.' },
      { icon: 'ti-microphone', bg: '#E6F1FB', ic: '#0C447C', title: '"The Special One" (2004)', desc: 'Modern futbolun en ikonik basın toplantısı.' },
      { icon: 'ti-flag', bg: '#FCEBEB', ic: '#791F1F', title: 'Benfica dönemi (2025)', desc: 'Eve döndü. Portekiz\'de şampiyonluk peşinde.' }
    ]
  },
  {
    id: 'ancelotti', type: 'coach',
    name: 'Carlo Ancelotti', nickname: 'Il Signore', nicknameEn: 'The Gentleman',
    sub: 'Brezilya Milli Takımı · Teknik Direktör', nat: 'İtalya', role: 'Teknik Direktör', league: 'La Liga',
    icon: 'ti-diamond',
    bannerColor: '#009c3b', avatarBg: '#009c3b', avatarText: '#ffdf00',
    fanScore: 9.5, overall: 97, marketValue: '—',
    stats: [{ l: 'Maç', v: 1152 }, { l: 'Galibiyet', v: 706 }, { l: 'UCL', v: 5 }, { l: 'Galibiyet%', v: '61%' }, { l: 'Yaş', v: 65 }],
    badges: [{ t: 'badge-type', l: 'Teknik Direktör' }, { t: 'badge-nat', l: '🇮🇹 İtalya' }, { t: 'badge-role', l: 'Oyuncu Odaklı' }],
    perfs: [
      { label: 'Kadro Yönt.', val: 99, color: '#009c3b' },
      { label: 'UCL Deneyimi', val: 99, color: '#1D9E75' },
      { label: 'Oyuncu Gel.', val: 95, color: '#185FA5' },
      { label: 'Uyum', val: 96, color: '#c9a84c' },
      { label: 'Taktik', val: 90, color: '#993556' },
      { label: 'Motivasyon', val: 93, color: '#c9a84c' }
    ],
    trophies: [
      { icon: 'ti-trophy', title: 'Şampiyonlar Ligi x5', club: 'Milan & Real Madrid', yr: '2003,14,22,24,25' },
      { icon: 'ti-medal', title: 'La Liga x3', club: 'Real Madrid', yr: '2022, 2024, 2025' },
      { icon: 'ti-award', title: 'Serie A', club: 'AC Milan', yr: '2004' },
      { icon: 'ti-crown', title: 'En Çok UCL Kazanan Teknik Direktör', club: 'Tarihte 1. sıra', yr: '2024' },
      { icon: 'ti-star', title: 'Premier Lig', club: 'Chelsea', yr: '2010' }
    ],
    timeline: [
      { yr: '2001', title: 'Juventus & AC Milan', desc: 'Serie A\'da 8 yıl efsane yarattı.', tag: 'İtalya' },
      { yr: '2005', title: 'İstanbul Gecesi', desc: 'Tarihin en büyük geri dönüşünü yaşadı, kaybeden tarafta.', tag: 'Tarihi Gece' },
      { yr: '2014', title: 'Real Madrid – La Decima', desc: '12 yıllık hasretin ardından 10. UCL.', tag: 'La Decima' },
      { yr: '2021', title: 'Efsane Dönüş', desc: '"Bitti" denirken Bernabéu\'ya döndü.', tag: 'Dönüş' },
      { yr: '2024', title: 'UCL 5. Kez', desc: 'Tarihte en çok UCL kazanan teknik direktör.', tag: 'Rekortmen' },
      { yr: '2025', title: 'Brezilya Milli Takımı', desc: 'Seleção\'nun başına geçti. Dünya Kupası hedefi.', tag: 'Seleção' }
    ],
    chemistry: [
      { initials: 'VM', name: 'Vinicius Jr.', pos: 'Kanat', pct: 97, bg: '#FAEEDA', tc: '#633806' },
      { initials: 'RO', name: 'Rodrygo', pos: 'Kanat', pct: 93, bg: '#E6F1FB', tc: '#0C447C' },
      { initials: 'EN', name: 'Endrick', pos: 'Forvet', pct: 89, bg: '#E1F5EE', tc: '#085041' },
      { initials: 'RV', name: 'Raphaël Veiga', pos: 'Orta Saha', pct: 84, bg: '#EEEDFE', tc: '#3C3489' }
    ],
    formations: [{ name: '4-3-3', sub: 'Standart' }, { name: '4-2-3-1', sub: 'Büyük maç' }, { name: '4-4-2', sub: 'Savunma' }],
    aiStrong: 'Yıldız yönetimindeki empati eşsiz. UCL deneyimi 25 yılda birikmiş. Oyuncuların en iyi versiyonunu çıkarıyor.',
    aiStrong_chips: ['Yıldız yönetimi', 'UCL', 'Oyuncu empati', 'Adaptasyon'],
    aiWeak: 'Pressing odaklı takımlara karşı savunmada sorunlar. Uzun vadeli taktik esnekliği tartışma konusu.',
    aiWeak_chips: ['Pressing savunması', 'Taktik esneklik'],
    aiFuture: 'Brezilya Dünya Kupası 2026 ile kariyerini taçlandırma ihtimali yüksek. Futbol tarihinin en büyük koçu unvanını pekiştirebilir.',
    milestones: [
      { icon: 'ti-trophy', bg: '#FAEEDA', ic: '#633806', title: 'La Decima (2014)', desc: 'Real Madrid\'e 12 yıllık hasreti bitirdi.' },
      { icon: 'ti-crown', bg: '#E1F5EE', ic: '#085041', title: '5. UCL (2025)', desc: 'Tarihte ilk kez 5 kez Şampiyonlar Ligi kazanan teknik direktör.' },
      { icon: 'ti-flag', bg: '#E6F1FB', ic: '#0C447C', title: 'Seleção görevi (2025)', desc: 'Dünya Kupası 2026 için Brezilya\'nın başında.' }
    ]
  }
];
