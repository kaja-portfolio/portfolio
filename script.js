// ===== NAVIGATION =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');

// Mobile menu toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== FADE IN ON SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements with fade-in animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .project-card, .skill-item, .education-card, .timeline-item, .profile-card, .service-card, .testimonial-card, .stat-box, .about-me-text, .about-me-image, .highlight-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    // For side-slide item, toggle in-view class when intersecting
    const profile = document.querySelector('.profile-card');
    if (profile) {
        const slideObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    profile.classList.add('in-view');
                }
            });
        }, { threshold: 0.3 });
        slideObserver.observe(profile);
    }
});

// ===== ACTIVE NAV LINK =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

// ===== TYPING ROLE EFFECT (Home page) =====
document.addEventListener('DOMContentLoaded', () => {
    const typingTarget = document.getElementById('typing-role');
    if (!typingTarget) return;

    const roles = [
        'Web Developer',
        'UI/UX Designer',
        'Web Designer',
        'Graphic Designer',
        'Video Editor'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const TYPING_SPEED = 90;      // ms per char when typing
    const DELETING_SPEED = 60;    // ms per char when deleting
    const WORD_HOLD = 1200;       // pause after a word is typed
    const GAP_HOLD = 250;         // small pause before starting next word

    const tick = () => {
        const current = roles[roleIndex % roles.length];
        const visible = isDeleting
            ? current.substring(0, charIndex - 1)
            : current.substring(0, charIndex + 1);

        typingTarget.textContent = visible;

        if (!isDeleting && visible === current) {
            isDeleting = true;
            setTimeout(tick, WORD_HOLD);
            return;
        }

        if (isDeleting && visible === '') {
            isDeleting = false;
            roleIndex++;
            setTimeout(tick, GAP_HOLD);
            return;
        }

        charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
        const delay = isDeleting ? DELETING_SPEED : TYPING_SPEED;
        setTimeout(tick, delay);
    };

    // Start after brief intro delay so lines finish entering
    setTimeout(tick, 600);
});

// ===== FOOTER EMAIL SUBSCRIPTION =====
document.addEventListener('DOMContentLoaded', () => {
    const subscribeForms = document.querySelectorAll('.footer-subscribe');
    
    subscribeForms.forEach(form => {
        const button = form.querySelector('button');
        const input = form.querySelector('input[type="email"]');
        
        if (button && input) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const email = input.value.trim();
                
                if (email && email.includes('@')) {
                    // Show success message
                    alert('Thank you for subscribing! We\'ll keep you updated.');
                    input.value = '';
                } else {
                    alert('Please enter a valid email address.');
                }
            });
            
            // Allow Enter key to submit
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    button.click();
                }
            });
        }
    });
});

