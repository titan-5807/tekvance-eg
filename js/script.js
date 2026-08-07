/* =========================================================
   TEKVANCE — script.js
   PHONE-FIX-V2 (keydown + input dual-layer digit enforcement)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hide'), 300);
    });
    setTimeout(() => preloader.classList.add('hide'), 1500);
  }

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    if (window.scrollY > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('mainNav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
    });
  });

  /* ---------- Language toggle (EN / AR) ---------- */
  const langToggle = document.getElementById('langToggle');
  const langLabel = document.getElementById('langLabel');
  const htmlRoot = document.getElementById('htmlRoot');
  const bilingualEls = document.querySelectorAll('[data-en][data-ar]');

  function setLanguage(lang) {
    bilingualEls.forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text !== null) el.textContent = text;
    });
    if (lang === 'ar') {
      htmlRoot.setAttribute('lang', 'ar');
      htmlRoot.setAttribute('dir', 'rtl');
      langLabel.textContent = 'English';
    } else {
      htmlRoot.setAttribute('lang', 'en');
      htmlRoot.setAttribute('dir', 'ltr');
      langLabel.textContent = 'العربية';
    }
    localStorage.setItem('tekvance_lang', lang);
    if (typeof updatePhoneHint === 'function') updatePhoneHint();
  }

  langToggle.addEventListener('click', () => {
    const current = htmlRoot.getAttribute('lang') === 'ar' ? 'ar' : 'en';
    setLanguage(current === 'ar' ? 'en' : 'ar');
  });

  // Restore saved language preference
  const savedLang = localStorage.getItem('tekvance_lang');
  if (savedLang) setLanguage(savedLang);

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    '.vm-card, .service-card, .process-step, .info-card, .floating-card, .about-visual, .why-content, .contact-form, .project-card'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('.num');
  let countersStarted = false;

  function animateCounters() {
    if (countersStarted) return;
    countersStarted = true;
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = current;
      }, 25);
    });
  }

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(heroStats);
  }

  /* ---------- Projects filter (Projects page only) ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        projectCards.forEach(card => {
          const cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---------- Contact form validation and Formspree submit ---------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const submitBtn = document.getElementById('submitBtn');
  const nameInput = document.getElementById('nameInput');
  const emailInput = document.getElementById('emailInput');
  const countryCode = document.getElementById('countryCode');
  const phoneInputCC = document.getElementById('phoneInput');
  const phoneHint = document.getElementById('phoneHint');
  const phoneFull = document.getElementById('phoneFull');
  const messageInput = document.getElementById('messageInput');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');
  const messageError = document.getElementById('messageError');

  const countryRules = {
    '20':  { digits: 10, startsWith: ['1'], label: 'Egypt' },
    '966': { digits: 9,  startsWith: ['5'], label: 'Saudi Arabia' },
    '971': { digits: 9,  startsWith: ['5'], label: 'UAE' },
    '965': { digits: 8,  startsWith: [], label: 'Kuwait' },
    '974': { digits: 8,  startsWith: [], label: 'Qatar' },
    '973': { digits: 8,  startsWith: [], label: 'Bahrain' },
    '968': { digits: 8,  startsWith: [], label: 'Oman' },
    '962': { digits: 9,  startsWith: ['7'], label: 'Jordan' },
    '964': { digits: 10, startsWith: ['7'], label: 'Iraq' },
    '218': { digits: 9,  startsWith: ['9'], label: 'Libya' },
    '1':   { digits: 10, startsWith: [], label: 'USA/Canada' },
    '44':  { digits: 10, startsWith: ['7'], label: 'United Kingdom' }
  };

  function isArabic() {
    return htmlRoot && htmlRoot.getAttribute('lang') === 'ar';
  }

  function setFieldError(input, errorEl, valid, message) {
    if (errorEl) errorEl.textContent = (!valid && message) ? message : '';
    if (input) {
      input.classList.toggle('is-invalid', !valid);
      input.setAttribute('aria-invalid', !valid ? 'true' : 'false');
    }
  }

  const NAME_CHAR_RE = /[^A-Za-z\u0600-\u06FF\s]/g;

  function cleanName(value) {
    return value
      .replace(NAME_CHAR_RE, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s+/, '')
      .slice(0, 50);
  }

  function validateName(showMessage = true) {
    if (!nameInput) return true;
    nameInput.value = cleanName(nameInput.value);
    const value = nameInput.value.trim();
    // Require a clear full name: at least two words, letters only, each word 2-25 chars
    const wordRe = /^[A-Za-z\u0600-\u06FF]{2,25}(?:\s[A-Za-z\u0600-\u06FF]{2,25})+$/;
    const valid = wordRe.test(value) && value.length >= 3 && value.length <= 50;
    const message = isArabic()
      ? 'من فضلك أدخل اسمًا واضحًا (اسم أول واسم عائلة على الأقل)، حروف عربي أو إنجليزي فقط بدون أرقام أو رموز.'
      : 'Please enter a clear full name (first and last name), letters only, no digits or symbols.';
    setFieldError(nameInput, nameError, valid, showMessage ? message : '');
    return valid;
  }

  const EMAIL_CHAR_RE = /[^A-Za-z0-9._%+\-@]/g;

  function cleanEmail(value) {
    return value.replace(EMAIL_CHAR_RE, '').slice(0, 100);
  }

  function validateEmail(showMessage = true) {
    if (!emailInput) return true;
    emailInput.value = cleanEmail(emailInput.value);
    const value = emailInput.value;
    const valid = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/.test(value);
    const message = isArabic()
      ? 'من فضلك أدخل بريد إلكتروني صحيح مثل example@email.com (حروف وأرقام إنجليزية فقط).'
      : 'Please enter a valid email address like example@email.com.';
    setFieldError(emailInput, emailError, valid, showMessage ? message : '');
    return valid;
  }

  function getPhoneRule() {
    if (!countryCode) return { digits: 10, startsWith: [] };
    const code = countryCode.value;
    const selected = countryCode.options[countryCode.selectedIndex];
    const htmlDigits = selected ? parseInt(selected.getAttribute('data-digits'), 10) : 10;
    return countryRules[code] || { digits: htmlDigits || 10, startsWith: [] };
  }

  function updatePhoneHint() {
    if (!countryCode || !phoneHint) return;
    const rule = getPhoneRule();
    phoneHint.textContent = isArabic()
      ? `أدخل ${rule.digits} أرقام فقط بدون كود الدولة وبدون الصفر في البداية`
      : `Enter ${rule.digits} digits only, without country code or leading 0`;
    if (phoneInputCC) phoneInputCC.setAttribute('maxlength', String(rule.digits));
  }

  function updateFullPhone() {
    if (!countryCode || !phoneInputCC || !phoneFull) return;
    phoneFull.value = phoneInputCC.value ? `+${countryCode.value}${phoneInputCC.value}` : '';
  }

  // يحوّل الأرقام العربية (٠-٩) والفارسية (۰-۹) إلى أرقام إنجليزية عادية قبل الفحص
  function normalizePhoneDigits(value) {
    return value
      .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0));
  }

  function validatePhone(showMessage = true) {
    if (!phoneInputCC || !countryCode) return true;
    const rule = getPhoneRule();
    // يشيل أي حرف أو رمز مش رقم، ويقص الزيادة على حسب عدد أرقام الدولة المختارة
    const normalized = normalizePhoneDigits(phoneInputCC.value);
    phoneInputCC.value = normalized.replace(/[^0-9]/g, '').slice(0, rule.digits);
    const value = phoneInputCC.value;
    const hasRightLength = value.length === rule.digits;
    const hasRightStart = !rule.startsWith.length || rule.startsWith.some(prefix => value.startsWith(prefix));
    const valid = hasRightLength && hasRightStart;
    const message = isArabic()
      ? `رقم الهاتف يجب أن يكون ${rule.digits} أرقام بالظبط، أرقام فقط، ${rule.startsWith.length ? 'ويبدأ بـ ' + rule.startsWith.join(' أو ') : ''}`
      : `Phone number must be exactly ${rule.digits} digits, numbers only${rule.startsWith.length ? ', starting with ' + rule.startsWith.join(' or ') : ''}.`;
    setFieldError(phoneInputCC, phoneError, valid, showMessage ? message : '');
    updateFullPhone();
    return valid;
  }

  function sanitizeMessage(value) {
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000);
  }

  function validateMessage(showMessage = true) {
    if (!messageInput) return true;
    messageInput.value = sanitizeMessage(messageInput.value);
    const valid = messageInput.value.length >= 10 && messageInput.value.length <= 1000;
    const message = isArabic()
      ? 'الرسالة يجب ألا تقل عن 10 أحرف ولا تزيد عن 1000 حرف.'
      : 'Message must be between 10 and 1000 characters.';
    setFieldError(messageInput, messageError, valid, showMessage ? message : '');
    return valid;
  }

  /* ---- Name field: block invalid keystrokes AND strip on input/paste, real-time red border ---- */
  if (nameInput) {
    nameInput.addEventListener('beforeinput', (e) => {
      if (e.data && NAME_CHAR_RE.test(e.data)) e.preventDefault();
    });
    nameInput.addEventListener('keypress', (e) => {
      if (e.key && e.key.length === 1 && NAME_CHAR_RE.test(e.key)) e.preventDefault();
    });
    nameInput.addEventListener('input', () => validateName(true));
    nameInput.addEventListener('paste', () => setTimeout(() => validateName(true), 0));
    nameInput.addEventListener('blur', () => validateName(true));
  }

  /* ---- Email field: block invalid keystrokes AND strip on input/paste, real-time red border ---- */
  if (emailInput) {
    emailInput.addEventListener('beforeinput', (e) => {
      if (e.data && EMAIL_CHAR_RE.test(e.data)) e.preventDefault();
    });
    emailInput.addEventListener('keypress', (e) => {
      if (e.key && e.key.length === 1 && EMAIL_CHAR_RE.test(e.key)) e.preventDefault();
    });
    emailInput.addEventListener('input', () => validateEmail(true));
    emailInput.addEventListener('paste', () => setTimeout(() => validateEmail(true), 0));
    emailInput.addEventListener('blur', () => validateEmail(true));
  }

  /* ---- Phone field: digits only, hard-capped to the exact country digit count, real-time red border ----
     طبقة حماية مزدوجة:
     1) keydown: يمنع كتابة أي حرف/رمز فورًا قبل ما يظهر في الخانة، ويمنع تجاوز العدد المطلوب من الأرقام.
     2) input: شبكة أمان تشتغل مهما كان مصدر التغيير (لصق، سحب وإفلات، إكمال تلقائي، كيبورد الموبايل،
        أرقام عربية ١٢٣) وتشيل فورًا أي حرف مش رقم وتقص أي رقم زيادة عن المطلوب. ---- */
  if (countryCode && phoneInputCC) {
    phoneInputCC.setAttribute('inputmode', 'numeric');
    phoneInputCC.setAttribute('pattern', '[0-9]*');
    phoneInputCC.setAttribute('autocomplete', 'tel-national');

    phoneInputCC.addEventListener('keydown', (e) => {
      const allowedKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'];
      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;
      // يسمح فقط بأرقام إنجليزية (0-9) أو أرقام عربية (٠-٩)
      const isDigitKey = /^[0-9٠-٩]$/.test(e.key);
      if (!isDigitKey) {
        e.preventDefault();
        return;
      }
      const rule = getPhoneRule();
      const selectionLength = (phoneInputCC.selectionEnd || 0) - (phoneInputCC.selectionStart || 0);
      const currentDigitCount = normalizePhoneDigits(phoneInputCC.value).replace(/[^0-9]/g, '').length;
      const nextDigitCount = currentDigitCount - selectionLength + 1;
      if (nextDigitCount > rule.digits) {
        e.preventDefault();
      }
    });

    phoneInputCC.addEventListener('input', () => validatePhone(true));
    phoneInputCC.addEventListener('paste', () => setTimeout(() => validatePhone(true), 0));
    phoneInputCC.addEventListener('drop', () => setTimeout(() => validatePhone(true), 0));
    phoneInputCC.addEventListener('blur', () => validatePhone(true));
    countryCode.addEventListener('change', () => {
      phoneInputCC.value = '';
      setFieldError(phoneInputCC, phoneError, true, '');
      updatePhoneHint();
      updateFullPhone();
    });
    updatePhoneHint();
    updateFullPhone();
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => validateMessage(true));
    messageInput.addEventListener('blur', () => validateMessage(true));
  }

  window.updatePhoneHint = updatePhoneHint;
  window.validateTekvancePhone = () => validatePhone(true);

  if (contactForm) {
    contactForm.setAttribute('novalidate', 'novalidate');
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const endpoint = contactForm.getAttribute('action');
      const okName = validateName(true);
      const okPhone = validatePhone(true);
      const okEmail = validateEmail(true);
      const okMessage = validateMessage(true);

      if (!okName || !okPhone || !okEmail || !okMessage) {
        formNote.textContent = isArabic()
          ? '⚠️ برجاء تصحيح الحقول المظللة قبل إرسال الرسالة.'
          : '⚠️ Please correct the highlighted fields before sending.';
        formNote.className = 'form-note error';
        return;
      }

      if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
        formNote.textContent = isArabic()
          ? '⚠️ رابط Formspree غير موجود داخل نموذج الإرسال.'
          : '⚠️ Formspree endpoint is missing in the form action attribute.';
        formNote.className = 'form-note error';
        return;
      }

      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = isArabic() ? 'جارٍ الإرسال...' : 'Sending...';

      try {
        const formData = new FormData(contactForm);
        formData.set('name', nameInput.value.trim());
        formData.set('email', emailInput.value.trim());
        formData.set('phone', phoneFull.value);
        formData.set('message', messageInput.value.trim());

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error('Submission failed with status ' + response.status);

        formNote.textContent = isArabic()
          ? '✅ تم استلام رسالتك بنجاح، سنتواصل معك في أقرب وقت.'
          : '✅ Your message has been sent successfully. We will contact you shortly.';
        formNote.className = 'form-note success';
        contactForm.reset();
        setFieldError(nameInput, nameError, true, '');
        setFieldError(emailInput, emailError, true, '');
        setFieldError(phoneInputCC, phoneError, true, '');
        setFieldError(messageInput, messageError, true, '');
        updatePhoneHint();
        updateFullPhone();
      } catch (err) {
        console.error('Form submission error:', err);
        formNote.textContent = isArabic()
          ? '❌ حدث خطأ أثناء الإرسال، برجاء المحاولة مرة أخرى أو التواصل عبر الهاتف.'
          : '❌ Something went wrong. Please try again or contact us by phone.';
        formNote.className = 'form-note error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  /* ---------- Animated network canvas (hero) ---------- */
  const canvas = document.getElementById('networkCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    function initParticles() {
      const count = Math.min(70, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.6
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(62,198,255,${0.16 * (1 - dist / 140)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100,209,255,0.8)';
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });
  }

});
