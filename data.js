export const PLAYERS = [
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
      { label: 'Teknik', val: 99, color: '#F5C518' },
      { label: 'Vizyon', val: 97, color: '#F5C518' },
      { label: 'Denge', val: 96, color: '#F5C518' },
      { label: 'Pas', val: 94, color: '#F5C518' },
      { label: 'Liderlik', val: 95, color: '#F5C518' },
      { label: 'Şut', val: 88, color: '#ffffff' }
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
      { initials: 'RC', name: 'Roberto Carlos', pos: 'Sol Bek', pct: 97, bg: '#111', tc: '#F5C518' },
      { initials: 'LF', name: 'Luis Figo', pos: 'Sağ Kanat', pct: 95, bg: '#111', tc: '#F5C518' },
      { initials: 'TH', name: 'Thierry Henry', pos: 'Forvet (Millî)', pct: 96, bg: '#111', tc: '#F5C518' },
      { initials: 'LT', name: 'Lilian Thuram', pos: 'Sağ Bek (Millî)', pct: 92, bg: '#111', tc: '#F5C518' }
    ],
    aiStrong: 'Tüm zamanların en büyük oyun kurucularından biri. Dar alanda topla denge ve kontrol eşsiz. Sol ayak roulette tekniği futbolun DNA\'sına işledi. Büyük sahnelerde soğukkanlılık rakipsiz.',
    aiStrong_chips: ['Teknik', 'Top kontrolü', 'Oyun okuma', 'Büyük maç oyuncusu'],
    aiWeak: 'Temperament sorunu: baskı altında patlama riski. Defansif katkı minimum. Sprint hızı elit standartta değil.',
    aiWeak_chips: ['Temperament', 'Defans katkısı', 'Hız'],
    aiFuture: 'Teknik direktörlükte 3 Şampiyonlar Ligi kazandı (Real Madrid). Futbol tarihinin en eksiksiz kariyerlerinden birini tamamladı.',
    milestones: [
      { icon: 'ti-world', bg: '#111', ic: '#F5C518', title: 'Dünya Kupası (1998)', desc: 'Finale 2 kafa golü ile Fransa\'yı ilk kez şampiyona taşıdı.' },
      { icon: 'ti-transfer-in', bg: '#111', ic: '#F5C518', title: 'Real Madrid transferi (2001)', desc: '73.5M € — futbol tarihinin o dönemki rekor bonservisi.' },
      { icon: 'ti-ball-football', bg: '#111', ic: '#F5C518', title: 'UCL Volley Golü (2002)', desc: 'Tüm zamanların en güzel golü olarak tarihe geçti.' },
      { icon: 'ti-flag', bg: '#111', ic: '#fff', title: 'Kafa darbesiyle veda (2006)', desc: 'Final\'de kırmızı kartla kapanan unutulmaz kariyer sonu.' }
    ],
    seasons: [
      { yr: '1992–93', club: 'Bordeaux',     age: 20, apps: 17, goals: 2,  assists: 1,  rating: 6.8 },
      { yr: '1993–94', club: 'Bordeaux',     age: 21, apps: 26, goals: 6,  assists: 4,  rating: 7.3 },
      { yr: '1994–95', club: 'Bordeaux',     age: 22, apps: 33, goals: 6,  assists: 5,  rating: 7.6 },
      { yr: '1995–96', club: 'Bordeaux',     age: 23, apps: 34, goals: 9,  assists: 6,  rating: 8.1 },
      { yr: '1996–97', club: 'Juventus',     age: 24, apps: 29, goals: 5,  assists: 8,  rating: 8.4 },
      { yr: '1997–98', club: 'Juventus',     age: 25, apps: 32, goals: 4,  assists: 5,  rating: 8.6 },
      { yr: '1998–99', club: 'Juventus',     age: 26, apps: 32, goals: 6,  assists: 7,  rating: 8.5 },
      { yr: '1999–00', club: 'Juventus',     age: 27, apps: 31, goals: 7,  assists: 6,  rating: 8.7 },
      { yr: '2000–01', club: 'Juventus',     age: 28, apps: 33, goals: 8,  assists: 9,  rating: 9.0 },
      { yr: '2001–02', club: 'Real Madrid',  age: 29, apps: 32, goals: 7,  assists: 10, rating: 9.2 },
      { yr: '2002–03', club: 'Real Madrid',  age: 30, apps: 30, goals: 9,  assists: 8,  rating: 9.1 },
      { yr: '2003–04', club: 'Real Madrid',  age: 31, apps: 33, goals: 6,  assists: 5,  rating: 8.3 },
      { yr: '2004–05', club: 'Real Madrid',  age: 32, apps: 20, goals: 3,  assists: 3,  rating: 7.4 },
      { yr: '2005–06', club: 'Real Madrid',  age: 33, apps: 29, goals: 9,  assists: 6,  rating: 8.8 }
    ],
    nationalTeam: {
      caps: 108, goals: 31, assists: 22, debut: '1994', lastMatch: '2006',
      tournaments: [
        { name: 'EURO 1996',       yr: '1996', apps: 5, goals: 0, assists: 1, result: 'Yarı Final' },
        { name: 'FIFA Dünya Kupası', yr: '1998', apps: 7, goals: 3, assists: 2, result: 'ŞAMPİYON', champion: true, award: 'Altın Top' },
        { name: 'EURO 2000',       yr: '2000', apps: 6, goals: 5, assists: 3, result: 'ŞAMPİYON', champion: true },
        { name: 'FIFA Dünya Kupası', yr: '2002', apps: 2, goals: 0, assists: 0, result: 'Grup Aşaması' },
        { name: 'EURO 2004',       yr: '2004', apps: 4, goals: 2, assists: 1, result: 'Çeyrek Final' },
        { name: 'FIFA Dünya Kupası', yr: '2006', apps: 7, goals: 3, assists: 2, result: 'FİNAL', award: 'Altın Top' }
      ],
      bestPerfs: [
        { yr: '1998', title: 'Dünya Kupası Finali — 2 Kafa Golü', desc: 'Brezilya\'ya karşı 3-0\'lık zafer. Fransa tarihinin en büyük geceye imza attı.', tag: 'Efsane Gece' },
        { yr: '2000', title: 'EURO 2000 — Yarı Final Altın Golü', desc: 'Portekiz\'e karşı uzatmada penaltı + golden goal. Türkiye\'ye karşı turnuvadaki zirvesi.', tag: 'Altın Gol' },
        { yr: '2006', title: 'Dünya Kupası — 3 Golle Altın Top', desc: 'Emeklilik sonrası döndüğü son turnuvada Altın Top kazandı. Kafa darbesiyle kapanan final.', tag: 'Son Dans' }
      ]
    }
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
      { label: 'Taktik', val: 97, color: '#F5C518' },
      { label: 'Motivasyon', val: 96, color: '#F5C518' },
      { label: 'Büyük Maç', val: 98, color: '#F5C518' },
      { label: 'Kadro Yönt.', val: 88, color: '#F5C518' },
      { label: 'Basın İlt.', val: 91, color: '#F5C518' },
      { label: 'Oyuncu Gel.', val: 72, color: '#ffffff' }
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
      { initials: 'AO', name: 'Orkun Kökçü', pos: 'Orta Saha', pct: 88, bg: '#111', tc: '#F5C518' },
      { initials: 'VP', name: 'Vangelis Pavlidis', pos: 'Forvet', pct: 85, bg: '#111', tc: '#F5C518' },
      { initials: 'NO', name: 'Nicolás Otamendi', pos: 'Stoper', pct: 82, bg: '#111', tc: '#F5C518' },
      { initials: 'FA', name: 'Fredrik Aursnes', pos: 'Orta Saha', pct: 79, bg: '#111', tc: '#F5C518' }
    ],
    formations: [{ name: '4-2-3-1', sub: 'Birincil' }, { name: '4-4-2', sub: 'Kontra atak' }, { name: '5-3-2', sub: 'Savunma bloku' }],
    aiStrong: 'Büyük maçlarda taktiksel üstünlük kurma kabiliyeti 25 yıldır eşsiz. Psikolojik baskı yönetimi hâlâ zirvede.',
    aiStrong_chips: ['Büyük maç', 'Psikoloji', 'Savunma', 'Karizmatik liderlik'],
    aiWeak: 'Uzun vadeli kadro geliştirme tutarsız. Yönetimle gergin ilişkiler bir süre sonra patlıyor.',
    aiWeak_chips: ['Genç oyuncu', 'Yönetim ilişkisi'],
    aiFuture: 'Benfica ile Portekiz şampiyonluğu ve UCL yolculuğu gündemde. Kariyerini doğduğu ülkede bir kupa ile taçlandırmak istiyor.',
    milestones: [
      { icon: 'ti-trophy', bg: '#111', ic: '#F5C518', title: 'Inter treble\'ı (2010)', desc: 'UCL, Serie A ve Coppa Italia. Tarihte nadiren tekrar edilen başarı.' },
      { icon: 'ti-microphone', bg: '#111', ic: '#F5C518', title: '"The Special One" (2004)', desc: 'Modern futbolun en ikonik basın toplantısı.' },
      { icon: 'ti-flag', bg: '#111', ic: '#fff', title: 'Benfica dönemi (2025)', desc: 'Eve döndü. Portekiz\'de şampiyonluk peşinde.' }
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
      { label: 'Kadro Yönt.', val: 99, color: '#F5C518' },
      { label: 'UCL Deneyimi', val: 99, color: '#F5C518' },
      { label: 'Oyuncu Gel.', val: 95, color: '#F5C518' },
      { label: 'Uyum', val: 96, color: '#F5C518' },
      { label: 'Taktik', val: 90, color: '#F5C518' },
      { label: 'Motivasyon', val: 93, color: '#ffffff' }
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
      { initials: 'VM', name: 'Vinicius Jr.', pos: 'Kanat', pct: 97, bg: '#111', tc: '#F5C518' },
      { initials: 'RO', name: 'Rodrygo', pos: 'Kanat', pct: 93, bg: '#111', tc: '#F5C518' },
      { initials: 'EN', name: 'Endrick', pos: 'Forvet', pct: 89, bg: '#111', tc: '#F5C518' },
      { initials: 'RV', name: 'Raphaël Veiga', pos: 'Orta Saha', pct: 84, bg: '#111', tc: '#F5C518' }
    ],
    formations: [{ name: '4-3-3', sub: 'Standart' }, { name: '4-2-3-1', sub: 'Büyük maç' }, { name: '4-4-2', sub: 'Savunma' }],
    aiStrong: 'Yıldız yönetimindeki empati eşsiz. UCL deneyimi 25 yılda birikmiş. Oyuncuların en iyi versiyonunu çıkarıyor.',
    aiStrong_chips: ['Yıldız yönetimi', 'UCL', 'Oyuncu empati', 'Adaptasyon'],
    aiWeak: 'Pressing odaklı takımlara karşı savunmada sorunlar. Uzun vadeli taktik esnekliği tartışma konusu.',
    aiWeak_chips: ['Pressing savunması', 'Taktik esneklik'],
    aiFuture: 'Brezilya Dünya Kupası 2026 ile kariyerini taçlandırma ihtimali yüksek. Futbol tarihinin en büyük koçu unvanını pekiştirebilir.',
    milestones: [
      { icon: 'ti-trophy', bg: '#111', ic: '#F5C518', title: 'La Decima (2014)', desc: 'Real Madrid\'e 12 yıllık hasreti bitirdi.' },
      { icon: 'ti-crown', bg: '#111', ic: '#F5C518', title: '5. UCL (2025)', desc: 'Tarihte ilk kez 5 kez Şampiyonlar Ligi kazanan teknik direktör.' },
      { icon: 'ti-flag', bg: '#111', ic: '#fff', title: 'Seleção görevi (2025)', desc: 'Dünya Kupası 2026 için Brezilya\'nın başında.' }
    ]
  }
];