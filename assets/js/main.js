/* ============================================
   main.js — Damarcus Lett Personal Site

   Sections:
   1. DOM Ready Init
   2. Custom Cursor
   3. Navigation (scroll spy, hamburger, frosted glass)
   4. Theme Toggle
   5. Hero Particle Canvas
   6. Typing Animation
   7. Scroll Animations (Intersection Observer)
   8. Scroll Progress Bar
   9. Marquee (pause on hover — CSS handles animation)
   10. Forms (contact + newsletter)
   11. Animated Counters
   12. Magnetic Buttons
   13. Analytics Events
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     1. DOM Ready Init
     ============================================ */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initCursor();
    initNavigation();
    initThemeToggle();
    initParticleCanvas();
    initTypingAnimation();
    initScrollAnimations();
    initScrollProgress();
    initForms();
    initCounters();
    initMagneticButtons();
    initAnalytics();
    initFooterYear();
    initScheduleSection();
    initCompanyLogoLinks();
  }

  /* ============================================
     2. Custom Cursor
     ============================================ */
  function initCursor() {
    // Only enable on devices that support hover with fine pointer
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');

    if (!dot || !ring) return;

    var mouseX = 0;
    var mouseY = 0;
    var ringX = 0;
    var ringY = 0;
    var rafId = null;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = 'translate(' + (mouseX - 4) + 'px, ' + (mouseY - 4) + 'px)';
    }, { passive: true });

    function updateRing() {
      // Lerp for smooth trailing effect
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = 'translate(' + (ringX - 16) + 'px, ' + (ringY - 16) + 'px)';
      rafId = requestAnimationFrame(updateRing);
    }

    rafId = requestAnimationFrame(updateRing);

    // Expand ring on hoverable elements
    var hoverTargets = 'a, button, [role="button"], input, textarea, select, .glass-card, .btn-primary, .btn-ghost';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) {
        ring.classList.add('cursor-ring--hover');
        // Adjust size via inline style for hover state
        ring.style.width = '48px';
        ring.style.height = '48px';
        ring.style.marginLeft = '-24px';
        ring.style.marginTop = '-24px';
      }
    }, { passive: true });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) {
        ring.classList.remove('cursor-ring--hover');
        ring.style.width = '';
        ring.style.height = '';
        ring.style.marginLeft = '';
        ring.style.marginTop = '';
      }
    }, { passive: true });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    }, { passive: true });

    document.addEventListener('mouseenter', function () {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }, { passive: true });
  }

  /* ============================================
     3. Navigation
     ============================================ */
  function initNavigation() {
    var header = document.querySelector('.site-header');
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    var navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
    var sections = document.querySelectorAll('section[id]');

    if (!header) return;

    /* --- Frosted Glass on Scroll --- */
    var scrollThreshold = 50;

    function handleNavScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('nav-scrolled');
      } else {
        header.classList.remove('nav-scrolled');
      }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // Run once on init

    /* --- Hamburger Toggle --- */
    if (hamburger && mobileMenu) {
      function closeMobileMenu() {
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.classList.remove('open');
        hamburger.focus();
      }

      function openMobileMenu() {
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenu.classList.add('open');
        // Move focus to first focusable item in the menu
        var firstLink = mobileMenu.querySelector('a, button, [tabindex="0"]');
        if (firstLink) firstLink.focus();
      }

      hamburger.addEventListener('click', function () {
        var isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // Close mobile menu on link click
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          closeMobileMenu();
        });
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!header.contains(e.target)) {
          hamburger.setAttribute('aria-expanded', 'false');
          mobileMenu.setAttribute('aria-hidden', 'true');
          mobileMenu.classList.remove('open');
        }
      }, { passive: true });

      // ESC key closes the menu (WCAG 2.1 SC 1.4.13)
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
          closeMobileMenu();
        }
      });

      // Focus trap — keep Tab/Shift+Tab inside the open menu
      mobileMenu.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var focusable = Array.from(
          mobileMenu.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
        if (!focusable.length) return;

        var first = focusable[0];
        var last  = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
    }

    /* --- Smooth Scroll for Anchor Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        var navHeight = 72;
        var targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });

        // Update URL without triggering scroll
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      });
    });

    /* --- Scroll Spy --- */
    function updateActiveNav() {
      var scrollPos = window.scrollY + 100;

      sections.forEach(function (section) {
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  /* ============================================
     4. Theme Toggle
     ============================================ */
  function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    var html = document.documentElement;

    if (!toggle) return;

    // Determine initial theme: localStorage > prefers-color-scheme
    function getPreferredTheme() {
      var saved = localStorage.getItem('dl-theme');
      if (saved) return saved;
      if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
      return 'dark';
    }

    function applyTheme(theme) {
      if (theme === 'light') {
        html.classList.remove('dark-theme');
        html.classList.add('light-theme');
        toggle.setAttribute('aria-label', 'Switch to dark mode');
      } else {
        html.classList.remove('light-theme');
        html.classList.add('dark-theme');
        toggle.setAttribute('aria-label', 'Switch to light mode');
      }
      localStorage.setItem('dl-theme', theme);
    }

    // Apply theme on init
    applyTheme(getPreferredTheme());

    toggle.addEventListener('click', function () {
      var current = html.classList.contains('light-theme') ? 'light' : 'dark';
      var next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      trackEvent('theme_toggle', { theme: next });
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      if (!localStorage.getItem('dl-theme')) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });
  }

  /* ============================================
     5. Hero Particle Canvas
     ============================================ */
  function initParticleCanvas() {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var rafId = null;
    var particleCount = 80;
    var colors = ['#2563EB', '#60A5FA', '#1E40AF', '#3B82F6'];
    var connectionDistance = 120;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.6 + 0.2
      };
    }

    function initParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    }

    function drawParticle(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function connectParticles() {
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            var opacity = (1 - dist / connectionDistance) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = '#2563EB';
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    function updateParticle(p) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      connectParticles();

      particles.forEach(function (p) {
        updateParticle(p);
        drawParticle(p);
      });

      rafId = requestAnimationFrame(animate);
    }

    // Debounced resize
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        initParticles();
      }, 250);
    }, { passive: true });

    // Pause animation when hero section is not visible (performance)
    var heroSection = document.getElementById('hero');
    if (heroSection && 'IntersectionObserver' in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!rafId) rafId = requestAnimationFrame(animate);
          } else {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          }
        });
      }, { threshold: 0 });
      heroObserver.observe(heroSection);
    }

    resize();
    initParticles();
    animate();
  }

  /* ============================================
     6. Typing Animation
     ============================================ */
  function initTypingAnimation() {
    var el = document.getElementById('typing-text');
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = 'Technical Program Manager';
      return;
    }

    var phrases = [
      'Program Manager',
      'Tech Influencer',
      'Industry Voice',
      'Microsoft Leader'
    ];

    var currentPhrase = 0;
    var currentChar = 0;
    var isDeleting = false;
    var typeSpeed = 80;
    var deleteSpeed = 40;
    var pauseAfterType = 2000;
    var pauseAfterDelete = 500;
    var timeoutId = null;

    function type() {
      var phrase = phrases[currentPhrase];

      if (!isDeleting) {
        // Typing forward
        el.textContent = phrase.substring(0, currentChar + 1);
        currentChar++;

        if (currentChar === phrase.length) {
          // Done typing, pause before deleting
          isDeleting = true;
          timeoutId = setTimeout(type, pauseAfterType);
          return;
        }

        timeoutId = setTimeout(type, typeSpeed);
      } else {
        // Deleting
        el.textContent = phrase.substring(0, currentChar - 1);
        currentChar--;

        if (currentChar === 0) {
          // Done deleting, move to next phrase
          isDeleting = false;
          currentPhrase = (currentPhrase + 1) % phrases.length;
          timeoutId = setTimeout(type, pauseAfterDelete);
          return;
        }

        timeoutId = setTimeout(type, deleteSpeed);
      }
    }

    // Start typing after a short delay
    timeoutId = setTimeout(type, 1000);
  }

  /* ============================================
     7. Scroll Animations (Intersection Observer)
     ============================================ */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: make everything visible
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    var observedCount = 0;
    var totalElements = revealElements.length;

    var observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
          observedCount++;

          // Disconnect when all elements are visible
          if (observedCount >= totalElements) {
            observer.disconnect();
          }
        }
      });
    }, observerOptions);

    // Stagger skill cards
    var skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(function (card, index) {
      card.style.transitionDelay = (index * 100) + 'ms';
    });

    // Observe all reveal elements
    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ============================================
     8. Scroll Progress Bar
     ============================================ */
  function initScrollProgress() {
    var progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      progressBar.style.transform = 'scaleX(' + progress + ')';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ============================================
     9. Marquee (CSS handles animation, JS for accessibility)
     ============================================ */
  // CSS handles the marquee animation.
  // We pause on hover via CSS: .marquee-row:hover .marquee-track { animation-play-state: paused; }
  // No additional JS needed for the marquee itself.

  /* ============================================
     10. Forms
     ============================================ */
  function initForms() {
    initNewsletterForm();
    initContactForm();
  }

  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.body;
    }

    var toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' toast--error' : '');
    toast.setAttribute('role', 'alert');
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger animation on next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('toast--visible');
      });
    });

    // Remove after 4 seconds
    setTimeout(function () {
      toast.classList.remove('toast--visible');
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, 4000);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateField(input) {
    if (!input.value.trim()) {
      input.classList.add('error');
      return false;
    }
    if (input.type === 'email' && !validateEmail(input.value)) {
      input.classList.add('error');
      return false;
    }
    input.classList.remove('error');
    return true;
  }

  function initNewsletterForm() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;

    var nameInput = document.getElementById('newsletter-name');
    var emailInput = document.getElementById('newsletter-email');

    // Real-time validation feedback
    if (nameInput) {
      nameInput.addEventListener('blur', function () { validateField(nameInput); });
      nameInput.addEventListener('input', function () { nameInput.classList.remove('error'); });
    }
    if (emailInput) {
      emailInput.addEventListener('blur', function () { validateField(emailInput); });
      emailInput.addEventListener('input', function () { emailInput.classList.remove('error'); });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameValid = validateField(nameInput);
      var emailValid = validateField(emailInput);

      if (!nameValid || !emailValid) {
        showToast('Please fill in all required fields correctly.', 'error');
        return;
      }

      // Simulate form submission
      var submitBtn = form.querySelector('[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.textContent = 'Signing you up...';
      submitBtn.disabled = true;

      setTimeout(function () {
        showToast("You're on the list! Updates incoming.", '');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        trackEvent('newsletter_signup', { source: 'newsletter_form' });
      }, 800);
    });
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');

    fields.forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () { field.classList.remove('error'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var allValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) {
          allValid = false;
        }
      });

      if (!allValid) {
        showToast('Please fill in all required fields correctly.', 'error');
        return;
      }

      var submitBtn = form.querySelector('[type="submit"]');
      var originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(function () {
        showToast("Message received! I'll be in touch soon.", '');
        form.reset();
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        trackEvent('contact_form_submit', { subject: form.querySelector('#contact-subject') ? form.querySelector('#contact-subject').value : 'unknown' });
      }, 1000);
    });
  }

  /* ============================================
     11. Animated Counters
     ============================================ */
  function initCounters() {
    var counterElements = document.querySelectorAll('[data-count]');
    if (!counterElements.length) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      counterElements.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        el.textContent = target + suffix;
      });
      return;
    }

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-count'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          var duration = 1500;

          animateCounter(el, target, suffix, duration);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el, target, suffix, duration) {
    var startTime = null;
    var startValue = 0;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutCubic(progress);
      var current = Math.round(startValue + (target - startValue) * easedProgress);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
        // Small pop animation at end
        el.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = 'scale(1.1)';
        setTimeout(function () {
          el.style.transform = 'scale(1)';
        }, 150);
      }
    }

    requestAnimationFrame(step);
  }

  /* ============================================
     12. Magnetic Buttons
     ============================================ */
  function initMagneticButtons() {
    // Only enable on hover-capable devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var magneticButtons = document.querySelectorAll('.btn-magnetic');

    magneticButtons.forEach(function (btn) {
      var rect = null;

      btn.addEventListener('mouseenter', function () {
        rect = btn.getBoundingClientRect();
      }, { passive: true });

      btn.addEventListener('mousemove', function (e) {
        if (!rect) rect = btn.getBoundingClientRect();

        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        var moveX = x * 0.15;
        var moveY = y * 0.15;

        btn.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
      }, { passive: true });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        rect = null;

        // Reset transition after spring settles
        setTimeout(function () {
          btn.style.transition = '';
        }, 400);
      }, { passive: true });
    });
  }

  /* ============================================
     13. Analytics Events
     ============================================ */
  function trackEvent(name, props) {
    props = props || {};
    if (typeof window.plausible !== 'undefined') {
      window.plausible(name, { props: props });
    }
  }

  function initAnalytics() {
    // LinkedIn CTA click
    document.querySelectorAll('.linkedin-cta, .footer-linkedin').forEach(function (el) {
      el.addEventListener('click', function () {
        trackEvent('linkedin_click', { location: el.classList.contains('footer-linkedin') ? 'footer' : 'content' });
      });
    });

    // Theme toggle — tracked in initThemeToggle

    // Contact form submit — tracked in initContactForm

    // Newsletter form submit — tracked in initNewsletterForm

    // Navigation link clicks
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        var section = link.getAttribute('href').replace('#', '');
        trackEvent('nav_click', { section: section });
      });
    });

    // Hero CTA clicks
    document.querySelectorAll('.hero-ctas a').forEach(function (link) {
      link.addEventListener('click', function () {
        trackEvent('hero_cta_click', { label: link.textContent.trim() });
      });
    });

    // Scroll depth tracking
    var depths = [25, 50, 75, 100];
    var trackedDepths = {};

    window.addEventListener('scroll', function () {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var scrollPercent = docHeight > 0 ? Math.round((window.scrollY / docHeight) * 100) : 0;

      depths.forEach(function (depth) {
        if (scrollPercent >= depth && !trackedDepths[depth]) {
          trackedDepths[depth] = true;
          trackEvent('scroll_depth', { percent: depth });
        }
      });
    }, { passive: true });
  }

  /* ============================================
     14. Footer Year
     ============================================ */
  function initFooterYear() {
    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============================================
     15. Schedule Section
     ============================================ */
  function initScheduleSection() {
    // Track booking button clicks
    document.querySelectorAll('[data-track^="booking-"]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var meetingType = btn.dataset.track.replace('booking-', '');
        if (typeof trackEvent === 'function') {
          trackEvent('Meeting Booked', { type: meetingType, source: 'schedule-section' });
        }
        btn.style.transform = 'scale(0.97)';
        setTimeout(function() { btn.style.transform = ''; }, 150);
      });
    });

    // Hide placeholder if real iframe embed is present
    var iframe = document.querySelector('.calendar-embed-wrapper iframe');
    var placeholder = document.getElementById('calendar-placeholder');
    if (iframe && placeholder) {
      placeholder.hidden = true;
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 0.4s ease';
      iframe.addEventListener('load', function() { iframe.style.opacity = '1'; });
      if (!iframe.hasAttribute('title')) {
        iframe.setAttribute('title', 'Schedule a meeting with Damarcus Lett');
      }
      iframe.setAttribute('aria-label', 'Google Calendar booking interface for Damarcus Lett');
    }

    // Staggered trust row animation on scroll
    var trustItems = document.querySelectorAll('.trust-item');
    trustItems.forEach(function(item, i) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(10px)';
      item.style.transition = 'opacity 0.4s ease ' + (i * 80) + 'ms, transform 0.4s ease ' + (i * 80) + 'ms';
    });
    var trustRow = document.querySelector('.schedule-trust-row');
    if (trustRow && 'IntersectionObserver' in window) {
      var trustObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            trustItems.forEach(function(item) {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            });
            trustObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px' });
      trustObserver.observe(trustRow);
    }

    // 3D tilt effect on meeting cards (pointer devices only)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.meeting-type-card').forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
          var rect = card.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
          var y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
          card.style.transform = 'translateY(-6px) rotateX(' + (-y) + 'deg) rotateY(' + x + 'deg)';
          card.style.transition = 'transform 0.1s ease';
        });
        card.addEventListener('mouseleave', function() {
          card.style.transform = '';
          card.style.transition = 'transform var(--transition-base)';
        });
      });
    }
  }

  /* ============================================
     16. Company Logo Links
     ============================================ */
  function initCompanyLogoLinks() {
    var logoLinks = document.querySelectorAll('.company-logo-link');
    var prefetched = new Set();

    logoLinks.forEach(function(link) {
      var company = link.dataset.company || 'this company';
      var url = link.href;

      // Click tracking + visual pulse
      link.addEventListener('click', function() {
        if (typeof trackEvent === 'function') {
          trackEvent('Company Logo Clicked', {
            company: company,
            url: url,
            source: getLogoSource(link)
          });
        }
        var img = link.querySelector('img');
        if (img) {
          img.style.transform = 'scale(0.92)';
          img.style.transition = 'transform 0.1s ease';
          setTimeout(function() {
            img.style.transform = '';
            img.style.transition = '';
          }, 150);
        }
      });

      // Middle-click tracking
      link.addEventListener('auxclick', function(e) {
        if (e.button === 1 && typeof trackEvent === 'function') {
          trackEvent('Company Logo Clicked', { company: company, source: 'middle-click' });
        }
      });

      // Touch feedback
      link.addEventListener('touchstart', function() {
        link.style.opacity = '0.7';
        link.style.transition = 'opacity 0.1s ease';
      }, { passive: true });
      link.addEventListener('touchend', function() {
        setTimeout(function() {
          link.style.opacity = '';
          link.style.transition = '';
        }, 200);
      }, { passive: true });

      // Prefetch on hover
      link.addEventListener('mouseenter', function() {
        if (!prefetched.has(url)) {
          var pl = document.createElement('link');
          pl.rel = 'prefetch';
          pl.href = url;
          document.head.appendChild(pl);
          prefetched.add(url);
        }
      }, { passive: true });
    });

    function getLogoSource(link) {
      if (link.closest('.timeline-card'))    return 'timeline';
      if (link.closest('.mini-logos'))       return 'about-strip';
      if (link.closest('.marquee-track'))    return 'marquee';
      if (link.closest('.profile-badge'))    return 'profile-badge';
      return 'unknown';
    }
  }

})();
