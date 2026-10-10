# lumina

1. Okuma Stili Test Modülü
Ölçülen Bilişsel Süreç: Semantik tarama, metin içi bağlaç analizi ve kronolojik akış kurgulama.
Format: Cümle Sıralama.
Senaryo: Bir öğrencinin yemekhane süreci.

Soru Metni ve Maddeler:
Aşağıda bir üniversite öğrencisinin öğle yemeği sürecinde gerçekleştirdiği eylemler karışık olarak verilmiştir:
I. Masaya geçip montunu sandalyeye asar ve yemeğini yemeye başlar.
II. Turnikeden öğrenci kartını okutarak yemekhane binasına giriş yapar.
III. Boş tepsisini alıp tezgâhtan günün sıcak yemeklerini seçer.
IV. Elindeki yemek tepsisiyle etrafına bakınarak salonda boş bir masa bulur.

Doğru Akış: II - III - IV - I

2. Yazarak Öğrenme Test Modülü
Ölçülen Bilişsel Süreç: Pasif şık tanımanın ötesinde motor kodlama, kısa süreli hafızadan teknik veri çağırma.
Format: Süreli Kurgusal Metin Gösterimi ve Şıksız Boşluk Doldurma.
Senaryo: Gerçek hayatta karşılığı olmayan Zeta-4 Biyo-Polimeri metni.

Aşama 1 Metin Gösterimi (15-20 saniye sonra ekrandan kalkar):
Yeni sentezlenen Zeta-4 polimeri, yüksek sıcaklık altında aşamalı bir tepkime gösterir. Sıcaklık 140°C seviyesine ulaştığında malzeme iç yapısındaki kristal bağlar gevşeyerek esnek forma geçer.

Aşama 2 Boşluk Doldurma:
Kullanıcı metin kapandıktan sonra klavyeyle şu soruları yanıtlar:
Malzemenin esnek forma geçmeye başladığı eşik sıcaklık değeri: 140 veya 140°C
140°C seviyesinde gevşeyerek bu değişime yol açan iç yapı unsuru: kristal bağlar

3. Dinleyerek Öğrenme Test Modülü
Ölçülen Bilişsel Süreç: Seçici işitsel dikkat, arka plan konuşmasını filtreleme ve işitsel çalışma belleği.
Format: Ses Kaydı Dinleme ve Çoklu Girişli Liste Hatırlama.
Senaryo: Kafede veya kütüphanede yer arayan birinin konuşması.

Seslendirme Metni (25-30 saniye):
Merhabalar, kusura bakmayın rahatsız ediyorum. Az önce arka taraftaki deri koltuklara ve cam kenarına baktım ama hiç boş yer kalmamış. Elimde sıcak kahve ve kalın bir kabanla öylece kaldım, bir de dizüstü bilgisayarı şarja takmak için çalışan bir priz arıyordum. Acaba şu karşı sandalyeye geçebilir miyim? Aslında doğrudan oturacaktım ama masanın üzeri biraz fazla karışık geldi, kimin olduğunu da bilemedim. Baksanıza şuraya; şemsiye, elma, fotoğraf makinesi, çorap, vida ve kalem bırakılmış. Bunlar size aitse rica etsem biraz toparlayabilir misiniz?

Bilişsel Ayrım ve Hedefler:
Girişteki Çeldiriciler: Deri koltuk, cam kenarı, sıcak kahve, kalın kaban, çalışan priz.
Hedef Nesneler: Şemsiye, elma, fotoğraf makinesi, çorap, vida, kalem.
Soru: Kullanıcı sesi dinledikten sonra masanın üstünde dağınık olduğu belirtilen bu 6 yalın nesneyi ekrandaki kutucuklara yazar. Hatırlanan her doğru kelime için puan verilir.

---

## Puan Algoritması

**1. Soru — Deneysel (Molekül)**

Bu soru doğru mu yanlış mı tipi bir sorudur. Yanlış cevap verilirse direkt 0 puan alır, hiçbir hesap yapılmaz. Doğru cevap verilirse 100 puandan başlanır ve ilk 5 saniye ceza uygulanmaz. Bu ilk 5 saniye, kullanıcının acele etmesini engellemek için bırakılmış bir süredir. 5. saniyeden sonra her geçen saniye için 3 puan kesinti yapılır. Kısmi saniyeler Math.floor ile yuvarlanır, yani 5.9 saniye 5 saniye olarak sayılır. Son olarak Math.max(0, ...) ile puanın hiçbir zaman eksiye düşmesi engellenir. Özetle hızlı ve doğru cevap yüksek puan, yavaş ve doğru cevap orta puan, yanlış cevap ise 0 puan verir.

**2. Soru — Görsel (Hafıza)**

