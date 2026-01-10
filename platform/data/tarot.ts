/**
 * Tarot Kartları Veri Dosyası
 * 22 Major Arcana kartı - Günlük Fal Sistemi için
 */

export interface TarotCard {
  id: number
  name: string
  nameTr: string
  image: string // /tarot/card-name.png formatında
  meanings: {
    love: string[]      // Aşk
    career: string[]    // Kariyer
    money: string[]     // Para
    health: string[]    // Sağlık
    spirit: string[]    // Ruhsallık
  }
  reverseMeanings: {    // Ters Anlamlar (Kötü Talih/Uyarı)
    love: string
    career: string
    money: string
    health: string
    spirit: string
  }
}

export type FortuneCategory = 'love' | 'career' | 'money' | 'health' | 'spirit'

export const FORTUNE_CATEGORIES: { key: FortuneCategory; label: string; labelTr: string; icon: string; color: string }[] = [
  { key: 'love', label: 'Love', labelTr: 'Aşk', icon: 'heart', color: '#e74c3c' },
  { key: 'career', label: 'Career', labelTr: 'Kariyer', icon: 'briefcase', color: '#3498db' },
  { key: 'money', label: 'Money', labelTr: 'Para', icon: 'coins', color: '#f1c40f' },
  { key: 'health', label: 'Health', labelTr: 'Sağlık', icon: 'activity', color: '#2ecc71' },
  { key: 'spirit', label: 'Spirituality', labelTr: 'Ruhsallık', icon: 'sparkles', color: '#9b59b6' },
]

