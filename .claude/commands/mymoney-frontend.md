---
description: myMoney-frontend mimari rehberi + scaffold asistanını etkinleştir (RTK Query, DTO namespace, ApiUrl enum, i18n senkronu, review checklist)
argument-hint: "[scaffold <domain> | review | kural <konu> | serbest istek]"
---

Bu projede (`myMoney-frontend` — Vite + React + TypeScript bütçe kontrol uygulaması) çalışıyorsun. Aşağıdaki komutu `.claude/skills/mymoney-frontend/SKILL.md` içindeki mimari kurallara ve scaffold akışına **tam uyarak** yürüt.

## Kullanıcı isteği

$ARGUMENTS

## Yapılacaklar

1. **Önce** `.claude/skills/mymoney-frontend/SKILL.md` dosyasını oku — skill'deki Golden Rules, scaffold adımları, review checklist ve anti-pattern listesi bu görevin çerçevesidir.
2. İsteği sınıflandır:
   - **scaffold** (yeni domain / CRUD / sayfa / endpoint ekleme) → SKILL.md Bölüm 3'teki 11 adımı sıralı uygula, her adımda ilgili referans dosyayı (Bölüm 12) taklit et.
   - **review** → SKILL.md Bölüm 9 checklist'ini `git diff` üzerinde çalıştır, maddeleri ✅/❌ olarak raporla.
   - **kural sorusu** → İlgili bölümü özetle, örnek dosya+satır referansı ver.
   - **serbest istek** → Golden Rules'u ihlal etmeden uygula; emin olmadığın her noktada Architect'e sor.
3. Büyük değişikliklerde **önce plan özeti** ver, Architect onayı al (global CLAUDE.md kuralı).
4. Her adım bitince tek cümle özet geç; "Rapor ver" denirse global CLAUDE.md rapor formatını kullan.
5. Türkçe yanıt, İngilizce yorum/kod.

Argüman boşsa: SKILL.md'yi oku ve kullanıcıya ne yapmak istediğini sor (scaffold / review / kural sorusu).
