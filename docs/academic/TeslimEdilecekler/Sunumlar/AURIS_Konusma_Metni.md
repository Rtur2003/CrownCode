# AURIS — Sunum Konuşma Metni

**Süre:** ~15-18 dakika · **Sunan:** Hasan Arthur Altuntaş
**Not:** Bu metin ezber değil, doğal anlatım için rehberdir. Köşeli parantezler `[ ]` sahne yönergesidir.

---

## Slayt 1 — Kapak

İyi günler hocam, arkadaşlar. Ben Hasan Arthur Altuntaş. Bugün size iki dönemdir üzerinde çalıştığım projem AURIS'i anlatacağım. AURIS, yapay zekâ tarafından üretilen müzikleri tespit eden bir sistem. Ama sadece bir model değil; geçen dönem temelini attığım, bu dönem akademik olarak derinleştirdiğim, baştan sona bir hikâye. O hikâyeyi anlatacağım.

[Bir-iki saniye dur, sonraki slayda geç.]

---

## Slayt 2 — AURIS Nedir?

Önce çok kısa, tek bakışta ne yaptığımı söyleyeyim.

Bugün Suno, Udio, MusicGen gibi araçlar var. Bir cümle yazıyorsunuz, dakikalar içinde size tam bir şarkı üretiyorlar. Ve açıkçası çoğu zaman bunun insan mı yoksa yapay zekâ mı yaptığını kulaktan ayırt edemiyorsunuz. AURIS işte bunu yapıyor: bir müziğin akustik özelliklerine bakıp, makine öğrenmesiyle "bu yapay zekâ üretimi mi, insan mı" sorusunu cevaplıyor. Hem web hem mobil üzerinden, saniyeler içinde.

Projenin üç ayağı var: akademik çekirdek — yani modelin kendisi; çalışan bir ürün — web ve mobil uygulama; ve açıklanabilirlik — yani model neden öyle karar verdiğini de söyleyebiliyor. Kara kutu değil.

---

## Slayt 3 — Yol Haritası

Bugünkü akışım şöyle: önce projenin iki dönemlik hikâyesini anlatacağım — geçen dönem ne yaptım, bu dönem ne ekledim. Sonra sistemin mimarisine, verisine, model seçimine gireceğim. Sonuçları, arayüzleri göstereceğim, literatürdeki yerimizi konuşacağız, ve dürüstçe nerede eksik kaldığımı da söyleyeceğim.

---

## Slayt 4 — Proje Hikâyesi (Zaman Çizelgesi)

Şimdi en sevdiğim kısım: bu proje nasıl gelişti.

[Çizelgeyi göster.]

Geçen dönem, BM401 Proje Tasarımı'nda işe çalışan bir sistem kurmakla başladım. Aradaki kış döneminde bunu akademik olarak derinleştirdim — yani "çalışıyor" demekten "bilimsel olarak kanıtlıyorum" demeye geçtim. Ve bu dönem, BM498'de bunu bir mezuniyet tezine ve yayımlanabilir bir makaleye dönüştürdüm.

Yani bu tek seferde olmuş bir şey değil; üst üste koyarak büyüttüğüm bir proje.

---

## Slayt 5 — Geçen Dönem (BM401)

Geçen dönem ne yaptığımı anlatayım, çünkü bu dönemin niye böyle olduğunu anlamak için önemli.

Geçen dönem wav2vec2 diye bir model kullandım — Facebook'un geliştirdiği, ham sesten çok güçlü temsiller çıkaran bir derin öğrenme modeli. Bunun üstüne LightGBM koyup hibrit bir yapı kurdum. Ve sadece model değil; web arayüzü, mobil uygulama, backend — uçtan uca çalışan bir ürün geliştirdim.

Ama bir şey öğrendim: wav2vec2 gerçekten güçlü, ama çok ağır. GPU istiyor, gerçek zamanlı çalışması zor. Ve ben şunu sordum kendime: "Acaba bu kadar ağır bir modele gerçekten ihtiyacım var mı? Daha hafif ama yine de etkili bir yol bulabilir miyim?" İşte bu soru beni bu döneme taşıdı.

---

## Slayt 6 — Bu Dönem (BM498)

Bu dönem cevabı buldum.

wav2vec2'nin tek başına çıkardığı temsil yerine, kendim 47 boyutlu bir akustik öznitelik vektörü tasarladım — yani müziğin spektral, ritmik, vokal gibi farklı yönlerini elle ölçen özellikler. Tek model yerine 11 farklı modeli yan yana karşılaştırdım. Ve sonuçları 5-katlı çapraz doğrulamayla, yani gerçekten güvenilir biçimde test ettim.

