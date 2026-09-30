# 🧠 Zihin Antrenmanı

Lumosity tarzında, hafıza, dikkat, hız ve mantık becerilerini geliştirmeye yönelik basit ve modüler bir zeka oyunları platformu. Yeni oyunlar kolayca eklenebilecek şekilde tasarlanmıştır.

## ✨ Özellikler

- 🎮 Modüler oyun sistemi — her oyun bağımsız bir bileşen, ortak bir arayüz üzerinden skor ve süre yönetimi paylaşıyor
- 👤 Basit kullanıcı sistemi — isim girerek oyun sonuçlarını kaydetme
- 📊 Skor geçmişi ve ilerleme takibi
- 🗂️ `games.json` üzerinden merkezi oyun kaydı — yeni oyun eklerken sadece bu dosyaya kayıt eklemek yeterli

### Oyunlar

| Oyun | Kategori | Açıklama |
|---|---|---|
| Hafıza Kartları | Hafıza | Kartları eşleştirerek hafızanı test et |
| Reaksiyon Süresi | Hız | Ekranda renk değiştiğinde en hızlı şekilde tepki ver |
| Sayı Dizisi | Hafıza | Artan uzunlukta sayı dizilerini hatırla ve tekrarla |
| Sayı Zinciri | Mantık | Kısa süreliğine gösterilen işlem zincirinin sonucunu bul |
| Örüntü Kırıcı | Mantık | Şekil/renk dizisindeki bir sonraki elemanı tahmin et |
| Labirent Avcısı | Dikkat / Hız | Pac-Man tarzı, seviye arttıkça zorlaşan labirent oyunu |

## 🛠️ Teknoloji

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Veritabanı:** SQLite

## 🚀 Kurulum

```bash
# Depoyu klonla
git clone <repo-url>
cd <proje-klasoru>

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` üzerinde çalışır.

```bash
# Production build almak için
npm run build

# Build'i önizlemek için
npm run preview
```

## 📁 Proje Yapısı

```
/games
  /hafiza-kartlari
  /reaksiyon-suresi
  /sayi-dizisi
  ...
  games.json        # Oyun kayıt dosyası
/src
  /components        # Ortak bileşenler (kart, sayaç, skor tablosu vb.)
  /pages              # Sayfa bileşenleri
/server
  index.js            # Express sunucusu
  db.js               # SQLite bağlantısı
```

## ➕ Yeni Oyun Ekleme

1. `/games/oyun-adi/` altında yeni bir klasör oluştur
2. Ortak `Game` arayüzünü (skor kaydetme, süre tutma vb.) kullanarak oyun bileşenini yaz
3. `games.json` dosyasına oyunun kaydını ekle — ana sayfa otomatik olarak güncellenir

```json
{
  "id": "oyun-adi",
  "title": "Oyun Başlığı",
  "category": "hafiza",
  "path": "/games/oyun-adi"
}
```

## 📌 Notlar

Bu proje bir yan proje / kişisel geliştirme çalışmasıdır. Amaç, basit bir konseptin adım adım nasıl geliştirilip özgünleştirilebileceğini deneyimlemektir.

## 📄 Lisans

MIT