export const TAROT_CARDS: TarotCard[] = [
  {
    id: 0,
    name: 'The Fool',
    nameTr: 'Deli',
    image: '/tarot/the-fool.png',
    meanings: {
      love: [
        'Yeni bir aşk macerası kapıda! Kalbini yeni deneyimlere aç.',
        'Spontan bir romantik hareket bugün seni şaşırtabilir.',
        'Geçmişi bırak, aşkta yeni sayfa açmanın zamanı geldi.'
      ],
      career: [
        'Cesur bir kariyer adımı atma zamanı. Risk al!',
        'Yeni bir iş fırsatı beklenmedik bir yerden gelebilir.',
        'Yaratıcı fikirlerini paylaşmaktan çekinme, takdir göreceksin.'
      ],
      money: [
        'Finansal bir maceraya hazır ol, ama dikkatli adımlar at.',
        'Yeni bir gelir kaynağı keşfedebilirsin.',
        'Küçük yatırımlar büyük getirilere dönüşebilir.'
      ],
      health: [
        'Yeni bir spor veya aktivite deneme zamanı!',
        'Vücudunu dinle, o sana ne istediğini söylüyor.',
        'Enerji seviyeni yüksek tutacak bir gün seni bekliyor.'
      ],
      spirit: [
        'Ruhsal bir yolculuğun başlangıcındasın.',
        'Meditasyon veya yeni bir manevi pratik dene.',
        'İç sesine kulak ver, o seni doğru yöne yönlendiriyor.'
      ]
    },
    reverseMeanings: {
      love: 'İlişkide fazla saflık veya dikkatsizlik hayal kırıklığı yaratabilir.',
      career: 'Dürtüsel iş kararları riskli sonuçlar doğurabilir, planlı ol.',
      money: 'Gereksiz harcamalar bütçeni sarsabilir, dikkat et.',
      health: 'Kazalara karşı dikkatli ol, ihmalkarlık yapma.',
      spirit: 'Gerçeklerden kaçıyor olabilirsin, yüzleşme zamanı.'
    }
  },
  {
    id: 1,
    name: 'The Magician',
    nameTr: 'Sihirbaz',
    image: '/tarot/the-magician.png',
    meanings: {
      love: [
        'Aşkta büyülü bir gün! İstediğini çekme gücün var.',
        'İlişkinde mucizeler yaratabilirsin, sadece inan.',
        'Çekiciliğin bugün zirve yapıyor.'
      ],
      career: [
        'Tüm yeteneklerin bugün parlıyor. Kendini göster!',
        'Bir projeyi hayata geçirmek için mükemmel zaman.',
        'Liderlik vasıfların ön plana çıkacak.'
      ],
      money: [
        'Finansal hedeflerine ulaşmak için tüm araçlara sahipsin.',
        'Yaratıcı bir iş fikri maddi kazanç getirebilir.',
        'Para akışını yönetme konusunda ustasın bugün.'
      ],
      health: [
        'Zihin-beden bağlantın güçlü. Şifa gücün aktif.',
        'Sağlığını iyileştirmek için gerekli iradeye sahipsin.',
        'Pozitif düşünceler sağlığına olumlu yansıyacak.'
      ],
      spirit: [
        'Evrenle bağlantın güçlü, isteklerini ilet.',
        'Manifestasyon gücün bugün çok yüksek.',
        'Spiritüel yeteneklerin gelişiyor, fark et.'
      ]
    },
    reverseMeanings: {
      love: 'Manipülatif davranışlara veya yanlış yönlendirmelere dikkat et.',
      career: 'Yeteneklerini yanlış kullanıyor olabilirsin, odaklanma sorunu var.',
      money: 'Dolandırıcılık veya yanıltıcı fırsatlara karşı uyanık ol.',
      health: 'Enerjini boşa harcıyorsun, stres kaynaklı sorunlar olabilir.',
      spirit: 'İçsel gücünü bloke ediyorsun, kendine güvenin azalmış.'
    }
  },
  {
    id: 2,
    name: 'The High Priestess',
    nameTr: 'Baş Rahibe',
    image: '/tarot/the-high-priestess.png',
    meanings: {
      love: [
        'Sezgilerin aşkta seni yönlendiriyor, dinle.',
        'Gizli duygular yüzeye çıkmak üzere.',
        'Sabrın aşkta ödüllendirilecek.'
      ],
      career: [
        'İş kararlarında sezgilerine güven.',
        'Gizli bilgiler ortaya çıkabilir, hazırlıklı ol.',
        'Sessiz kalmak bazen en güçlü harekettir.'
      ],
      money: [
        'Finansal sezgilerin keskin, onlara güven.',
        'Gizli bir fırsat kendini gösterecek.',
        'Sabırlı ol, doğru zaman yaklaşıyor.'
      ],
      health: [
        'Bedeninin gizli mesajlarını dinle.',
        'Sezgisel beslenme sana iyi gelecek.',
        'İç huzur sağlığının anahtarı.'
      ],
      spirit: [
        'Derin bir içgörü zamanı, meditasyon yap.',
        'Rüyaların önemli mesajlar taşıyor.',
        'Gizemli bir bilgelik seni bekliyor.'
      ]
    },
    reverseMeanings: {
      love: 'Duygusal kopukluk veya sezgilerini görmezden gelme sorunu var.',
      career: 'Yüzeyde kalıyorsun, derinlemesine analiz yapmıyorsun.',
      money: 'Finansal gerçekleri görmezden gelmek sorun yaratabilir.',
      health: 'Hormonal dengesizlikler veya kadın sağlığı konularına dikkat.',
      spirit: 'İç sesini duyamıyorsun, gürültüden uzaklaş.'
    }
  },
  {
    id: 3,
    name: 'The Empress',
    nameTr: 'İmparatoriçe',
    image: '/tarot/the-empress.png',
    meanings: {
      love: [
        'Aşkta bereket zamanı! Sevgi her yerde.',
        'İlişkinde büyüme ve gelişme var.',
        'Şefkat ve sevgi vererek alacaksın.'
      ],
      career: [
        'Yaratıcı projeler meyve verecek.',
        'İş yerinde uyum ve başarı seni bekliyor.',
        'Doğurganlık enerjisi projelerinde de geçerli.'
      ],
      money: [
        'Bolluk ve bereket kapıda!',
        'Yatırımların meyvesini vermeye başlıyor.',
        'Finansal güvenlik hissi artacak.'
      ],
      health: [
        'Doğanın şifalı enerjisinden faydalan.',
        'Bedenin kendini yeniliyor.',
        'Kadınsı enerji dengende, bunu hisset.'
      ],
      spirit: [
        'Anne Doğa ile bağlantı kur.',
        'Bolluk bilinci seni sarmalıyor.',
        'Yaratıcı enerjin ruhsal gelişimini destekliyor.'
      ]
    },
    reverseMeanings: {
      love: 'Aşırı bağımlılık veya boğucu bir ilgi ilişkileri zorlayabilir.',
      career: 'Yaratıcılık tıkanıklığı yaşıyorsun, ilham eksikliği var.',
      money: 'Maddi güvensizlik hissi veya israf eğilimi.',
      health: 'Kendini ihmal ediyorsun, fiziksel bakımına özen göster.',
      spirit: 'Doğadan kopuksun, topraklanma ihtiyacın var.'
    }
  },
  {
    id: 4,
    name: 'The Emperor',
    nameTr: 'İmparator',
    image: '/tarot/the-emperor.png',
    meanings: {
      love: [
        'İlişkinde güven ve istikrar ön planda.',
        'Güçlü bir bağ kurma veya güçlendirme zamanı.',
        'Koruyucu enerji seni ve sevdiklerini sarıyor.'
      ],
      career: [
        'Liderlik pozisyonu seni bekliyor.',
        'Disiplin ve düzen başarını getirecek.',
        'Otorite figürlerinden destek alabilirsin.'
      ],
      money: [
        'Finansal kontrol ve güç senin elinde.',
        'Yapısal bir yaklaşım zenginlik getirir.',
        'Uzun vadeli planlar şimdi meyve veriyor.'
      ],
      health: [
        'Disiplinli bir sağlık rutini oluştur.',
        'Güç ve dayanıklılık artıyor.',
        'Yapısal egzersizler sana iyi gelecek.'
      ],
      spirit: [
        'Spiritüel disiplin geliştirme zamanı.',
        'İç otoriteni tanı ve güçlendir.',
        'Düzen içinde özgürlük bulacaksın.'
      ]
    },
    reverseMeanings: {
      love: 'Otoriter veya kontrolcü davranışlar ilişkiye zarar verebilir.',
      career: 'Güç savaşları veya katı kurallar ilerlemeni engelliyor.',
      money: 'Maddi konularda esnek olamamak kayıplara yol açabilir.',
      health: 'Katılık ve stres kas gerginliklerine neden olabilir.',
      spirit: 'Maddi dünyaya aşırı odaklanıp ruhsal yanı unutma.'
    }
  },
  {
    id: 5,
    name: 'The Hierophant',
    nameTr: 'Aziz',
    image: '/tarot/the-hierophant.png',
    meanings: {
      love: [
        'Geleneksel değerler ilişkinde önem kazanıyor.',
        'Bir danışman veya akil kişi yol gösterebilir.',
        'Sadakat ve bağlılık ödüllendirilecek.'
      ],
      career: [
        'Bir mentor veya öğretmen hayatına girebilir.',
        'Eğitim veya sertifika fırsatları var.',
        'Kurumsal yapılar içinde ilerleme mümkün.'
      ],
      money: [
        'Geleneksel yatırım yöntemleri güvenli.',
        'Bir uzmanın tavsiyesi değerli olabilir.',
        'Etik finansal kararlar uzun vadede kazandırır.'
      ],
      health: [
        'Geleneksel tedavi yöntemlerini değerlendir.',
        'Bir sağlık uzmanına danış.',
        'Düzenli check-up zamanı gelmiş olabilir.'
      ],
      spirit: [
        'Geleneksel bir spiritüel yol çekici gelebilir.',
        'Bir spiritüel öğretmen arayışındasın.',
        'Toplu ibadet veya meditasyon faydalı olabilir.'
      ]
    },
    reverseMeanings: {
      love: 'Geleneksel kalıplar seni kısıtlıyor, özgürleşme isteği.',
      career: 'Kurallara isyan etme veya yanlış bir mentoru takip etme riski.',
      money: 'Riskli veya gelenek dışı finansal hamleler tehlikeli olabilir.',
      health: 'Yanlış teşhis veya tavsiyelere dikkat et.',
      spirit: 'Dogmatik inançlardan sıyrılıp kendi yolunu çizmelisin.'
    }
  },
  {
    id: 6,
    name: 'The Lovers',
    nameTr: 'Aşıklar',
    image: '/tarot/the-lovers.png',
    meanings: {
      love: [
        'Derin bir bağ kurma veya güçlendirme zamanı!',
        'Ruh eşi enerjisi yoğun, gözlerini aç.',
        'Aşkta önemli bir karar anı yaklaşıyor.'
      ],
      career: [
        'İş ortaklıkları uyumlu ve verimli.',
        'Tutkunu takip et, kariyer seçiminde.',
        'Değerlerinle uyumlu bir yol seç.'
      ],
      money: [
        'Finansal kararlar partnerin ile uyumlu olmalı.',
        'Sevdiğin işten para kazanma fırsatı.',
        'Değerlerine uygun yatırımlar yap.'
      ],
      health: [
        'Duygusal sağlık fiziksel sağlığı etkiliyor.',
        'Sevgi dolu ilişkiler şifa getirir.',
        'Kalp sağlığına önem ver.'
      ],
      spirit: [
        'İçsel birlik ve bütünlük zamanı.',
        'Zıtlıkların uyumu içinde denge bul.',
        'Sevgi evrensel bir güç, onu hisset.'
      ]
    },
    reverseMeanings: {
      love: 'İlişkide uyumsuzluk veya yanlış seçimler gündemde.',
      career: 'İş ortaklıklarında anlaşmazlıklar çıkabilir.',
      money: 'Dürtüsel harcamalar veya finansal sorumsuzluk.',
      health: 'Duygusal dengesizlik fiziksel sağlığı bozabilir.',
      spirit: 'Kendinle çatışma halindesin, iç huzuru bul.'
    }
  },
  {
    id: 7,
    name: 'The Chariot',
    nameTr: 'Savaş Arabası',
    image: '/tarot/the-chariot.png',
    meanings: {
      love: [
        'Aşkta zafer! İstediğini elde edeceksin.',
        'İlişkinde ilerleme kaydediyorsun.',
        'Engelleri birlikte aşacaksınız.'
      ],
      career: [
        'Kariyer hedeflerine doğru hızla ilerliyorsun!',
        'Başarı kaçınılmaz, devam et.',
        'Rekabette öne geçme zamanı.'
      ],
      money: [
        'Finansal hedeflere ulaşmak için tam gaz!',
        'Kararlılığın maddi kazanç getirecek.',
        'Engelleri aşarak zenginliğe ulaşacaksın.'
      ],
      health: [
        'Fiziksel güç ve dayanıklılık zirve de.',
        'Spor ve aktivitelerde başarı var.',
        'İrade gücünle sağlık hedeflerine ulaş.'
      ],
      spirit: [
        'Ruhsal yolculuğunda hızla ilerliyorsun.',
        'İrade ve niyet gücün çok yüksek.',
        'Engelleri aşarak aydınlanmaya yaklaş.'
      ]
    },
    reverseMeanings: {
      love: 'İlişkide kontrol kaybı veya agresif tutumlar.',
      career: 'Hırsına yenik düşme veya yönsüzlük hissi.',
      money: 'Hızlı para kazanma hırsı kaybettirebilir.',
      health: 'Aşırı zorlama sonucu sakatlanma riski.',
      spirit: 'Ego savaşları ruhsal gelişimi engelliyor.'
    }
  },
  {
    id: 8,
    name: 'Strength',
    nameTr: 'Güç',
    image: '/tarot/strength.png',
    meanings: {
      love: [
        'İçsel gücün ilişkini besleyecek.',
        'Sabır ve şefkat aşkta mucizeler yaratır.',
        'Zor zamanları birlikte atlatacaksınız.'
      ],
      career: [
        'Zorluklarla başa çıkma gücün var.',
        'Yumuşak güç kullanarak hedeflerine ulaş.',
        'Sabır ve kararlılık ödüllendirilecek.'
      ],
      money: [
        'Finansal zorlukları aşma gücün var.',
        'Sabırlı ol, kontrol senin elinde.',
        'İçsel güç dışsal zenginliğe dönüşecek.'
      ],
      health: [
        'İçsel güç fiziksel iyileşmeyi destekliyor.',
        'Kronik sorunlarla mücadele gücün var.',
        'Zihinsel dayanıklılık sağlığını koruyor.'
      ],
      spirit: [
        'İçsel canavarlarını evcilleştirme zamanı.',
        'Şefkat ve güç bir arada, denge bul.',
        'Spiritüel gücün artıyor.'
      ]
    },
    reverseMeanings: {
      love: 'Güvensizlik veya kıskançlık ilişkiyi zayıflatabilir.',
      career: 'Kendine güven eksikliği fırsatları kaçırmana neden oluyor.',
      money: 'Maddi korkulara teslim olma, cesaret eksikliği.',
      health: 'Zayıf irade sağlık hedeflerini bozuyor.',
      spirit: 'İçsel korkuların seni yönetmesine izin verme.'
    }
  },
  {
    id: 9,
    name: 'The Hermit',
    nameTr: 'Ermiş',
    image: '/tarot/the-hermit.png',
    meanings: {
      love: [
        'İçe dönme ve ilişkiyi değerlendirme zamanı.',
        'Yalnızlık bazen gerekli, kendini bul.',
        'Derin düşünce aşkta netlik getirecek.'
      ],
      career: [
        'Kariyer yolunu yeniden değerlendir.',
        'Mentörlük yapma veya alma zamanı.',
        'Sessiz çalışma büyük sonuçlar getirecek.'
      ],
      money: [
        'Finansal durumunu sessizce analiz et.',
        'Geri çekilip büyük resme bak.',
        'Bilgelik temelli kararlar al.'
      ],
      health: [
        'Dinlenme ve yenilenme zamanı.',
        'Sessizlik ve huzur şifa getirir.',
        'Stres azaltma öncelikli olmalı.'
      ],
      spirit: [
        'Derin meditasyon ve içe yolculuk zamanı.',
        'İçindeki ışığı bul ve takip et.',
        'Spiritüel arayış yoğunlaşıyor.'
      ]
    },
    reverseMeanings: {
      love: 'Aşırı izolasyon yalnızlık hissine yol açabilir.',
      career: 'Takım çalışmasından kaçmak işleri zorlaştırıyor.',
      money: 'Tavsiyeleri dinlememek finansal hata yaptırabilir.',
      health: 'Depresif ruh hali veya içine kapanma.',
      spirit: 'Spiritüel kopukluk, yolunu kaybetme hissi.'
    }
  },
  {
    id: 10,
    name: 'Wheel of Fortune',
    nameTr: 'Kader Çarkı',
    image: '/tarot/wheel-of-fortune.png',
    meanings: {
      love: [
        'Aşkta şans dönüyor, hazır ol!',
        'Kader sana bir sürpriz hazırlıyor.',
        'Döngüler değişiyor, pozitif kal.'
      ],
      career: [
        'Kariyer şansın dönme noktasında!',
        'Beklenmedik fırsatlar kapıda.',
        'Değişime açık ol, şans senden yana.'
      ],
      money: [
        'Finansal şans kapını çalıyor!',
        'Para akışında olumlu değişiklikler.',
        'Şans oyunlarında dikkatli ama umutlu ol.'
      ],
      health: [
        'Sağlıkta olumlu bir dönüm noktası.',
        'Döngüsel sağlık sorunları çözülüyor.',
        'Değişim zamanı, yeni başlangıçlar.'
      ],
      spirit: [
        'Karmik döngüler tamamlanıyor.',
        'Evren senin için çalışıyor.',
        'Kader yolun aydınlanıyor.'
      ]
    },
    reverseMeanings: {
      love: 'Talihsizlikler veya kötü zamanlama aşkta sorun yaratabilir.',
      career: 'Beklenmedik aksilikler planları bozabilir, esnek ol.',
      money: 'Maddi kayıplar veya şanssızlık dönemi.',
      health: 'Eski sağlık sorunları nüks edebilir, dikkatli ol.',
      spirit: 'Karmik derslere direnme, akışa güven.'
    }
  },
  {
    id: 11,
    name: 'Justice',
    nameTr: 'Adalet',
    image: '/tarot/justice.png',
    meanings: {
      love: [
        'İlişkide denge ve adalet önemli.',
        'Doğru kararlar uzun vadeli mutluluk getirir.',
        'Karşılıklı saygı ve dürüstlük ödüllendirilir.'
      ],
      career: [
        'Adil davranışlar ödüllendirilecek.',
        'Hukuki konular lehinize sonuçlanabilir.',
        'Etik kararlar karierde ilerleme sağlar.'
      ],
      money: [
        'Finansal adalet sağlanıyor.',
        'Hak ettiğini alacaksın.',
        'Dengeli bütçe huzur getirir.'
      ],
      health: [
        'Vücut dengesini koru.',
        'Dengeli beslenme ve yaşam tarzı önemli.',
        'Sağlık kararlarında mantıklı ol.'
      ],
      spirit: [
        'Karmik denge sağlanıyor.',
        'Doğru ile yanlışı ayırt etme gücün artıyor.',
        'Evrensel adalet işliyor.'
      ]
    },
    reverseMeanings: {
      love: 'Haksızlık veya adaletsizlik hissi ilişkiyi zedeliyor.',
      career: 'İş yerinde taraflı tutumlar veya haksız eleştiriler.',
      money: 'Finansal dengesizlik veya borçların artması.',
      health: 'Dengesiz yaşam tarzı sağlığı bozuyor.',
      spirit: 'Kendine karşı dürüst olmamak ruhsal yük yaratır.'
    }
  },
  {
    id: 12,
    name: 'The Hanged Man',
    nameTr: 'Asılan Adam',
    image: '/tarot/the-hanged-man.png',
    meanings: {
      love: [
        'Aşkta farklı bir perspektif gerekiyor.',
        'Beklemek bazen en iyi strateji.',
        'Fedakarlık yeni kapılar açabilir.'
      ],
      career: [
        'Kariyerde bir mola zamanı.',
        'Farklı açıdan bak, çözüm orada.',
        'Beklemek bazen akıllıca bir hamle.'
      ],
      money: [
        'Finansal kararları ertele, düşün.',
        'Farklı bir bakış açısı gerekiyor.',
        'Sabır maddi kazanç getirecek.'
      ],
      health: [
        'Dinlenme ve yenilenme şart.',
        'Alternatif tedavileri değerlendir.',
        'Perspektif değişikliği şifa getirebilir.'
      ],
      spirit: [
        'Teslim ol ve bırak.',
        'Farklı bir bilinç seviyesine ulaşıyorsun.',
        'Fedakarlık spiritüel büyüme getirir.'
      ]
    },
    reverseMeanings: {
      love: 'Boşa kürek çekme veya gereksiz fedakarlık.',
      career: 'İşlerin tıkanması, ilerleyememe hissi.',
      money: 'Maddi durgunluk veya kötü yatırımlarda ısrar.',
      health: 'Kendini ihmal etme, fiziksel tükenmişlik.',
      spirit: 'Ego direnci aydınlanmayı engelliyor.'
    }
  },
  {
    id: 13,
    name: 'Death',
    nameTr: 'Ölüm',
    image: '/tarot/death.png',
    meanings: {
      love: [
        'Eski kalıplar bitiyor, yeni başlangıçlar geliyor.',
        'Dönüşüm zamanı, eskiyi bırak.',
        'İlişkide köklü değişimler olumlu.'
      ],
      career: [
        'Kariyer dönüşümü zamanı!',
        'Eski yollar kapanıyor, yenileri açılıyor.',
        'Değişimi kucakla, büyüme orada.'
      ],
      money: [
        'Finansal alışkanlıklarda köklü değişim.',
        'Eski para kalıpları dönüşüyor.',
        'Yeni finansal dönem başlıyor.'
      ],
      health: [
        'Sağlıkta yenilenme ve dönüşüm.',
        'Zararlı alışkanlıkları bırakma zamanı.',
        'Bedensel dönüşüm başlıyor.'
      ],
      spirit: [
        'Ego ölümü ve yeniden doğuş.',
        'Spiritüel dönüşüm yoğun.',
        'Eski inançlar dökülüyor, yenileri geliyor.'
      ]
    },
    reverseMeanings: {
      love: 'Değişime direnç göstermek acıyı uzatır.',
      career: 'Kariyerde stagnasyon, yeniliğe kapalılık.',
      money: 'Maddi kayıp korkusu gelişimi engelliyor.',
      health: 'İyileşme sürecine direnç veya korku.',
      spirit: 'İçsel dönüşümden korkma, eskiye takılı kalma.'
    }
  },
  {
    id: 14,
    name: 'Temperance',
    nameTr: 'Denge',
    image: '/tarot/temperance.png',
    meanings: {
      love: [
        'İlişkide denge ve uyum hakim.',
        'Sabır ve ılımlılık aşkı güçlendiriyor.',
        'Uyum içinde bir birliktelik mümkün.'
      ],
      career: [
        'İş-yaşam dengesi önemli.',
        'Sabırlı ve ılımlı yaklaşım başarı getirir.',
        'Farklı projeleri dengele.'
      ],
      money: [
        'Finansal denge sağlanıyor.',
        'Harcama ve biriktirme arasında denge.',
        'Sabırlı yatırımlar kazandırır.'
      ],
      health: [
        'Vücutta denge ve uyum.',
        'Ilımlı yaklaşım sağlığa iyi gelir.',
        'Bütünsel sağlık anlayışı benimse.'
      ],
      spirit: [
        'İç huzur ve denge hakim.',
        'Zıtlıklar uyum içinde.',
        'Spiritüel simya gerçekleşiyor.'
      ]
    },
    reverseMeanings: {
      love: 'İlişkide dengesizlik veya aşırılıklar.',
      career: 'İş hayatında uyumsuzluk veya acelecilik.',
      money: 'Aşırı harcama veya cimrilik dengesizliği.',
      health: 'Sağlıksız alışkanlıklar dengeyi bozuyor.',
      spirit: 'Ruhsal ve dünyevi yaşam arasında kopukluk.'
    }
  },
  {
    id: 15,
    name: 'The Devil',
    nameTr: 'Şeytan',
    image: '/tarot/the-devil.png',
    meanings: {
      love: [
        'Bağımlılık kalıplarının farkına var.',
        'Sağlıksız bağlardan kurtulma zamanı.',
        'Tutku yoğun ama dikkatli ol.'
      ],
      career: [
        'İşe bağımlılık konusunda dikkatli ol.',
        'Materyal başarı ruhu tüketmesin.',
        'Özgürleştirici kariyer kararları al.'
      ],
      money: [
        'Para bağımlılığı veya korkusu kontrol etmesin.',
        'Aşırı materyalizme dikkat.',
        'Finansal zincirleri kır.'
      ],
      health: [
        'Zararlı alışkanlıkların farkına var.',
        'Bağımlılıklarla yüzleşme zamanı.',
        'Özgürleşme sağlık getirir.'
      ],
      spirit: [
        'Gölge yönlerini kabul et.',
        'Spiritüel esaret farkındalığı.',
        'Özgürleşme yolu açılıyor.'
      ]
    },
    reverseMeanings: {
      love: 'Toksik ilişkiden kurtuluş veya yüzleşme.',
      career: 'Seni kısıtlayan işten ayrılma cesareti.',
      money: 'Maddi takıntılardan özgürleşme.',
      health: 'Bağımlılıklardan kurtulmak için adım atma.',
      spirit: 'Karanlık düşüncelerden aydınlığa çıkış.'
    }
  },
  {
    id: 16,
    name: 'The Tower',
    nameTr: 'Kule',
    image: '/tarot/the-tower.png',
    meanings: {
      love: [
        'Ani değişimler aşkta netlik getirebilir.',
        'Yıkım bazen yeniden inşa içindir.',
        'Gerçekler ortaya çıkıyor, hazır ol.'
      ],
      career: [
        'Beklenmedik kariyer değişiklikleri olabilir.',
        'Yıkım yeni fırsatların habercisi.',
        'Eski yapılar çökerken yenileri doğuyor.'
      ],
      money: [
        'Finansal sarsıntılara hazırlıklı ol.',
        'Ani değişimler yeni başlangıçlar getirir.',
        'Maddi kaygılar geçici.'
      ],
      health: [
        'Ani sağlık değişimlerine dikkat.',
        'Kriz anları dönüm noktası olabilir.',
        'Şok edici haberler iyileşme getirebilir.'
      ],
      spirit: [
        'Ego yapıları çöküyor, bu iyi.',
        'Spiritüel uyanış ani olabilir.',
        'Yıkımdan doğan aydınlanma.'
      ]
    },
    reverseMeanings: {
      love: 'Kaçınılmaz sondan kaçmaya çalışma, erteleme.',
      career: 'Değişim korkusuyla kötü bir işte kalma.',
      money: 'Maddi çöküşü inkar etme.',
      health: 'Hastalık belirtilerini görmezden gelme.',
      spirit: 'Uyanışa direnç, eski benliğe tutunma.'
    }
  },
  {
    id: 17,
    name: 'The Star',
    nameTr: 'Yıldız',
    image: '/tarot/the-star.png',
    meanings: {
      love: [
        'Umut ve iyimserlik aşkta hakim!',
        'Yıldızlar aşkta senden yana.',
        'İlham dolu romantik bir dönem.'
      ],
      career: [
        'Kariyer hayallerin gerçekleşiyor!',
        'İlham ve yaratıcılık zirve de.',
        'Yıldızın parlıyor, kendini göster.'
      ],
      money: [
        'Finansal umut ve iyimserlik.',
        'Hayallerin maddi karşılığı geliyor.',
        'Bolluk enerjisi seni sarıyor.'
      ],
      health: [
        'Şifa enerjisi çok güçlü!',
        'Umut ve pozitiflik iyileştiriyor.',
        'Yenilenme ve tazelenme zamanı.'
      ],
      spirit: [
        'Kozmik bağlantın çok güçlü!',
        'İlham yukarıdan geliyor.',
        'Spiritüel rehberlik alıyorsun.'
      ]
    },
    reverseMeanings: {
      love: 'Umutsuzluk veya karamsarlık aşkı gölgeliyor.',
      career: 'Yaratıcılık eksikliği veya ilham kaybı.',
      money: 'Maddi hedeflere inancını kaybetme.',
      health: 'Negatif düşünceler iyileşmeyi geciktiriyor.',
      spirit: 'Evrenle bağlantının koptuğunu hissetme.'
    }
  },
  {
    id: 18,
    name: 'The Moon',
    nameTr: 'Ay',
    image: '/tarot/the-moon.png',
    meanings: {
      love: [
        'Sezgilerine güven, onlar doğruyu söylüyor.',
        'Gizli duygular yüzeye çıkabilir.',
        'Hayaller ve gerçeklik arasında denge kur.'
      ],
      career: [
        'Gizli bilgiler ortaya çıkabilir.',
        'Sezgilerin iş kararlarında yol gösterici.',
        'Belirsizlikte sakin kal.'
      ],
      money: [
        'Finansal belirsizlik geçici.',
        'Sezgilerine güven ama araştır.',
        'Gizli fırsatlar kendini gösterecek.'
      ],
      health: [
        'Duygusal sağlığına önem ver.',
        'Uyku ve rüyalara dikkat.',
        'Bilinçaltı mesajları dinle.'
      ],
      spirit: [
        'Sezgisel güçlerin artıyor.',
        'Rüyalar mesajlar taşıyor.',
        'Gizemli bir dönemden geçiyorsun.'
      ]
    },
    reverseMeanings: {
      love: 'Korkular ve illüzyonlar gerçeği görmeni engelliyor.',
      career: 'Yanlış anlaşılmalar ve kafa karışıklığı.',
      money: 'Aldanma riski, finansal konularda dikkatli ol.',
      health: 'Psikolojik stres fiziksel sağlığı etkiliyor.',
      spirit: 'Kabuslar veya içsel korkularla yüzleşme.'
    }
  },
  {
    id: 19,
    name: 'The Sun',
    nameTr: 'Güneş',
    image: '/tarot/the-sun.png',
    meanings: {
      love: [
        'Aşkta mutluluk ve neşe zamanı!',
        'İlişkin parlak ve sıcak.',
        'Sevgi her tarafa yayılıyor.'
      ],
      career: [
        'Kariyer başarısı parlıyor!',
        'Tanınma ve takdir zamanı.',
        'Enerjin ve motivasyonun zirve de.'
      ],
      money: [
        'Finansal bolluk ve bereket!',
        'Para akışı olumlu.',
        'Başarı maddi kazanca dönüşüyor.'
      ],
      health: [
        'Enerji ve canlılık dolu bir gün!',
        'Sağlık mükemmel, tadını çıkar.',
        'Güneş enerjisi seni şarj ediyor.'
      ],
      spirit: [
        'Aydınlanma ve netlik zamanı!',
        'İçindeki ışık parlıyor.',
        'Neşe ve şükran ruhunu besliyor.'
      ]
    },
    reverseMeanings: {
      love: 'Geçici bir bulutlanma veya aşırı ego çatışması.',
      career: 'Başarının gecikmesi veya hak ettiğini alamama.',
      money: 'Maddi konularda aşırı iyimserlik hatası.',
      health: 'Enerji düşüklüğü veya güneş çarpması riski.',
      spirit: 'İçsel neşeyi bulmakta zorlanma.'
    }
  },
  {
    id: 20,
    name: 'Judgement',
    nameTr: 'Mahkeme',
    image: '/tarot/judgement.png',
    meanings: {
      love: [
        'İlişkide yeniden değerlendirme zamanı.',
        'Geçmişten dersler al, geleceğe bak.',
        'İkinci şanslar mümkün.'
      ],
      career: [
        'Kariyer değerlendirmesi ve yeniden doğuş.',
        'Çağrınıza cevap verme zamanı.',
        'Geçmiş emekler meyve veriyor.'
      ],
      money: [
        'Finansal kararların sonuçları geliyor.',
        'Geçmiş yatırımlar değerlendiriliyor.',
        'Yeni finansal sayfa açılıyor.'
      ],
      health: [
        'Sağlık kararlarının sonuçları görülüyor.',
        'Yenilenme ve canlanma zamanı.',
        'Geçmiş sağlık sorunları çözülüyor.'
      ],
      spirit: [
        'Spiritüel uyanış çağrısı!',
        'Yüksek benliğinle bağlantı kur.',
        'Karmik hesaplaşma ve arınma.'
      ]
    },
    reverseMeanings: {
      love: 'Geçmişi bırakamama, pişmanlıklar.',
      career: 'Çağrını duymazdan gelme, fırsatları kaçırma.',
      money: 'Maddi hatalardan ders almama.',
      health: 'Sağlık uyarılarını dikkate almama.',
      spirit: 'İçsel sesi bastırma, uyanışa direnç.'
    }
  },
  {
    id: 21,
    name: 'The World',
    nameTr: 'Dünya',
    image: '/tarot/the-world.png',
    meanings: {
      love: [
        'Aşkta tamamlanma ve bütünlük!',
        'İlişkin kusursuz bir uyum içinde.',
        'Evrensel aşk seni sarmalıyor.'
      ],
      career: [
        'Kariyer hedeflerine ulaştın, kutla!',
        'Başarı ve tamamlanma enerjisi.',
        'Yeni döngüler için hazırsın.'
      ],
      money: [
        'Finansal hedeflere ulaşıldı!',
        'Maddi tamamlanma ve başarı.',
        'Bolluk döngüsü tamamlanıyor.'
      ],
      health: [
        'Bütünsel sağlık ve iyilik hali!',
        'Vücut, zihin, ruh uyum içinde.',
        'Tam sağlık döngüsü tamamlanıyor.'
      ],
      spirit: [
        'Spiritüel yolculukta bir döngü tamamlanıyor.',
        'Evrenle bir olma hissi.',
        'Kozmik bilinçle bağlantı.'
      ]
    },
    reverseMeanings: {
      love: 'Tamamlanmamış duygular veya yarım kalan işler.',
      career: 'Hedefe ulaşmada son engeller, gecikme.',
      money: 'Maddi doyuma ulaşamama hissi.',
      health: 'Tedavinin tamamlanmaması, nüksetme riski.',
      spirit: 'Döngüyü kapatamama, takılı kalma.'
    }
  }
]