Neden bu yön? Üç sebep: Hafiflik — LightGBM GPU istemiyor, saniyeler içinde sonuç veriyor. Açıklanabilirlik — SHAP sayesinde "neden bu karar" diyebiliyorum. Ve bilimsel katkı — çalışma artık GUJSA'ya gönderilebilecek bir makale formatında.

---

## Slayt 7 — İki Dönem Karşılaştırması

[Tabloyu göster, hızlı geç ama vurgula.]

İki dönemi yan yana koyarsak: ağır derin modelden hafif topluluğa geçtim. Tek bölmeli testten çapraz doğrulamaya. Açıklanabilirliği sıfırdan tam açıklamaya. Ve sadece üründen, ürün artı akademik makaleye.

Kısacası: geçen dönem çalışan bir sistem kurdum, bu dönem onu bilimsel olarak sağlamlaştırdım. İkisi birlikte AURIS'in tam hikâyesi.

---

## Slayt 8 — Motivasyon

Biraz da neden bu problemin önemli olduğuna değineyim.

Yapay zekâ müzik üretimi artık herkesin elinde. Bu kulağa eğlenceli geliyor ama ciddi sorunlar doğuruyor: telif hakkı belirsizleşiyor, müzik platformlarında sahte dinlenmelerle gelir manipülasyonu yapılabiliyor, sanatçıların üslubu taklit edilebiliyor. Ve mevcut çözümlerin çoğu ya akademik makalede kalıyor, son kullanıcıya ulaşmıyor; ya çok ağır; ya da kararını hiç açıklamıyor. Ben erişilebilir, hafif, hızlı ve açıklanabilir bir şey istedim.

---

## Slayt 9 — Sistem Mimarisi (Üç Katman)

Sisteme teknik olarak bakalım. AURIS üç katmandan oluşuyor.

En üstte sunum katmanı var — web tarafında Next.js ve TypeScript, mobil tarafında Kotlin ve Jetpack Compose. Ortada iş mantığı — Python ve FastAPI ile bir backend; dosya doğrulama, güvenlik burada. En altta ise asıl iş: öznitelik çıkarma, LightGBM modeli ve SHAP açıklanabilirlik.

Bu katmanlı tasarımın güzelliği şu: arayüz değişse bile model katmanı aynı kalıyor. Bakımı ve testi kolay.

---

## Slayt 10 — Pipeline

[Şemayı göster.]

Peki bir müzik dosyası sisteme girdiğinde ne oluyor? Yedi adım. Ham ses geliyor, önce 22 bin hertze düşürüp tek kanala çeviriyoruz. 47 özniteliği çıkarıyoruz. Ölçekliyoruz. LightGBM bir olasılık üretiyor. Bu olasılığa optimize ettiğimiz eşiği — 0,43 — uyguluyoruz. Ve sonuç çıkıyor: yapay zekâ mı insan mı, üstüne de SHAP açıklamasıyla.

---

## Slayt 11 — Veri Kümesi

Modeli eğitmek için 5.195 örneklik bir veri kümesi derledim, sekiz farklı kaynaktan.

İnsan tarafında GTZAN, FMA, kapak performansları gibi çeşitli kaynaklar kullandım — tür çeşitliliği olsun diye. Yapay zekâ tarafında ise sekiz farklı üretici sistemden topladım. Neden sekiz? Çünkü tek bir sisteme aşırı uyum sağlamasını istemedim; model genel olarak "yapay zekâ müziği" kavramını öğrensin istedim.

Sınıf dengesine de dikkat ettim: yaklaşık yüzde 60 insan, yüzde 40 yapay zekâ. Bu dengesizliği de class_weight ve stratifiye örneklemeyle giderdim.

---

## Slayt 12 — Öznitelikler (Neden 47?)

Burası önemli, çünkü projenin kalbi bu. Neden 47 öznitelik?

Müziği beş farklı açıdan ölçüyorum: spektral — yani frekans içeriği, tını. Zamansal — enerji ve zaman yapısı. Ritmik — tempo, vuruş. Harmonik — perde ve akor. Vokal — şarkı sesinin davranışı.

Neden böyle parçaladım? Çünkü eğer sadece tek bir özelliğe bakarsam, model o özelliğe aşırı bağımlı olur. Ama beş farklı aileyi birleştirince, model müziğin farklı yönlerinden ayırt edici sinyal toplayabiliyor. Daha dayanıklı, daha güvenilir oluyor.

İlginç bir bulgu da şu: aslında 30 öznitelikten sonra doğruluk pek artmıyor. Yani gelecekte daha az öznitelikle de benzer başarıyı yakalayabilirim — bunu da dürüstçe not ettim.

