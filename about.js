// ===== STATISTICS COUNTER ANIMATION =====
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
};

// ===== OBSERVER FOR STATS =====
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const statNumber = entry.target.querySelector('.stat-number');
            const target = parseInt(statNumber.getAttribute('data-target'));
            animateCounter(statNumber, target);
            entry.target.classList.add('animated');
        }
    });
}, {
    threshold: 0.5
});

// Observe stat items
document.addEventListener('DOMContentLoaded', () => {
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        statsObserver.observe(item);
    });
});

// ===== TIMELINE ANIMATION =====
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 200);
            timelineObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2
});

document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        timelineObserver.observe(item);
    });
});
// ===== EDUCATION FILTERING =====
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.edu-filter-btn');
    const timelineEntries = document.querySelectorAll('.timeline-entry');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Active button state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.textContent.toLowerCase();

                timelineEntries.forEach(entry => {
                    const badge = entry.querySelector('.edu-badge').textContent.toLowerCase();

                    if (filter === 'all') {
                        entry.style.display = 'flex';
                        setTimeout(() => entry.style.opacity = '1', 10);
                    } else if (badge.includes(filter.slice(0, -1))) { // Handle 'Degree' vs 'Degrees'
                        entry.style.display = 'flex';
                        setTimeout(() => entry.style.opacity = '1', 10);
                    } else {
                        entry.style.opacity = '0';
                        setTimeout(() => entry.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // --- Description Toggle Logic ---
    const detailButtons = document.querySelectorAll('.edu-view-more');
    detailButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const description = btn.previousElementSibling;
            const isShowing = description.classList.toggle('show');
            btn.classList.toggle('active');

            // Update button text
            const btnText = btn.querySelector('span');
            if (isShowing) {
                btnText.textContent = 'Hide Details';
            } else {
                btnText.textContent = 'View Details';
            }
        });
    });
});
