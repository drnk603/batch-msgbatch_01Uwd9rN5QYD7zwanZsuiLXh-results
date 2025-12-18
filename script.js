(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() { inThrottle = false; }, limit);
            }
        };
    }

    function initBurgerMenu() {
        if (window.__app.burgerInit) return;
        window.__app.burgerInit = true;

        var toggle = document.querySelector('.navbar-toggler');
        var header = document.querySelector('.l-header');
        var navList = document.querySelector('.navbar-collapse');
        var body = document.body;

        if (!toggle || !header || !navList) return;

        var mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.style.cssText = 'position:fixed;top:var(--header-h);left:0;width:100%;height:calc(100vh - var(--header-h));background:rgba(255,255,255,0.98);backdrop-filter:blur(10px);transform:translateX(-100%);transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);z-index:999;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,0.1);';

        var menuContent = document.createElement('div');
        menuContent.style.cssText = 'padding:var(--space-xl) var(--container-px);';
        
        var navClone = navList.cloneNode(true);
        menuContent.appendChild(navClone);
        mobileMenu.appendChild(menuContent);
        document.body.appendChild(mobileMenu);

        var isOpen = false;

        function openMenu() {
            isOpen = true;
            mobileMenu.style.transform = 'translateX(0)';
            toggle.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden';
        }

        function closeMenu() {
            isOpen = false;
            mobileMenu.style.transform = 'translateX(-100%)';
            toggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        }

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        var menuLinks = mobileMenu.querySelectorAll('a');
        for (var i = 0; i < menuLinks.length; i++) {
            menuLinks[i].addEventListener('click', function() {
                closeMenu();
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
            }
        });

        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth >= 768 && isOpen) {
                closeMenu();
            }
        }, 100));
    }

    function initScrollEffects() {
        if (window.__app.scrollInit) return;
        window.__app.scrollInit = true;

        var observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        var animatedElements = document.querySelectorAll('img, .card, .c-hero, .btn, h1, h2, h3, p');
        for (var i = 0; i < animatedElements.length; i++) {
            var element = animatedElements[i];
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            observer.observe(element);
        }
    }

    function initMicroInteractions() {
        if (window.__app.microInit) return;
        window.__app.microInit = true;

        var buttons = document.querySelectorAll('.btn, .c-button, a');
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            
            btn.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease-in-out';
                this.style.transform = 'scale(1.05)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });

            btn.addEventListener('click', function(e) {
                var ripple = document.createElement('span');
                var rect = this.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;background:rgba(255,255,255,0.5);border-radius:50%;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;';
                
                if (this.style.position !== 'absolute' && this.style.position !== 'relative') {
                    this.style.position = 'relative';
                }
                this.style.overflow = 'hidden';
                
                this.appendChild(ripple);
                
                setTimeout(function() {
                    ripple.remove();
                }, 600);
            });
        }

        var style = document.createElement('style');
        style.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0;}}';
        document.head.appendChild(style);
    }

    function initScrollSpy() {
        if (window.__app.scrollSpyInit) return;
        window.__app.scrollSpyInit = true;

        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.c-nav__link');

        if (sections.length === 0) return;

        function updateActiveLink() {
            var scrollPosition = window.pageYOffset + 100;

            sections.forEach(function(section) {
                var sectionTop = section.offsetTop;
                var sectionHeight = section.offsetHeight;
                var sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                        
                        var href = link.getAttribute('href');
                        if (href === '#' + sectionId) {
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'page');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', throttle(updateActiveLink, 100), { passive: true });
        updateActiveLink();
    }

    function initSmoothScroll() {
        if (window.__app.smoothScrollInit) return;
        window.__app.smoothScrollInit = true;

        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link) return;

            var href = link.getAttribute('href');
            if (href === '#' || href === '#!') return;

            var targetId = href.substring(1);
            var targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                var header = document.querySelector('.l-header');
                var offset = header ? header.offsetHeight : 80;
                var targetPosition = targetElement.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    function initFormValidation() {
        if (window.__app.formValidationInit) return;
        window.__app.formValidationInit = true;

        var forms = document.querySelectorAll('.c-form');
        
        var patterns = {
            name: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
            email: /^[^s@]+@[^s@]+.[^s@]+$/,
            phone: /^[ds+-()]{10,20}$/,
            message: /^.{10,}$/
        };

        var errorMessages = {
            name: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen)',
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
            phone: 'Bitte geben Sie eine gültige Telefonnummer ein',
            message: 'Die Nachricht muss mindestens 10 Zeichen enthalten',
            privacy: 'Bitte akzeptieren Sie die Datenschutzbestimmungen'
        };

        function showError(field, message) {
            var parent = field.closest('.c-form__group') || field.parentElement;
            parent.classList.add('has-error');
            
            var errorEl = parent.querySelector('.c-form__error');
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'c-form__error';
                parent.appendChild(errorEl);
            }
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }

        function clearError(field) {
            var parent = field.closest('.c-form__group') || field.parentElement;
            parent.classList.remove('has-error');
            
            var errorEl = parent.querySelector('.c-form__error');
            if (errorEl) {
                errorEl.style.display = 'none';
            }
        }

        function validateField(field) {
            var fieldName = field.name || field.id;
            var fieldValue = field.value.trim();
            var fieldType = field.type;

            clearError(field);

            if (field.hasAttribute('required') && !fieldValue) {
                showError(field, 'Dieses Feld ist erforderlich');
                return false;
            }

            if (fieldType === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                showError(field, errorMessages.privacy);
                return false;
            }

            if (fieldValue && patterns[fieldName]) {
                if (!patterns[fieldName].test(fieldValue)) {
                    showError(field, errorMessages[fieldName]);
                    return false;
                }
            }

            return true;
        }

        forms.forEach(function(form) {
            var honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = 'website';
            honeypot.style.display = 'none';
            honeypot.tabIndex = -1;
            honeypot.autocomplete = 'off';
            form.appendChild(honeypot);

            var fields = form.querySelectorAll('input, textarea, select');
            fields.forEach(function(field) {
                field.addEventListener('blur', function() {
                    validateField(this);
                });

                field.addEventListener('input', function() {
                    if (this.parentElement.classList.contains('has-error')) {
                        validateField(this);
                    }
                });
            });

            form.addEventListener('submit', function(e) {
                e.preventDefault();

                if (honeypot.value) {
                    return false;
                }

                var isValid = true;
                fields.forEach(function(field) {
                    if (field !== honeypot && !validateField(field)) {
                        isValid = false;
                    }
                });

                if (!isValid) {
                    var firstError = form.querySelector('.has-error input, .has-error textarea');
                    if (firstError) {
                        firstError.focus();
                    }
                    return;
                }

                var submitBtn = form.querySelector('[type="submit"]');
                var originalText = submitBtn.textContent;
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Wird gesendet...';

                var style = document.createElement('style');
                style.textContent = '@keyframes spin{to{transform:rotate(360deg);}}';
                if (!document.querySelector('style[data-spin]')) {
                    style.setAttribute('data-spin', '');
                    document.head.appendChild(style);
                }

                setTimeout(function() {
                    window.location.href = 'thank_you.html';
                }, 1500);
            });
        });
    }

    function initScrollToTop() {
        if (window.__app.scrollToTopInit) return;
        window.__app.scrollToTopInit = true;

        var scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
        scrollBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;background:linear-gradient(135deg,var(--color-primary),var(--color-accent));color:#fff;border:none;border-radius:50%;font-size:24px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease-in-out;z-index:1000;box-shadow:0 4px 12px rgba(10,126,164,0.3);';
        
        document.body.appendChild(scrollBtn);

        window.addEventListener('scroll', throttle(function() {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        }, 100), { passive: true });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        scrollBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });

        scrollBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }

    function initCountUp() {
        if (window.__app.countUpInit) return;
        window.__app.countUpInit = true;

        var counters = document.querySelectorAll('[data-count]');
        if (counters.length === 0) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    var target = parseInt(entry.target.getAttribute('data-count'));
                    var duration = 2000;
                    var step = target / (duration / 16);
                    var current = 0;

                    var counter = setInterval(function() {
                        current += step;
                        if (current >= target) {
                            entry.target.textContent = target;
                            clearInterval(counter);
                        } else {
                            entry.target.textContent = Math.floor(current);
                        }
                    }, 16);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function(counter) {
            observer.observe(counter);
        });
    }

    function initCardAnimations() {
        if (window.__app.cardAnimInit) return;
        window.__app.cardAnimInit = true;

        var cards = document.querySelectorAll('.card');
        
        cards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });
    }

    function initPrivacyModal() {
        if (window.__app.privacyModalInit) return;
        window.__app.privacyModalInit = true;

        var privacyLinks = document.querySelectorAll('a[href*="privacy"]');
        
        privacyLinks.forEach(function(link) {
            if (link.getAttribute('href') === 'privacy.html' || link.getAttribute('href') === './privacy.html') {
                return;
            }

            link.addEventListener('click', function(e) {
                if (window.location.pathname.includes('privacy')) return;
                
                e.preventDefault();
                window.location.href = 'privacy.html';
            });
        });
    }

    function initImages() {
        if (window.__app.imagesInit) return;
        window.__app.imagesInit = true;

        var images = document.querySelectorAll('img');
        
        images.forEach(function(img) {
            if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img')) {
                img.setAttribute('loading', 'lazy');
            }

            img.addEventListener('error', function() {
                this.style.background = '#f8f9fa';
                this.style.border = '1px solid #dee2e6';
                this.alt = 'Bild nicht verfügbar';
            });
        });

        var videos = document.querySelectorAll('video');
        videos.forEach(function(video) {
            if (!video.hasAttribute('loading')) {
                video.setAttribute('loading', 'lazy');
            }
        });
    }

    window.__app.init = function() {
        initBurgerMenu();
        initScrollEffects();
        initMicroInteractions();
        initScrollSpy();
        initSmoothScroll();
        initFormValidation();
        initScrollToTop();
        initCountUp();
        initCardAnimations();
        initPrivacyModal();
        initImages();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.__app.init);
    } else {
        window.__app.init();
    }

})();
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.mobile-menu {
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.btn,
.c-button {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.btn:hover,
.c-button:hover {
  transform: scale(1.05);
}

.btn:active,
.c-button:active {
  transform: scale(0.98);
}

img,
video {
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.c-nav__link {
  transition: color 0.3s ease-in-out, background-color 0.3s ease-in-out;
}

.c-nav__link:hover {
  background-color: var(--color-neutral-50);
  color: var(--color-primary);
}

.c-form__group {
  transition: all 0.3s ease-in-out;
}

.has-error .c-input,
.has-error .c-textarea,
.has-error .form-control {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.scroll-to-top {
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.scroll-to-top:hover {
  transform: scale(1.1);
}

a {
  transition: color 0.3s ease-in-out;
}

.c-hero {
  animation: fadeIn 1s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
