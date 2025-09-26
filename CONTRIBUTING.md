# Contributing to AI Music Detection Platform

Öncelikle bu projeye katkıda bulunmak istediğiniz için teşekkür ederiz! Her türlü katkı değerlidir ve memnuniyetle kabul edilir.

## 🤝 Katkı Türleri

Aşağıdaki şekillerde katkıda bulunabilirsiniz:

- 🐛 Bug raporları
- ✨ Yeni özellik önerileri
- 📝 Dokümantasyon iyileştirmeleri
- 🔧 Kod katkıları
- 🧪 Test yazımı
- 🌐 Çeviri desteği

## 🚀 Başlangıç

### Gereksinimler

- Node.js 20.18.1 LTS veya üstü
- npm 10.9.2 veya üstü
- Git

### Projeyi Fork'layın

1. GitHub üzerinde projeyi fork'layın
2. Fork'ladığınız repoyu klonlayın:
```bash
git clone https://github.com/your-username/ai-music-platform.git
cd ai-music-platform
```

3. Upstream repository'yi ekleyin:
```bash
git remote add upstream https://github.com/hasanarthuraltuntas/ai-music-platform.git
```

### Geliştirme Ortamını Kurun

1. Dependencies'leri yükleyin:
```bash
# Frontend dependencies
cd frontend && npm install

# Backend dependencies
cd ../backend && npm install
```

2. Environment dosyalarını oluşturun:
```bash
cp .env.example .env.local
```

3. Development serverları başlatın:
```bash
# Frontend (http://localhost:3000)
cd frontend && npm run dev

# Backend (http://localhost:3001)
cd backend && npm run dev
```

## 🔧 Geliştirme Süreci

### Branch Strategy

- `main`: Production branch
- `develop`: Development branch
- `feature/feature-name`: Yeni özellikler için
- `bugfix/issue-description`: Bug düzeltmeleri için
- `hotfix/critical-fix`: Kritik düzeltmeler için

### Kod Yazma Kuralları

#### JavaScript/TypeScript
- ESLint ve Prettier yapılandırmasına uyun
- TypeScript strict mode kullanın
- JSDoc comentleri ekleyin
- Test yazın

#### Commit Mesajları
Conventional Commits formatını kullanın:

```
feat: add new music analysis algorithm
fix: resolve audio upload timeout issue
docs: update API documentation
test: add unit tests for audio processing
```

#### Kod Stili
```bash
# Lint kontrolü
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check
```

## 🧪 Testing

### Test Çalıştırma
```bash
# Unit testler
npm run test

# Integration testler
npm run test:integration

# E2E testler
npm run test:e2e

# Coverage raporu
npm run test:coverage
```

### Test Yazma Kuralları
- Her yeni özellik için test yazın
- Minimum %80 kod coverage hedefleyin
- Edge case'leri test edin
- Mock'ları uygun şekilde kullanın

## 📝 Pull Request Süreci

### PR Oluşturmadan Önce
1. Latest develop branch'ini pull edin:
```bash
git checkout develop
git pull upstream develop
```

2. Feature branch'inizi oluşturun:
```bash
git checkout -b feature/amazing-feature
```

3. Değişikliklerinizi yapın ve commit edin:
```bash
git add .
git commit -m "feat: add amazing feature"
```

4. Branch'inizi push edin:
```bash
git push origin feature/amazing-feature
```

### PR Template
Pull request oluştururken şu template'i kullanın:

```markdown
## 📋 Description
Brief description of changes

## 🔄 Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## 📸 Screenshots (if applicable)

## 📝 Additional Notes
```

### Review Kriterleri
- Kod style guide'a uygun mu?
- Testler yazılmış mı?
- Dokümantasyon güncellenmiş mi?
- Performance impact'i var mı?
- Security açıkları var mı?

## 🐛 Bug Raporlama

Bug raporu oluştururken şu bilgileri ekleyin:

### Bug Report Template
```markdown
## 🐛 Bug Description
Clear description of the bug

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## 🎯 Expected Behavior
What should happen

## 📱 Environment
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node.js: [e.g. 20.18.1]
- npm: [e.g. 10.9.2]

## 📸 Screenshots
If applicable, add screenshots

## 📝 Additional Context
Any other context about the problem
```

## 💡 Feature Request

### Feature Request Template
```markdown
## 🚀 Feature Description
Clear description of the feature

## 🎯 Problem Statement
What problem does this solve?

## 💭 Proposed Solution
How should this feature work?

## 🔄 Alternatives Considered
What other solutions did you consider?

## 📝 Additional Context
Any other context or screenshots
```

## 📚 Dokümantasyon

### Dokümantasyon Kuralları
- Türkçe ve İngilizce versiyonları sağlayın
- Kod örnekleri ekleyin
- API değişikliklerini dokümante edin
- README'yi güncel tutun

### API Dokümantasyonu
- OpenAPI/Swagger formatını kullanın
- Request/response örnekleri ekleyin
- Error code'ları belgelendirin

## 🌐 Çeviri Desteği

Desteklenen diller:
- 🇹🇷 Türkçe (ana dil)
- 🇺🇸 İngilizce

Yeni dil desteği eklemek için:
1. `locales/` klasöründe yeni dil dosyası oluşturun
2. Tüm string'leri çevirin
3. Language selector'a yeni dili ekleyin

## 🔒 Security

### Güvenlik Açığı Bildirimi
Güvenlik açığı bulursanız:
1. **Public olarak bildirmeyin**
2. Email gönderin: security@hasanarthuraltuntas.xyz
3. Detaylı açıklama ekleyin
4. PoC ekleyin (varsa)

### Güvenlik Kuralları
- API key'leri commit etmeyin
- Environment variable'ları kullanın
- Input validation yapın
- SQL injection'a karşı korunun

## 📞 İletişim

- **GitHub Issues**: Bug ve feature request'ler için
- **GitHub Discussions**: Genel tartışmalar için
- **Email**: contact@hasanarthuraltuntas.xyz

## 🙏 Teşekkürler

Katkıda bulunan herkese teşekkür ederiz:

- Bug raporları için
- Feature önerileri için
- Kod katkıları için
- Dokümantasyon iyileştirmeleri için
- Community desteği için

## 📜 License

Bu projeye katkıda bulunarak, katkılarınızın MIT License altında lisanslanacağını kabul ediyorsunuz.

---

**Mutlu kodlamalar! 🚀**