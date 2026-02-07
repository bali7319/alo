# Kakeibo Offline (Windows Desktop)

Bu klasör, **yerel bilgisayarda offline çalışacak** basit bir masaüstü uygulamasıdır.

- **Teknoloji**: Electron + Vite + React + TypeScript
- **Veri**: IndexedDB (Dexie) — internet gerektirmez, veriler cihazda kalır

## Çalıştırma (Geliştirme)

```bash
cd desktop-kakeibo
npm install
npm run dev
```

## Paketleme (Windows .exe installer)

```bash
cd desktop-kakeibo
npm run dist
```

Çıktı: `desktop-kakeibo/release/` altında NSIS installer.

### Masaüstü simgesi (kısayol)

Installer’ı çalıştırınca otomatik olarak:
- **Başlat Menüsü** kısayolu
- **Masaüstü** kısayolu

oluşturulur. Masaüstündeki **Kakeibo Offline** simgesine tıklayınca uygulama açılır.

### Uygulama ikonu (özel simge)

Repo içinde bir şablon ikon var: `desktop-kakeibo/build/icon.svg`.

Windows için `.ico` gerekiyor. Şu dosyayı üretip buraya koy:
- `desktop-kakeibo/build/icon.ico`

Sonra:
- **Kısayol ikonu** için: `scripts\\create-desktop-shortcut.cmd` (kısayolu yeniden oluşturur)
- **EXE/Installer ikonu** için: `npm run dist` (Developer Mode / Admin gerekebilir)

#### Eğer `npm run dist` hata verirse (Windows symlink yetkisi)

Bazı Windows kurulumlarında `electron-builder` paketler indirirken **symlink oluşturma izni** isteyip hata verebilir.
Çözüm:
- **Windows Developer Mode** açın (önerilen) veya terminali **Yönetici** olarak çalıştırın, sonra tekrar `npm run dist` deneyin. (örn. açıklama: [StackOverflow](https://stackoverflow.com/questions/78989469/error-creating-symbolic-links-during-electron-build))

#### Installer olmadan masaüstü kısayolu (hemen)

`release/win-unpacked/Kakeibo Offline.exe` zaten oluştuysa, masaüstü kısayolunu otomatik oluşturmak için:

```bat
cd desktop-kakeibo
scripts\\create-desktop-shortcut.cmd
```

## Uygulama özellikleri (şu an)

- Kayıt / giriş (yerel hesap)
- Sözleşme kabul checkbox’ı
- Gelir / gider ekleme
- Kayıtları listeleme + silme
- Gelir / gider / bakiye toplamları

## Not

Bu proje **offline** tasarlandı: dışarıya API çağrısı yapmaz.