Bu soru göreli sıralama tipidir. Kullanıcı bir diziyi sıralar ve biz bu sıralamadaki komşu çiftlerin kaç tanesinin doğru sırada olduğunu sayarız. Öncelikle hile koruması uygulanır: eğer aynı eleman iki veya daha fazla kez yazılmışsa direkt 0 puan verilir. Bunun sebebi, bir elemanı birkaç kez yazıp diğerlerini atarak kısmi puan kazanmayı engellemektir. Daha sonra komşu çiftler sayılır. Dört eleman varsa üç komşu çifti vardır: birinci ile ikinci, ikinci ile üçüncü, üçüncü ile dördüncü eleman birbirine muhataptır. Her çift için, o elemanın doğru sıralamasındaki bir sonraki elemanın kullanıcının sıralamasındaki bir sonraki elemanla aynı olup olmadığına bakılır. Aynıysa doğru bağ sayacı bir artırılır. Ham puan, doğru bağ sayısının toplam bağ sayısına oranı ile 100 çarpılarak bulunur. Yani üç bağdan ikisi doğruysa puan 66.67 olur. Süre cezası kademeli olarak uygulanır: ilk 5 saniye ceza yoktur, 5 ile 15 saniye arasında her saniye 1 puan kesilir, 15 saniye sonrasında ise 10 sabit puan ve her saniye için ayrıca 3 puan daha kesilir. Bu kademeli yapı, 15 saniyeyi aşmanın ciddi bir zorluk olduğunu ve bu yüzden cezanın ağırlaşması gerektiğini ifade eder.

**3. Soru — Okuma (4 harf sıralama)**

Bu soru da aynı göreli sıralama mantığını kullanır, ancak eleman sayısı sabittir yani dört tanedir. Toplam bağ sayısı üç olarak sabitlenmiştir. Hile koruması aynı şekilde uygulanır ve süre cezası da aynı kademeli yapıyı izler. Tek fark, doğru sıralama dizisinin uzunluğunun tam olarak dört olup olmadığının kontrol edilmesidir. Eğer dörtten farklı bir uzunluk gelirse fonksiyon direkt sıfır döndürür.

**4. Soru — Yazma (2 alt soru)**

Bu soru iki bağımsız doğru yanlış cevabından oluşur ve her biri 50 puan değerindedir. İkisi doğruysa toplam 100 puan, bir tanesi doğruysa 50 puan, ikisi yanlışsa 0 puan elde edilir. Süre cezası yalnızca ham puan sıfırdan büyükse uygulanır, yani ikisi yanlışsa süre cezasına gerek kalmaz çünkü puan zaten sıfırdır. Süre cezasının kendisi yine kademeli olarak hesaplanır: ilk 5 saniye ceza yok, 5 ile 15 saniye arasında her saniye 1 puan, 15 saniye sonrasında 10 sabit puan ve her saniye 3 puan daha kesilir.

**5. Soru — Dinleme (6 kutu)**

Bu soru hatırlama tipidir ve kullanıcının altı nesneden kaçını hatırladığını ölçer. Öncelikle kullanıcı cevapları temizlenir: boş cevaplar atılır, tekrarlar kaldırılır ve tüm cevaplar küçük harfe çevrilip başındaki ve sonundaki boşluklar temizlenir. Daha sonra her cevap için doğruluk kontrolü yapılır. Doğru bir cevap verilirse, hedef cevap sayısına göre hesaplanan eşit bir puan değeri toplam puana eklenir, örneğin altı hedef varsa her doğru cevap 16.67 puan değerindedir. Yanlış cevap verilirse ise ceza uygulanır: ilk altı yanlıştan her biri 3 puan, altıdan sonraki her yanlış ise 5 puan keser. Bunun sebebi, ilk altı yanlışın üretilmiş cevaplar olarak görülmesi ve daha sonraki yanlışların doldurma amaçlı olduğu düşünülmesidir. Son olarak hesaplanan puan, Math.max ve Math.min ile 0 ile 100 arasına sabitlenir, böylece puan hiçbir zaman 100'ü geçemez veya 0'ın altına düşemez.

**Genel Yaklaşım**

Süre cezası yalnızca bilgi tabanlı sorularda uygulanır, çünkü bu sorular ne kadar hızlı hatırlama yaptığını ölçer. Hatırlama sorularında ise süre cezası yoktur çünkü amaç ne kadar hızlı olduğunu değil ne kadar hatırladığını ölçmektir. Hile koruması sıralama sorularında bulunur ve aynı elemanın tekrar yazarak kısmi puan kazanılmasını engeller. Kademeli ceza her yerde aynı mantığı izler: ilk beş saniye bedavadır, beş ile onbeş saniye arası hafif bir ceza uygulanır, onbeş saniye sonrası ise ceza ağırlaşır.
