// ===== STATISTICS COUNTER ANIMATION (Home Page) =====
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
            if (statNumber) {
                const target = parseInt(statNumber.getAttribute('data-target'));
                animateCounter(statNumber, target);
                entry.target.classList.add('animated');
            }
        }
    });
}, {
    threshold: 0.3
});

// ===== REVIEW STORAGE =====
function getReviews() {
    const reviews = localStorage.getItem('userReviews');
    return reviews ? JSON.parse(reviews) : [];
}

// ===== CHECK IF REVIEW IS OLDER THAN 10 DAYS =====
function isReviewExpired(review) {
    if (!review.timestamp) {
        // If old reviews don't have timestamp, keep them (backward compatibility)
        return false;
    }
    
    const now = new Date().getTime();
    const reviewDate = review.timestamp;
    const daysDifference = (now - reviewDate) / (1000 * 60 * 60 * 24); // Convert to days
    
    return daysDifference > 10; // Hide if older than 10 days
}

// ===== CLEAN UP EXPIRED REVIEWS =====
function cleanExpiredReviews() {
    const reviews = getReviews();
    const activeReviews = reviews.filter(review => !isReviewExpired(review));
    
    if (activeReviews.length !== reviews.length) {
        localStorage.setItem('userReviews', JSON.stringify(activeReviews));
    }
    
    return activeReviews;
}

// ===== ANIMATIONS FOR REVIEWS =====
const reviewsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            reviewsObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

// ===== LOAD USER REVIEWS =====
function loadUserReviews() {
    // Clean up expired reviews first
    const activeReviews = cleanExpiredReviews();
    const reviewsGrid = document.getElementById('userReviewsGrid');
    const noReviewsMessage = document.getElementById('noReviewsMessage');
    
    if (!reviewsGrid || !noReviewsMessage) return;
    
    if (activeReviews.length === 0) {
        reviewsGrid.style.display = 'none';
        noReviewsMessage.style.display = 'block';
        return;
    }
    
    // Sort reviews by timestamp (newest first)
    const sortedReviews = activeReviews.sort((a, b) => {
        const timestampA = a.timestamp || 0;
        const timestampB = b.timestamp || 0;
        return timestampB - timestampA; // Newest first
    });
    
    // Show only the latest 3 reviews
    const latestReviews = sortedReviews.slice(0, 3);
    
    reviewsGrid.style.display = 'grid';
    noReviewsMessage.style.display = 'none';
    
    reviewsGrid.innerHTML = latestReviews.map((review, index) => {
        const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return `
            <div class="user-review-card">
                <div class="user-review-header">
                    <div class="user-review-avatar">${initials}</div>
                    <div class="user-review-info">
                        <h4>${review.name}</h4>
                        <p>${review.role}</p>
                    </div>
                </div>
                <div class="user-review-rating">
                    ${Array(review.rating).fill(0).map(() => '<i class="fas fa-star"></i>').join('')}
                    ${Array(5 - review.rating).fill(0).map(() => '<i class="far fa-star"></i>').join('')}
                </div>
                <p class="user-review-text">${review.message}</p>
                <div class="user-review-project">
                    <i class="fas fa-briefcase"></i>
                    <span>${review.project}</span>
                </div>
                <div class="user-review-date">
                    <i class="fas fa-calendar"></i> ${review.date}
                </div>
            </div>
        `;
    }).join('');
    
    // Re-initialize animations for new reviews
    const newReviewCards = document.querySelectorAll('.user-review-card');
    newReviewCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        reviewsObserver.observe(card);
    });
}

// Notification system is only needed on services page where form exists

// Observe stat boxes when page loads
document.addEventListener('DOMContentLoaded', () => {
    const statBoxes = document.querySelectorAll('.stat-box');
    statBoxes.forEach(box => {
        statsObserver.observe(box);
    });
    
    // Load user reviews
    loadUserReviews();
});

