/**
 * Kalutara Tuk-Tuk & Van Tours — Main JavaScript
 * Handles Bilingual Translations (EN/RU), Tour Filters, FAQ Accordion,
 * Mobile Navigation, and WhatsApp Booking Integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentLang = localStorage.getItem('kalutara_lang') || 'en';
  let translations = {};

  // Config: Driver Phone / WhatsApp Number
  const WHATSAPP_NUMBER = '94771234567'; // Replace with driver's actual number
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

  // Load Translations (supports offline file:// protocol + fetch fallback)
  async function loadTranslations(lang) {
    // 1. Check pre-bundled window.LOCAL_TRANSLATIONS first (works 100% locally and on file://)
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
      if (val) {
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
      if (val) {
        el.placeholder = val;
      }
    });

    // Update html lang attribute
    document.documentElement.lang = lang;
    localStorage.setItem('kalutara_lang', lang);
    currentLang = lang;
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
        const category = card.dataset.category;
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
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close all others
      faqItems.forEach(i => i.classList.remove('active'));
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Interactive Quick Tour Booking Links (passes tour title to WhatsApp)
  document.querySelectorAll('.book-tour-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tourTitle = btn.dataset.tour || 'Sri Lanka Tour';
      const isRu = currentLang === 'ru';
      const greeting = isRu 
        ? `Здравствуйте! Хочу узнать подробнее и заказать экскурсию: "${tourTitle}".` 
        : `Hello! I would like to inquire about and book the "${tourTitle}" from Kalutara.`;
      
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(greeting)}`;
      window.open(url, '_blank');
    });
  });

  // Main Inquiry Form Submission via WhatsApp
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('formName').value.trim();
      const hotel = document.getElementById('formHotel').value.trim();
      const tour = document.getElementById('formTour').value;
      const vehicle = document.getElementById('formVehicle').value;
      const dates = document.getElementById('formDates').value.trim();
      const travelers = document.getElementById('formTravelers').value.trim();
      const notes = document.getElementById('formMessage').value.trim();

      const isRu = currentLang === 'ru';

      let message = '';
      if (isRu) {
        message = `🌴 *Новая заявка на экскурсию (Калутара)* 🇱🇰\n\n` +
          `👤 *Имя:* ${name}\n` +
          `🏨 *Отель:* ${hotel || 'Не указан'}\n` +
          `🗺️ *Экскурсия:* ${tour}\n` +
          `🛺 *Транспорт:* ${vehicle}\n` +
          `📅 *Дата:* ${dates || 'Уточняется'}\n` +
          `👥 *Кол-во человек:* ${travelers || '2'}\n` +
          (notes ? `💬 *Пожелания:* ${notes}\n` : '') +
          `\nЗдравствуйте! Подскажите, пожалуйста, стоимость и свободные даты.`;
      } else {
        message = `🌴 *New Tour Inquiry (Kalutara)* 🇱🇰\n\n` +
          `👤 *Name:* ${name}\n` +
          `🏨 *Hotel/Location:* ${hotel || 'Not specified'}\n` +
          `🗺️ *Tour:* ${tour}\n` +
          `🛺 *Vehicle:* ${vehicle}\n` +
          `📅 *Dates:* ${dates || 'Flexible'}\n` +
          `👥 *Travelers:* ${travelers || '2'}\n` +
          (notes ? `💬 *Notes:* ${notes}\n` : '') +
          `\nHello! Please let me know availability and pricing for this tour.`;
      }

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // Initial Load
  loadTranslations(currentLang);
});
