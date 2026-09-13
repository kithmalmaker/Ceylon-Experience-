/**
 * Ceylon Experience — Main JavaScript
 * Handles 4-Language Translations (EN / RU / FR / DE), Tour Filters, FAQ Accordion,
 * Mobile Navigation, and Multilingual WhatsApp Booking Integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentLang = localStorage.getItem('ceylon_lang') || localStorage.getItem('kalutara_lang') || 'en';
  let translations = {};

  // Config: Driver Phone / WhatsApp Number
  const WHATSAPP_NUMBER = '94771234567'; // Driver WhatsApp number
  const CONTACT_EMAIL = 'kalutaratours@gmail.com';

  // DOM Elements
  const langButtons = document.querySelectorAll('.lang-btn');
  const navHamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  const tourFilterBtns = document.querySelectorAll('.filter-btn');
  const tourCards = document.querySelectorAll('.tour-card');
  const faqItems = document.querySelectorAll('.faq-item');
  const inquiryForm = document.getElementById('inquiryForm');
  const siteHeader = document.getElementById('siteHeader');

  // Load Translations (supports pre-bundled window.LOCAL_TRANSLATIONS + fetch fallback)
  async function loadTranslations(lang) {
    // 1. Check pre-bundled window.LOCAL_TRANSLATIONS first (instant on local file://, mobile & web)
    if (window.LOCAL_TRANSLATIONS && window.LOCAL_TRANSLATIONS[lang]) {
      translations[lang] = window.LOCAL_TRANSLATIONS[lang];
      applyTranslations(lang);
      return;
    }

    // 2. HTTP / Fetch fallback (for web servers / hosting)
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      translations[lang] = await response.json();
      applyTranslations(lang);
    } catch (error) {
      console.warn('Translation file fetch error (using fallback):', error);
      if (window.LOCAL_TRANSLATIONS && window.LOCAL_TRANSLATIONS[lang]) {
        translations[lang] = window.LOCAL_TRANSLATIONS[lang];
        applyTranslations(lang);
      }
    }
  }

  // Apply translations to DOM elements with data-i18n
  function applyTranslations(lang) {
    const data = translations[lang];
    if (!data) return;

    // Update active class on language toggle buttons
    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update all text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const keyPath = el.getAttribute('data-i18n').split('.');
      let val = data;
      for (const key of keyPath) {
        if (val && val[key] !== undefined) {
          val = val[key];
        } else {
          val = null;
          break;
        }
      }
      if (val !== null && val !== undefined) {
        el.textContent = val;
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const keyPath = el.getAttribute('data-i18n-placeholder').split('.');
      let val = data;
      for (const key of keyPath) {
        if (val && val[key] !== undefined) {
          val = val[key];
        } else {
          val = null;
          break;
        }
      }
      if (val !== null && val !== undefined) {
        el.placeholder = val;
      }
    });

    // Update html lang attribute
    document.documentElement.lang = lang;
    localStorage.setItem('ceylon_lang', lang);
    currentLang = lang;

    // Update SEO Meta Tags Dynamically
    if (data.seo) {
      if (data.seo.metaTitle) document.title = data.seo.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && data.seo.metaDescription) metaDesc.setAttribute('content', data.seo.metaDescription);
      const metaKw = document.querySelector('meta[name="keywords"]');
      if (metaKw && data.seo.metaKeywords) metaKw.setAttribute('content', data.seo.metaKeywords);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && data.seo.metaDescription) ogDesc.setAttribute('content', data.seo.metaDescription);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && data.seo.metaTitle) ogTitle.setAttribute('content', data.seo.metaTitle);
    }
  }

  // Language Switcher Event Listeners
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.lang;
      if (selected !== currentLang) {
        if (translations[selected]) {
          applyTranslations(selected);
        } else {
          loadTranslations(selected);
        }
      }
    });
  });

  // Mobile Hamburger Toggle
  if (navHamburger && navLinks) {
    navHamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      navHamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking nav links
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // Sticky Header Scroll Effect
  window.addEventListener('scroll', () => {
    if (siteHeader) {
      if (window.scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }
  });

  // Tour Filter Tabs
  tourFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tourFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      tourCards.forEach(card => {
        const category = card.dataset.category || '';
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // FAQ Accordion
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all others
        faqItems.forEach(i => i.classList.remove('active'));
        // Toggle current
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // Interactive Quick Tour Booking Links (passes tour title to WhatsApp in 4 languages)
  document.querySelectorAll('.book-tour-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tourTitle = btn.dataset.tour || 'Sri Lanka Tour';
      
      let greeting = '';
      if (currentLang === 'ru') {
        greeting = `Здравствуйте! Хочу узнать подробнее и заказать экскурсию: "${tourTitle}".`;
      } else if (currentLang === 'fr') {
        greeting = `Bonjour ! Je souhaite me renseigner et réserver l'excursion : "${tourTitle}".`;
      } else if (currentLang === 'de') {
        greeting = `Hallo! Ich möchte mich erkundigen und die folgende Tour buchen: "${tourTitle}".`;
      } else {
        greeting = `Hello! I would like to inquire about and book the "${tourTitle}" tour in Sri Lanka.`;
      }
      
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(greeting)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  // Main Inquiry Form Submission via WhatsApp in 4 languages
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Sanitize inputs (strip control chars, trim, enforce length bounds)
      const sanitize = (str, maxLen = 100) => (str || '').replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen);
      const name = sanitize(document.getElementById('formName').value, 100);
      const hotel = sanitize(document.getElementById('formHotel').value, 100);
      const tourSelect = document.getElementById('formTour');
      const tour = sanitize(tourSelect.options[tourSelect.selectedIndex]?.text || tourSelect.value, 100);
      const vehicleSelect = document.getElementById('formVehicle');
      const vehicle = sanitize(vehicleSelect.options[vehicleSelect.selectedIndex]?.text || vehicleSelect.value, 100);
      const dates = sanitize(document.getElementById('formDates').value, 50);
      const travelersRaw = parseInt(document.getElementById('formTravelers').value, 10);
      const travelers = isNaN(travelersRaw) || travelersRaw < 1 ? '2' : String(Math.min(travelersRaw, 25));
      const notes = sanitize(document.getElementById('formMessage').value, 1000);

      let message = '';
      if (currentLang === 'ru') {
        message = `🌴 *Новая заявка на экскурсию (Шри-Ланка)* 🇱🇰\n\n` +
          `👤 *Имя:* ${name}\n` +
          `🏨 *Отель/Локация:* ${hotel || 'Не указан'}\n` +
          `🗺️ *Экскурсия:* ${tour}\n` +
          `🛺 *Транспорт:* ${vehicle}\n` +
          `📅 *Дата:* ${dates || 'Уточняется'}\n` +
          `👥 *Кол-во человек:* ${travelers}\n` +
          (notes ? `💬 *Пожелания:* ${notes}\n` : '') +
          `\nЗдравствуйте! Подскажите, пожалуйста, стоимость и свободные даты.`;
      } else if (currentLang === 'fr') {
        message = `🌴 *Nouvelle demande d'excursion (Sri Lanka)* 🇱🇰\n\n` +
          `👤 *Nom:* ${name}\n` +
          `🏨 *Hôtel/Lieu:* ${hotel || 'Non précisé'}\n` +
          `🗺️ *Circuit:* ${tour}\n` +
          `🛺 *Véhicule:* ${vehicle}\n` +
          `📅 *Date(s):* ${dates || 'Flexible'}\n` +
          `👥 *Voyageurs:* ${travelers}\n` +
          (notes ? `💬 *Remarques:* ${notes}\n` : '') +
          `\nBonjour ! Merci de m'indiquer la disponibilité et le tarif pour cette excursion.`;
      } else if (currentLang === 'de') {
        message = `🌴 *Neue Tour-Anfrage (Sri Lanka)* 🇱🇰\n\n` +
          `👤 *Name:* ${name}\n` +
          `🏨 *Hotel/Ort:* ${hotel || 'Nicht angegeben'}\n` +
          `🗺️ *Tour:* ${tour}\n` +
          `🛺 *Fahrzeug:* ${vehicle}\n` +
          `📅 *Reisedatum:* ${dates || 'Flexibel'}\n` +
          `👥 *Personen:* ${travelers}\n` +
          (notes ? `💬 *Wünsche:* ${notes}\n` : '') +
          `\nHallo! Bitte teilen Sie mir Verfügbarkeit und Preis für diese Tour mit.`;
      } else {
        message = `🌴 *New Tour Inquiry (Sri Lanka)* 🇱🇰\n\n` +
          `👤 *Name:* ${name}\n` +
          `🏨 *Hotel/Location:* ${hotel || 'Not specified'}\n` +
          `🗺️ *Tour:* ${tour}\n` +
          `🛺 *Vehicle:* ${vehicle}\n` +
          `📅 *Dates:* ${dates || 'Flexible'}\n` +
          `👥 *Travelers:* ${travelers}\n` +
          (notes ? `💬 *Notes:* ${notes}\n` : '') +
          `\nHello! Please let me know availability and pricing for this tour.`;
      }

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Initial Load
  loadTranslations(currentLang);
});