---

## Slayt 13 — Model Seçimi (11 Model)

Şimdi en çok sorulan soruya geleyim: neden LightGBM?

[Tabloyu göster.]

Ben tek model seçip "bu iyidir" demedim. 11 farklı modeli — 7 makine öğrenmesi, 4 derin öğrenme — aynı koşullarda yarıştırdım. Tabloda görüyorsunuz, hepsini ROC-AUC'ye göre sıraladım.

LightGBM birinci. Ama sadece en yüksek skoru aldığı için değil. İki sebep daha var: en düşük varyansa sahip — yani en kararlı, her seferinde benzer sonuç veriyor. Ve hafif — GPU istemiyor, hızlı eğitiliyor. Yani derin ağlara yakın başarıyı, çok daha az maliyetle veriyor.

---

## Slayt 14 — ML vs DL

[Grafiği göster.]

Peki makine öğrenmesi mi yoksa derin öğrenme mi daha iyiydi? İlginç şekilde, ikisi neredeyse başa baş. 7 makine öğrenmesi modeli ortalama yüzde 92,75; 4 derin öğrenme modeli yüzde 92,32.

Bu bana şunu söyledi: benim 47 boyutlu öznitelik vektörüm zaten ayırt edici bilginin büyük kısmını taşıyor. Yani karmaşık derin ağa ihtiyaç yok; hafif LightGBM hem yeterli hem daha kararlı. Bu da geçen dönemki "ağır model şart mı" sorumun cevabı oldu: değilmiş.

---

## Slayt 15 — Sonuçlar (Karmaşıklık Matrisi)

Sonuçlara gelelim. LightGBM ROC-AUC olarak 0,9548, doğruluk 0,8839.

[Matrisi göster.]

Karmaşıklık matrisi şunu söylüyor: insanların yüzde 87'sini doğru insan, yapay zekânın yüzde 89'unu doğru yapay zekâ olarak işaretliyor. Yani her iki sınıfı da dengeli ayırıyor — bir tarafa yanlı değil. Bunu da Youden eşiği denen yöntemle, yanlış alarm ile kaçırma arasında denge kurarak sağladım.

---

## Slayt 16 — SHAP (Açıklanabilirlik)

Şimdi en gurur duyduğum kısım: model neden öyle karar veriyor?

[SHAP grafiğini göster.]

SHAP analiziyle her özniteliğin karara katkısını ölçtüm. En etkili öznitelik "spectral flatness std" çıktı — yani spektral düzlüğün değişkenliği. Mantığı şu: yapay zekâ müziği spektral açıdan daha "düz" ve daha düzenli oluyor, çünkü üretim sistemleri sesi optimize ederken o doğal düzensizliği kaybediyor. İnsan müziğinde o düzensizlik var, yapay zekâda yok. Ve bu bulgu, bağımsız deepfake literatüründe de aynı şekilde raporlanmış — yani tesadüf değil.

---

## Slayt 17 — Kaynak Bazlı Analiz (Dürüst Kısım)

Burada dürüst olmak istiyorum, çünkü bir sistemin sınırlarını bilmek onu güçlendirmenin ilk adımı.

İyi haberler: Suno parçalarında yüzde 93, Echoes'ta yüzde 88 başarı. Bunlar müzik üretim sistemleri, imzaları belirgin, model rahat yakalıyor.

Ama bir zayıf nokta var: deepfake setinde sadece yüzde 50. Bunu saklamak yerine analiz ettim. Sebebi şu: o küme aslında konuşma deepfake'inden türetilmiş, müzik üretim imzalarını taşımıyor. Yani bu bir başarısızlık değil, "dağılım kayması" dediğimiz bir durum — eğitim verisiyle test verisi farklı türden. Bunu gelecek çalışma olarak, alan uyarlamasıyla çözmeyi planlıyorum.

---

## Slayt 18 — Web Arayüzü (Gerçek Ekran)

Şimdi ürün tarafına geçelim. Bu gerçek bir ekran görüntüsü, tasarım maketi değil.

[Ekranı göster.]

Web arayüzünde kullanıcı ya bir dosya yüklüyor ya da YouTube linki yapıştırıyor. Sağdaki AURIS Pipeline paneli analizin hangi aşamada olduğunu canlı gösteriyor. Sayfa ortalama 1,2 saniyede yükleniyor, Lighthouse performans skoru 94 — yani modern web standartlarında.

---

## Slayt 19 — Web Detay

[Ekranları göster.]

Burada da analiz alanını ve YouTube bağlantı analizini görüyorsunuz. Akış basit: kullanıcı dosyayı veya linki verir, sistem 47 özniteliği çıkarır, LightGBM olasılık üretir, ve sonuç hem skorla hem de SHAP gerekçesiyle birlikte gösterilir.

