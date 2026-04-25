# 💪 Treenipäiväkirja

Henkilökohtainen treenipäiväkirja PWA — toimii iPhonella kuin natiivi app.

## GitHub Pages -deploy (suositeltu)

### 1. Luo repo GitHubissa
- Mene github.com → New repository
- Nimi: `treenipaiva` (tärkeää — vastaa vite.config.js base-polkua)
- Visibility: Private
- **Älä** lisää README tai .gitignore

### 2. Push koodi GitHubiin
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KÄYTTÄJÄNIMI/treenipaiva.git
git push -u origin main
```

### 3. Ota GitHub Pages käyttöön
- Repo → **Settings** → **Pages**
- Source: **GitHub Actions**
- Tallenna

### 4. Deploy käynnistyy automaattisesti
- Seuraa edistymistä: repo → **Actions**-välilehti
- Valmis ~1 minuutissa
- URL: `https://KÄYTTÄJÄNIMI.github.io/treenipaiva/`

### 5. Lisää iPhoneen
1. Avaa URL Safarissa
2. Jaa ⬆️ → **Lisää kotinäytölle**
3. Valmis 🎉

---

## Paikallinen kehitys

```bash
npm install
npm run dev
```

## ⚠️ Repo nimen vaihto
Jos nimeät repon eri nimellä kuin `treenipaiva`, päivitä `vite.config.js`:
```js
base: '/UUSI-NIMI/',
```
