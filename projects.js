document.addEventListener('DOMContentLoaded', () => {
    // --- Filtering Logic ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectCount = document.getElementById('projectCount');
    const searchInput = document.getElementById('projectSearch');

    function updateFilters() {
        const filterValue = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        const searchTerm = searchInput.value.toLowerCase();
        let visibleCount = 0;

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('.card-desc').textContent.toLowerCase();

            const matchesFilter = filterValue === 'all' || category === filterValue;
            const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);

            if (matchesFilter && matchesSearch) {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, 10);
                visibleCount++;
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        if (projectCount) {
            projectCount.textContent = `${visibleCount} project${visibleCount !== 1 ? 's' : ''}`;
        }
    }

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateFilters();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', updateFilters);
    }

    // --- Lightbox Popup Logic ---
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.getElementById('imageModalClose');

    // Use event delegation for lightbox triggers to handle filtered items
    document.addEventListener('click', (e) => {
        // Check if clicked element or its parent is a lightbox trigger
        const trigger = e.target.closest('.project-preview');
        if (trigger) {
            const img = trigger.querySelector('img');
            if (img) {
                modal.classList.add('open');
                modalImg.src = img.src;
                modalImg.alt = img.alt;
                document.body.classList.add('modal-open');
            }
        }
    });

    if (modal && modalImg && closeBtn) {
        const closeModal = () => {
            modal.classList.remove('open');
            document.body.classList.remove('modal-open');
            setTimeout(() => { modalImg.src = ''; }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-content-wrapper')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    // --- View Toggle Logic ---
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const projectsGrid = document.querySelector('.projects-grid');

    if (toggleBtns.length > 0 && projectsGrid) {
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const view = btn.getAttribute('data-view');
                if (view === 'stack') {
                    projectsGrid.style.gridTemplateColumns = '1fr';
                } else {
                    projectsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                }
            });
        });
    }
});
