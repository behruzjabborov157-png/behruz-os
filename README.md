# BEHRUZ OS — telefon (APK) va kompyuter (.exe) ilovasi

Bu papkada BEHRUZ OS ilovasi va uni avtomatik yigʻuvchi sozlamalar bor.
Siz faqat papkani GitHub'ga yuklaysiz — GitHub oʻz serverlarida **bepul**
quyidagilarni tayyorlab beradi:

| Fayl | Qayerga |
|---|---|
| `BEHRUZ-OS.apk` | Android telefon |
| `BEHRUZ-OS-Setup-1.0.x.exe` | Windows kompyuter (oʻrnatiladi) |
| `BEHRUZ-OS-Portable-1.0.x.exe` | Windows kompyuter (oʻrnatmasdan, fleshkadan ham ishlaydi) |
| Veb-ilova havolasi | iPhone, Mac yoki istalgan brauzer (ixtiyoriy) |

Ilova toʻliq **internetsiz** ishlaydi. Maʼlumotlar qurilmaning oʻzida saqlanadi.

---

## 0. Avval: eski maʼlumotlarni saqlab oling (muhim!)

claude.ai'dagi versiyada kiritgan maʼlumotlaringiz ilovaga oʻzi oʻtmaydi.

1. claude.ai'da BEHRUZ OS'ni oching → **Sozlamalar** → **Zaxira nusxa (JSON)**.
2. `behruz-os-zaxira-....json` faylini saqlang.
3. Ilovani oʻrnatgach: **Sozlamalar** → **Zaxiradan tiklash** → shu faylni tanlang.

---

## 1. GitHub'ga yuklash (bir marta, ~5 daqiqa)

1. <https://github.com> da roʻyxatdan oʻting (bepul).
2. Oʻng yuqorida **+** → **New repository**.
   - Nomi: `behruz-os`
   - **Public** ni tanlang (bepul Actions va veb-ilova uchun).
   - **Create repository**.
3. Ochilgan sahifada **uploading an existing file** havolasini bosing.
4. Shu papkaning **ichidagi hamma narsani** (papkaning oʻzini emas) sudrab tashlang:
   `www`, `electron`, `assets`, `build`, `keystore`, `.github`, `package.json`, `capacitor.config.json`, `README.md`, `.gitignore`.
   > ⚠️ `.github` papkasi koʻrinmasligi mumkin (nuqta bilan boshlangani uchun yashirin).
   > Windows: Explorer → **View → Hidden items** ni yoqing.
   > Mac: Finder'da **Cmd + Shift + .** bosing.
   > Bu papka boʻlmasa, avtomatik yigʻish ishlamaydi.
5. **Commit changes** bosing.

## 2. Tayyor fayllarni yuklab olish

1. Repozitoriyda **Actions** boʻlimiga oʻting — “Ilovalarni yigʻish” ishlayotganini koʻrasiz (~8–12 daqiqa).
2. Yashil ✅ belgisi chiqqach, repozitoriy bosh sahifasining oʻng tomonida **Releases** → eng yangisi.
3. U yerdan `BEHRUZ-OS.apk` va `.exe` fayllarni yuklab oling.

Keyinchalik ilovani oʻzgartirsangiz (masalan `www/` ichidagi fayllarni yangilasangiz),
GitHub yangi versiyani oʻzi yigʻib, yangi Release chiqaradi.

---

## 3. Telefonga oʻrnatish (Android)

1. `BEHRUZ-OS.apk` ni telefonda yuklab oling (yoki kompyuterdan Telegram orqali oʻzingizga yuboring).
2. Faylni oching. “Nomaʼlum manbalardan oʻrnatish” soʻralsa → **Sozlamalar** → ruxsat bering.
3. **Oʻrnatish**. Play Protect ogohlantirsa → **Baribir oʻrnatish**
   (ilova Play Market'dan emasligi uchun shunday chiqadi).

Yangi versiyani ustidan oʻrnatsangiz, maʼlumotlar saqlanib qoladi.

## 4. Kompyuterga oʻrnatish (Windows)

1. `BEHRUZ-OS-Setup-....exe` ni ishga tushiring.
2. “Windows protected your PC” chiqsa → **More info** → **Run anyway**
   (ilova pullik sertifikat bilan imzolanmagani uchun chiqadi).
3. Ish stolida **BEHRUZ OS** belgisi paydo boʻladi.

Tugmalar: **F11** — toʻliq ekran, **F5** — yangilash.

## 5. iPhone yoki Mac uchun (ixtiyoriy) — veb-ilova

iPhone uchun APK ishlamaydi, lekin veb-ilova sifatida oʻrnatsa boʻladi:

1. Repozitoriyda **Settings → Pages → Source: GitHub Actions** ni tanlang.
2. **Actions** → “Ilovalarni yigʻish” → **Run workflow**.
3. Manzil: `https://<github-login>.github.io/behruz-os/`
4. iPhone Safari'da oching → **Ulashish** → **Bosh ekranga qoʻshish**.
   Kompyuterda Chrome/Edge'da manzil satridagi **Oʻrnatish** belgisi.

---

## Muhim eslatmalar

- **Telefon va kompyuter avtomatik sinxronlanmaydi.** Har bir qurilmada maʼlumot alohida.
  Koʻchirish uchun: bir qurilmada **Zaxira nusxa** → faylni ikkinchisiga yuboring → **Zaxiradan tiklash**
  (bu ikkinchi qurilmadagi maʼlumotni almashtiradi).
- Vaqti-vaqti bilan zaxira nusxa olib turing — ilova oʻchirilsa, maʼlumot ham oʻchadi.
- `keystore/behruz-os.jks` — APK imzosi. Uni oʻchirmang: shu kalit boʻlmasa,
  yangi versiyani eskisining ustidan oʻrnatib boʻlmaydi.

## Papka tuzilishi

```
www/                 ilovaning oʻzi (HTML + JS)
electron/main.js     kompyuter ilovasi oynasi
assets/, build/      belgilar (ikonka) va ochilish ekrani
keystore/            Android imzo kaliti
.github/workflows/   GitHub'da avtomatik yigʻish
```
