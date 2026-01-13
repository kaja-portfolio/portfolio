// ===== GET SKILLS FROM STORAGE =====
function getSkills() {
    const skills = localStorage.getItem('portfolioSkills');
    return skills ? JSON.parse(skills) : [];
}

// ===== INITIALIZE DEFAULT SKILLS (if no skills exist) =====
function initializeDefaultSkills() {
    const skills = getSkills();
    if (skills.length === 0) {
        const defaultSkills = [
            // Frontend Skills
            { id: '1', name: 'HTML5', category: 'frontend', percentage: 95, icon: 'fab fa-html5' },
            { id: '2', name: 'CSS3', category: 'frontend', percentage: 90, icon: 'fab fa-css3-alt' },
            { id: '3', name: 'JavaScript', category: 'frontend', percentage: 88, icon: 'fab fa-js' },
            { id: '4', name: 'React', category: 'frontend', percentage: 85, icon: 'fab fa-react' },
            { id: '5', name: 'Vue.js', category: 'frontend', percentage: 80, icon: 'fab fa-vue' },
            { id: '6', name: 'Angular', category: 'frontend', percentage: 75, icon: 'fab fa-angular' },
            // Backend Skills
            { id: '7', name: 'Node.js', category: 'backend', percentage: 85, icon: 'fab fa-node' },
            { id: '8', name: 'Python', category: 'backend', percentage: 80, icon: 'fab fa-python' },
            { id: '9', name: 'PHP', category: 'backend', percentage: 75, icon: 'fab fa-php' },
            { id: '10', name: 'MongoDB', category: 'backend', percentage: 82, icon: 'fas fa-database' },
            { id: '11', name: 'MySQL', category: 'backend', percentage: 78, icon: 'fas fa-database' },
            { id: '12', name: 'Firebase', category: 'backend', percentage: 80, icon: 'fab fa-firebase' },
            // Design Skills
            { id: '13', name: 'Figma', category: 'design', percentage: 90, icon: 'fab fa-figma' },
            { id: '14', name: 'Adobe XD', category: 'design', percentage: 85, icon: 'fab fa-adobe' },
            { id: '15', name: 'Git', category: 'design', percentage: 88, icon: 'fab fa-git-alt' },
            { id: '16', name: 'SASS', category: 'design', percentage: 85, icon: 'fab fa-sass' },
            { id: '17', name: 'Bootstrap', category: 'design', percentage: 90, icon: 'fab fa-bootstrap' },
            { id: '18', name: 'NPM', category: 'design', percentage: 85, icon: 'fab fa-npm' }
        ];
        localStorage.setItem('portfolioSkills', JSON.stringify(defaultSkills));
    }
}

// ===== CATEGORY CONFIGURATION =====
const categoryConfig = {
    'frontend': {
        title: 'Frontend Development',
        icon: 'fas fa-code'
    },
    'backend': {
        title: 'Backend Development',
        icon: 'fas fa-server'
    },
    'design': {
        title: 'Design & Tools',
        icon: 'fas fa-paint-brush'
    }
};

// ===== LOAD AND DISPLAY SKILLS =====
function loadSkills() {
    initializeDefaultSkills();
    const skills = getSkills();
    const skillsContainer = document.getElementById('skillsContainer');
    
    // Group skills by category
    const skillsByCategory = {};
    skills.forEach(skill => {
        if (!skillsByCategory[skill.category]) {
            skillsByCategory[skill.category] = [];
        }
        skillsByCategory[skill.category].push(skill);
    });
    
    // Build HTML for each category
    let html = '';
    Object.keys(categoryConfig).forEach(categoryKey => {
        if (skillsByCategory[categoryKey] && skillsByCategory[categoryKey].length > 0) {
            const category = categoryConfig[categoryKey];
            html += `
                <div class="skills-category">
                    <h2 class="category-title">
                        <i class="${category.icon}"></i>
                        ${category.title}
                    </h2>
                    <div class="skills-grid">
                        ${skillsByCategory[categoryKey].map(skill => {
                            // Ensure icon is properly formatted and trimmed
                            const iconClass = (skill.icon && skill.icon.trim()) ? skill.icon.trim() : 'fas fa-code';
                            return `
                            <div class="skill-item">
                                <div class="skill-icon">
                                    <i class="${iconClass}"></i>
                                </div>
                                <h3>${skill.name}</h3>
                                <div class="skill-bar">
                                    <div class="skill-progress" data-width="${skill.percentage}"></div>
                                </div>
                                <span class="skill-percent">${skill.percentage}%</span>
                            </div>
                        `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    skillsContainer.innerHTML = html;
    
    // Initialize animations after loading
    initializeSkillAnimations();
}

// ===== INITIALIZE SKILL ANIMATIONS =====
function initializeSkillAnimations() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    const animateSkillBar = (bar, targetWidth) => {
        // Ensure bar starts at 0
        bar.style.width = '0%';
        // Force reflow
        bar.offsetHeight;
        // Animate to target width
        setTimeout(() => {
            bar.style.width = targetWidth + '%';
        }, 100);
    };
    
    // Animate percentage number
    const animatePercentage = (element, target) => {
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '%';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '%';
            }
        }, 50);
    };
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                
                // Find the progress bar within this skill item
                const progressBar = entry.target.querySelector('.skill-progress');
                const percentElement = entry.target.querySelector('.skill-percent');
                
                if (progressBar) {
                    const targetWidth = parseInt(progressBar.getAttribute('data-width')) || 0;
                    
                    // Animate the progress bar
                    animateSkillBar(progressBar, targetWidth);
                    
                    // Animate the percentage text
                    if (percentElement) {
                        animatePercentage(percentElement, targetWidth);
                    }
                }
            }
        });
    }, {
        threshold: 0.3
    });
    
    // Initialize all bars to 0 and observe skill items
    skillItems.forEach(item => {
        const progressBar = item.querySelector('.skill-progress');
        if (progressBar) {
            progressBar.style.width = '0%';
        }
        skillObserver.observe(item);
    });
    
    // Skill icon hover effect
    document.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.skill-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.skill-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Category animation
    const categoryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    const categories = document.querySelectorAll('.skills-category');
    categories.forEach(category => {
        category.style.opacity = '0';
        category.style.transform = 'translateY(30px)';
        category.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        categoryObserver.observe(category);
    });
}

// ===== LOAD SKILLS ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    loadSkills();
    
    // Listen for storage changes (when skills are added/updated in admin)
    window.addEventListener('storage', () => {
        loadSkills();
    });
    
    // Also check for changes in the same window
    setInterval(() => {
        const currentSkills = getSkills();
        const displayedCount = document.querySelectorAll('.skill-item').length;
        const totalCount = currentSkills.length;
        
        if (displayedCount !== totalCount) {
            loadSkills();
        }
    }, 1000);
});
