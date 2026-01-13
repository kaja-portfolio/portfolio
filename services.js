// ===== STATISTICS COUNTER ANIMATION =====
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    const isDecimal = target % 1 !== 0;
    
    const updateCounter = () => {
        start += increment;
        if (start < target) {
            if (isDecimal) {
                element.textContent = start.toFixed(1);
            } else {
                element.textContent = Math.floor(start);
            }
            requestAnimationFrame(updateCounter);
        } else {
            if (isDecimal) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = target;
            }
        }
    };
    
    updateCounter();
};

// ===== ANIMATIONS FOR SERVICES PAGE =====
const servicesObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            servicesObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

// ===== STATS OBSERVER =====
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber) {
                const target = parseFloat(statNumber.getAttribute('data-target'));
                animateCounter(statNumber, target);
                entry.target.classList.add('animated');
            }
        }
    });
}, {
    threshold: 0.5
});

// ===== REVIEW STORAGE =====
function getReviews() {
    const reviews = localStorage.getItem('userReviews');
    return reviews ? JSON.parse(reviews) : [];
}

function saveReview(review) {
    const reviews = getReviews();
    reviews.unshift(review); // Add to beginning
    localStorage.setItem('userReviews', JSON.stringify(reviews));
}

// ===== REVIEW FORM HANDLING =====
const reviewForm = document.getElementById('reviewForm');

if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(reviewForm);
        const now = new Date();
        const review = {
            id: Date.now().toString(),
            name: formData.get('name'),
            role: formData.get('role') || 'Client',
            rating: parseInt(formData.get('rating')),
            project: formData.get('project') || 'General Project',
            message: formData.get('message'),
            date: now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            timestamp: now.getTime() // Store timestamp for age calculation
        };
        
        // Save review
        saveReview(review);
        
        // Show success message
        showNotification('Thank you for your review! It has been submitted successfully.', 'success');
        
        // Reset form
        reviewForm.reset();
        
        // Reload reviews
        loadUserReviews();
    });
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

// ===== LOAD USER REVIEWS =====
function loadUserReviews() {
    // Clean up expired reviews first
    const activeReviews = cleanExpiredReviews();
    const reviewsGrid = document.getElementById('userReviewsGrid');
    const noReviewsMessage = document.getElementById('noReviewsMessage');
    
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
    
    // Show only the latest 6 reviews on services page
    const latestReviews = sortedReviews.slice(0, 6);
    
    reviewsGrid.style.display = 'grid';
    noReviewsMessage.style.display = 'none';
    
    reviewsGrid.innerHTML = latestReviews.map(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
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
        servicesObserver.observe(card);
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== INITIALIZE ANIMATIONS =====
document.addEventListener('DOMContentLoaded', () => {
    // Load user reviews
    loadUserReviews();
});