---

## Slayt 20 — Mobil Uygulama (Gerçek Ekran)

Mobil tarafı da gerçek ekran görüntüleri.

[Ekranları göster.]

Android uygulamasını Kotlin ve Jetpack Compose ile geliştirdim, MVVM mimarisiyle. Yani iş mantığı arayüzden ayrı — bu da test edilebilirliği artırıyor. Uygulama 0,8 saniyede açılıyor, 10 analiz için sadece yüzde 3 batarya harcıyor. Yani hareket halindeyken de kullanılabilir, hafif bir uygulama.

---

## Slayt 21 — Teknoloji Yığını

[Hızlı geç, sadece vurgula.]

Kısaca ne kullandığımı toparlayayım: Yapay zekâ tarafında Python, librosa, scikit-learn, LightGBM ve SHAP. Web'de Next.js ve TypeScript. Mobilde Kotlin ve Compose. Backend'de FastAPI. Her katmanda o işe en uygun, modern araçları seçtim.

---

## Slayt 22 — Literatür Karşılaştırması

Peki AURIS literatürde nerede duruyor?

[Tabloyu göster.]

Yayımlanmış çalışmalarla karşılaştırdım. AURIS 0,9548 ile, Transformer tabanlı SONICS'in 0,960'ı ile Li ve arkadaşlarının 0,931'i arasında yer alıyor. Ama dikkat: ben bunu derin öğrenme altyapısı olmadan, sadece elle tasarlanmış özniteliklerle ve en düşük varyansla başardım. Yani hafif bir sistemin ne kadar rekabetçi olabileceğini gösteriyor — asıl katkım bu.

---

## Slayt 23 — Kısıtlar ve Gelecek

Dürüst değerlendirme: neyin eksik olduğunu da biliyorum.

Dağılım kayması var — eğitim dışı sistemlere genelleme sınırlı. Ağaç modellerinde hafif bir aşırı uyum eğilimi var. Bazı öznitelikler gereksiz. Ve gerçek zamanlı çalışmayı henüz test etmedim.

Gelecek planım da bunlara cevap: üretici-bağımsız test yapmak, MP3 sıkıştırma gibi bozulmalara karşı dayanıklılığı ölçmek, gerçek zamanlı çıkarımı eklemek ve veri kümesini 10 bin örneğe çıkarmak.

---

## Slayt 24 — Özet / Kapanış

Özetle: AURIS, yapay zekâ müziğini tespit eden; akademik olarak sağlam, ürün olarak çalışan, çok platformlu ve açıklanabilir bir sistem. İki dönemde, bir fikirden çalışan bir ürüne ve yayımlanabilir bir makaleye dönüştürdüm.

Dinlediğiniz için teşekkür ederim. Sorularınızı memnuniyetle alırım.

[Gülümse, soru bekle.]

---

## Olası Sorulara Hızlı Cevaplar (Hazırlık)

**"Neden wav2vec2'yi bıraktın?"**
Bırakmadım aslında, geçen dönem öğrendiğim bir araçtı. Ama gördüm ki elle tasarlanmış özniteliklerle, çok daha hafif bir şekilde benzer başarıya ulaşabiliyorum. Mühendislikte en güçlü değil, en uygun çözümü seçmek önemli.

**"Deepfake'te %50 başarısızlık değil mi?"**
Teknik olarak o küme müzik değil, konuşmadan türetilmiş. Yani modelin görmediği bir tür. Bu bir genelleme sınırı, model hatası değil. Zaten bunu tezde açıkça tartıştım ve gelecek çalışma olarak işaretledim.

**"5.195 örnek az değil mi?"**
Akademik bir başlangıç için yeterli ve dengeli. Sekiz farklı kaynaktan derlendi, bu da çeşitliliği sağlıyor. Gelecek planımda 10 bine çıkarmak var.

**"Neden topluluk öğrenmesi, tek model yetmez mi?"**
Tek model riskli — o modelin zayıf yanı tüm sisteme yansır. 11 modeli karşılaştırarak hangisinin gerçekten en kararlı olduğunu objektif olarak gösterebildim. Bilimsel olarak daha savunulabilir.

**"SHAP tam olarak ne işe yarıyor?"**
Modelin kararını şeffaf yapıyor. "Bu yapay zekâ" dediğinde, hangi özelliğe bakarak öyle dediğini gösterebiliyorum. Bu hem güven veriyor hem de modelin gerçekten anlamlı şeyler öğrenip öğrenmediğini doğrulamamı sağlıyor.