// Günlük fal için yardımcı fonksiyonlar

/**
 * GMT+3 (Türkiye) saat dilimine göre bugünün tarihini alır
 */
export function getTurkeyDate(): string {
  const now = new Date()
  // UTC + 3 saat
  const turkeyTime = new Date(now.getTime() + (3 * 60 * 60 * 1000))
  return turkeyTime.toISOString().split('T')[0] // YYYY-MM-DD
}

/**
 * GMT+3 gece yarısına kalan süreyi hesaplar (milisaniye)
 */
export function getTimeUntilMidnightGMT3(): number {
  const now = new Date()
  const turkeyTime = new Date(now.getTime() + (3 * 60 * 60 * 1000))

  // Gece yarısı
  const midnight = new Date(turkeyTime)
  midnight.setHours(24, 0, 0, 0)

  return midnight.getTime() - turkeyTime.getTime()
}

/**
 * Tarih bazlı seed ile rastgele sayı üretir (her kullanıcı için benzersiz)
 */
export function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Kullanıcı ID'si oluşturur veya mevcut olanı getirir
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server'

  let userId = localStorage.getItem('crown_fortune_user_id')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem('crown_fortune_user_id', userId)
  }
  return userId
}

export interface DailyFortune {
  date: string
  cardId: number
  category: FortuneCategory
  messageIndex: number
}

