// ===== GET PROJECTS FROM STORAGE =====
function getProjects() {
    const projects = localStorage.getItem('portfolioProjects');
    return projects ? JSON.parse(projects) : [];
}

// ===== GET GRADIENT CLASS BASED ON INDEX =====
function getGradientClass(index) {
    const gradients = ['project-1', 'project-2', 'project-3', 'project-4', 'project-5', 'project-6'];
    return gradients[index % gradients.length];
}

// ===== LOAD AND DISPLAY PROJECTS =====
function loadProjects() {
    const projects = getProjects();
    const projectsGrid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('emptyState');
    
    // Filter only published projects
    const publishedProjects = projects.filter(project => project.published);
    
    if (publishedProjects.length === 0) {
        projectsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    projectsGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Clear existing projects
    projectsGrid.innerHTML = '';
    
    // Create project cards
    publishedProjects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsGrid.appendChild(projectCard);
    });
    
    // Re-initialize animations and filters
    initializeAnimations();
    initializeFilters();
}

// ===== CREATE PROJECT CARD =====
function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-category', project.category);
    
    // Determine image source
    let imageHTML = '';
    if (project.image) {
        imageHTML = `<img src="${project.image}" alt="${project.title}" class="project-img">`;
    } else {
        imageHTML = `<div class="project-placeholder ${getGradientClass(index)}"></div>`;
    }
    
    // Build links HTML
    let linksHTML = '';
    if (project.liveLink || project.githubLink) {
        linksHTML = '<div class="project-links">';
        if (project.liveLink) {
            linksHTML += `<a href="${project.liveLink}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i></a>`;
        }
        if (project.githubLink) {
            linksHTML += `<a href="${project.githubLink}" target="_blank" class="project-link"><i class="fab fa-github"></i></a>`;
        }
        linksHTML += '</div>';
    }
    
    card.innerHTML = `
        <div class="project-image">
            <div class="project-overlay">
                ${linksHTML}
            </div>
            ${imageHTML}
        </div>
        <div class="project-info">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    return card;
}

// ===== INITIALIZE ANIMATIONS =====
function initializeAnimations() {
    const projectCards = document.querySelectorAll('.project-card');
    const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                projectObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        projectObserver.observe(card);
    });
}

// ===== INITIALIZE FILTERS =====
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ===== LOAD PROJECTS ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();

    // Image lightbox / full-view for project images
    const projectsGrid = document.getElementById('projectsGrid');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const imageModalClose = document.getElementById('imageModalClose');

    if (projectsGrid && imageModal && modalImage && imageModalClose) {
        // Open modal when any project image area is clicked (but not the external links)
        projectsGrid.addEventListener('click', (event) => {
            // If user clicked on project link icons, let those work normally
            if (event.target.closest('.project-link')) return;

            const imageContainer = event.target.closest('.project-image');
            if (!imageContainer) return;

            const img = imageContainer.querySelector('.project-img');
            if (!img) return;

            modalImage.src = img.src;
            modalImage.alt = img.alt || '';
            imageModal.classList.add('open');
            document.body.classList.add('modal-open');
        });

        // Close modal on close button
        imageModalClose.addEventListener('click', () => {
            imageModal.classList.remove('open');
            document.body.classList.remove('modal-open');
        });

        // Close modal when clicking outside the image
        imageModal.addEventListener('click', (event) => {
            if (event.target === imageModal) {
                imageModal.classList.remove('open');
                document.body.classList.remove('modal-open');
            }
        });

        // Close modal on ESC key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && imageModal.classList.contains('open')) {
                imageModal.classList.remove('open');
                document.body.classList.remove('modal-open');
            }
        });
    }

    // Listen for storage changes (when projects are added/updated in admin)
    window.addEventListener('storage', () => {
        loadProjects();
    });
    
    // Also check for changes in the same window (for when admin is in same tab)
    setInterval(() => {
        const currentProjects = getProjects();
        const displayedCount = document.querySelectorAll('.project-card').length;
        const publishedCount = currentProjects.filter(p => p.published).length;
        
        if (displayedCount !== publishedCount) {
            loadProjects();
        }
    }, 1000);
});
