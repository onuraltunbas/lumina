# Lumina Bilisel Test Modulu ve Psikometrik Olcum Metodolojisi

Bu dokuman, Lumina platformundaki interaktif bilissel test modullerinin pedagojik temellerini, olcum hedeflerini, tepki suresi referans esiklerini ve dinamik veri akisi mimarisini aciklamaktadir.

---

## 1. Psikometrik Temeller ve Olcum Hedefleri

Klasik sinav ve tek boyutlu anket modelleri, bireyin anlik bilgi duzeyini olcmeye calisirken bilgiyi isleme hizini, calisma bellegini ve karar mekanizmasini goz ardi eder. Lumina test modulu; bireyin hangi ogrenme stiline daha yatkin olduguna dair ampirik bir istatistik elde etmek ve bilissel egilimleri hakkinda kisisellestirilmis bir veri seti sunmak amaciyla gelistirilmistir.

* **Dinamik Periyot:** Ogrencinin bilissel profilinin tutarli sekilde modellenmesi amaciyla testler asgari 48 saatlik araliklarla tekrarlanir.
* **Ezberlemenin Onlenmesi:** Iki gunde bir tekrarlanan oturumlarda soru kalibi ayni kalsa da soru icerikleri ve parametreleri dinamik olarak degistirilir. Bu sayede ezberleme etkisi (practice effect) ortadan kaldirilir.

---

## 2. Kademeli Bilisel Test Kurgusu ve Zaman Esikleri

Test yapisi bilissel psikoloji prensiplerine gore 5 kademeli olarak yapilandirilmistir:

### 2.1. Temel Refleks ve Algisal Tepki (5 Saniye Esigi)
Ilk asamada ogrencinin gorsel ve kinestetik uyarani algilayip aksiyona gecme refleksi test edilir.
* Bilisel surecte uyarani algilama ve dogru aksiyona gecme suresi 5 saniyeyi astigi takdirde, bu durum anlik dikkat dalgalanmasi veya duraksama olarak degerlendirilir ve saniye basina ceza katsayisi uygulanir.

### 2.2. Goreli Bag Kurma ve Calisma Bellegi (15 Saniye Esigi)
Ikinci ve ucuncu asamada ogrencinin sirali bilgiyi zihinde tutma ve baglantilari cozumleme kapasitesi olculur.
* Puanlama, ogrencinin yalnizca mutlak dogru dizilimine gore degil, ogeler arasinda kurdugu mantiksal ve goreli baglantilarin dogruluguna gore yapilir.
* Karmasik uyaranlar arasinda gecis yapabilme ve dikkat dagilimi test edilirken 15 saniyelik zaman baskisi parametresi baz alinir.

### 2.3. Durtu Kontrolu ve Sinav Kaygisi Analizi
Test oturumunun son asamasi stres yonetimi ve durtu kontrolu uzerine odaklanir.
* Bu asamada zamanlayici devreden cikarilarak ogrencinin serbest metin girisi yapmasi istenir.
* Hedef, ogrencinin cevabi bilmedigi veya emin olmadigi anlarda rastgele tahminlerde bulunma (impulsive guessing) egilimini olcmektir.
* Belirli bir hata sayisini asan girislerde artan ceza katsayisi isletilerek sinav kaygisi ve durtusel davranis orani modellenir.

---

## 3. Matematiksel Hesaplama ve Veri Akisi

Test surecinde arayuz ile hesaplama motoru arasinda suregelen canli veri akisi su adimlarla islenir:

1. **Sure Olcumu:** Soru basladigi anda milisaniye hassasiyetinde kronometre devreye girer.
2. **Kademeli Zaman Cezasi:** 5 ve 15 saniyelik referans esikleri asildiginda gecikilen sure oraninda dinamik puan kesintisi hesaplanir.
3. **Metin Normalizasyonu:** Turkce karakter toleransi ve yazim kurallari gozetilerek kullanici cevaplari temizlenir.
4. **Yapay Zeka Profili:** Elde edilen zaman verileri, hatali girisler ve baglanti basarilari yapay zeka asistani Lumi'ye aktarilarak kisisellestirilmis calisma stratejisi olusturulur.