/**
 * Günlük falı localStorage'dan alır veya yeni oluşturur
 */
export function getDailyFortune(): DailyFortune {
  if (typeof window === 'undefined') {
    return { date: '', cardId: 0, category: 'love', messageIndex: 0 }
  }

  const today = getTurkeyDate()
  const userId = getUserId()
  const storageKey = 'crown_daily_fortune'

  // Kayıtlı falı kontrol et
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    const parsed: DailyFortune = JSON.parse(stored)
    // Bugünün falı mı kontrol et
    if (parsed.date === today) {
      return parsed
    }
  }

  // Yeni fal oluştur
  const seed = `${today}_${userId}`
  const random = seededRandom(seed)

  const cardId = random % TAROT_CARDS.length
  const categoryIndex = Math.floor(random / TAROT_CARDS.length) % FORTUNE_CATEGORIES.length
  const category = FORTUNE_CATEGORIES[categoryIndex].key
  const messageIndex = Math.floor(random / (TAROT_CARDS.length * FORTUNE_CATEGORIES.length)) % 3

  const fortune: DailyFortune = {
    date: today,
    cardId,
    category,
    messageIndex
  }

  localStorage.setItem(storageKey, JSON.stringify(fortune))
  return fortune
}

/**
 * Mevcut falın detaylarını getirir
 */
export function getFortuneDetails(fortune: DailyFortune) {
  const card = TAROT_CARDS[fortune.cardId]
  const category = FORTUNE_CATEGORIES.find(c => c.key === fortune.category)!
  const message = card.meanings[fortune.category][fortune.messageIndex]

  return {
    card,
    category,
    message
  }
}