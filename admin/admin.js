// ===== PROJECT STORAGE =====
// Get projects from localStorage or initialize empty array
function getProjects() {
    const projects = localStorage.getItem('portfolioProjects');
    return projects ? JSON.parse(projects) : [];
}

// Save projects to localStorage
function saveProjects(projects) {
    localStorage.setItem('portfolioProjects', JSON.stringify(projects));
}

// Generate unique ID for projects
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== IMAGE UPLOAD HANDLING =====
const projectImageFile = document.getElementById('projectImageFile');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const imageFileName = document.getElementById('imageFileName');
const projectImage = document.getElementById('projectImage');

// Convert file to base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No file selected');
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            reject('Image size must be less than 5MB');
            return;
        }
        
        // Check file type
        if (!file.type.match('image/(png|jpeg|jpg)')) {
            reject('Only PNG and JPG images are allowed');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.onerror = (e) => {
            reject('Error reading file');
        };
        reader.readAsDataURL(file);
    });
}

// Handle image file selection
if (projectImageFile) {
    projectImageFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const base64 = await convertImageToBase64(file);
            
            // Store base64 in hidden input
            if (projectImage) {
                projectImage.value = base64;
            }
            
            // Show preview
            if (previewImg) {
                previewImg.src = base64;
            }
            if (imagePreview) {
                imagePreview.style.display = 'block';
            }
            if (imageFileName) {
                imageFileName.textContent = file.name;
            }
        } catch (error) {
            showNotification(error, 'error');
            projectImageFile.value = '';
        }
    });
}

// Remove image function
function removeImage() {
    if (projectImageFile) {
        projectImageFile.value = '';
    }
    if (projectImage) {
        projectImage.value = '';
    }
    if (imagePreview) {
        imagePreview.style.display = 'none';
    }
    if (imageFileName) {
        imageFileName.textContent = '';
    }
    if (previewImg) {
        previewImg.src = '';
    }
}

// ===== CATEGORY CHANGE HANDLER =====
const projectCategory = document.getElementById('projectCategory');
const imageFieldGroup = document.getElementById('imageFieldGroup');

if (projectCategory && imageFieldGroup) {
    projectCategory.addEventListener('change', (e) => {
        if (e.target.value === 'social') {
            // Show image field and make it required for social media
            imageFieldGroup.style.display = 'flex';
            if (projectImageFile) {
                projectImageFile.setAttribute('required', 'required');
            }
        } else {
            // Hide image field and remove required
            imageFieldGroup.style.display = 'none';
            if (projectImageFile) {
                projectImageFile.removeAttribute('required');
            }
            // Clear image when hiding
            removeImage();
        }
    });
}

// ===== FORM HANDLING =====
const projectForm = document.getElementById('projectForm');

if (projectForm) {
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(projectForm);
        const category = formData.get('category');
        const image = projectImage ? projectImage.value : null;
        
        // Validate image for social media category
        if (category === 'social' && !image) {
            showNotification('Image is required for Social Media projects! Please upload an image.', 'error');
            return;
        }
        
    const project = {
        id: generateId(),
        title: formData.get('title'),
        description: formData.get('description'),
            category: category,
        tags: formData.get('tags').split(',').map(tag => tag.trim()),
            image: image || null,
        liveLink: formData.get('liveLink') || null,
        githubLink: formData.get('githubLink') || null,
        published: formData.get('published') === 'on',
        dateAdded: new Date().toISOString()
    };
    
    // Get existing projects
    const projects = getProjects();
    
    // Add new project
    projects.unshift(project); // Add to beginning
    
    // Save projects
    saveProjects(projects);
    
    // Show success message
    showNotification('Project added successfully!', 'success');
    
    // Reset form
    projectForm.reset();
        
        // Clear image preview and hide image field if not social
        removeImage();
        if (imageFieldGroup) {
            imageFieldGroup.style.display = 'none';
        }
        if (projectImageFile) {
            projectImageFile.removeAttribute('required');
        }
    
    // Reload projects list
    loadProjectsList();
});
}

// ===== LOAD PROJECTS LIST =====
function loadProjectsList() {
    const projects = getProjects();
    const projectsList = document.getElementById('projectsList');
    
    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No projects yet. Add your first project above!</p>
            </div>
        `;
        return;
    }
    
    projectsList.innerHTML = projects.map(project => `
        <div class="project-item">
            <div class="project-item-header">
                <div>
                    <div class="project-item-title">${project.title}</div>
                    <span class="project-item-category">${getCategoryName(project.category)}</span>
                </div>
                <span class="status-badge ${project.published ? 'status-published' : 'status-draft'}">
                    ${project.published ? 'Published' : 'Draft'}
                </span>
            </div>
            <p class="project-item-description">${project.description}</p>
            <div class="project-item-tags">
                ${project.tags.map(tag => `<span class="project-item-tag">${tag}</span>`).join('')}
            </div>
            <div class="project-item-actions">
                <button class="action-btn btn-toggle" onclick="togglePublish('${project.id}')">
                    <i class="fas ${project.published ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    ${project.published ? 'Unpublish' : 'Publish'}
                </button>
                <button class="action-btn btn-edit" onclick="editProject('${project.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn btn-delete" onclick="deleteProject('${project.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// ===== PROJECT ACTIONS =====
function togglePublish(id) {
    const projects = getProjects();
    const project = projects.find(p => p.id === id);
    
    if (project) {
        project.published = !project.published;
        saveProjects(projects);
        loadProjectsList();
        showNotification(`Project ${project.published ? 'published' : 'unpublished'}!`, 'success');
    }
}

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        const projects = getProjects();
        const filteredProjects = projects.filter(p => p.id !== id);
        saveProjects(filteredProjects);
        loadProjectsList();
        showNotification('Project deleted!', 'success');
    }
}

function editProject(id) {
    const projects = getProjects();
    const project = projects.find(p => p.id === id);
    
    if (project) {
        // Fill form with project data
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectCategory').value = project.category;
        document.getElementById('projectTags').value = project.tags.join(', ');
        document.getElementById('projectLink').value = project.liveLink || '';
        document.getElementById('projectGithub').value = project.githubLink || '';
        document.getElementById('projectPublished').checked = project.published;
        
        // Show/hide image field based on category
        if (project.category === 'social') {
            if (imageFieldGroup) {
                imageFieldGroup.style.display = 'flex';
            }
            if (projectImageFile) {
                projectImageFile.setAttribute('required', 'required');
            }
            
            // Load existing image if available
            if (project.image) {
                if (projectImage) {
                    projectImage.value = project.image;
                }
                if (previewImg) {
                    previewImg.src = project.image;
                }
                if (imagePreview) {
                    imagePreview.style.display = 'block';
                }
                if (imageFileName) {
                    imageFileName.textContent = 'Current image';
                }
            }
        } else {
            if (imageFieldGroup) {
                imageFieldGroup.style.display = 'none';
            }
            if (projectImageFile) {
                projectImageFile.removeAttribute('required');
            }
            removeImage();
        }
        
        // Delete old project (will be re-added on submit)
        const filteredProjects = projects.filter(p => p.id !== id);
        saveProjects(filteredProjects);
        
        // Scroll to form
        document.querySelector('.admin-form-container').scrollIntoView({ behavior: 'smooth' });
        
        showNotification('Project loaded for editing. Update and submit to save changes.', 'success');
    }
}

// ===== HELPER FUNCTIONS =====
function getCategoryName(category) {
    const categories = {
        'web': 'Web Design',
        'app': 'Web App',
        'mobile': 'Mobile',
        'social': 'Social Media'
    };
    return categories[category] || category;
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

// ===== PASSWORD PROTECTION =====
// Default password - CHANGE THIS to your own password
const ADMIN_PASSWORD = 'admin123'; // Change this password!

// Check if user is already logged in
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    return isAuthenticated;
}

// Login form handling
const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginError = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            // Set authentication
            sessionStorage.setItem('adminAuthenticated', 'true');
            
            // Hide login, show admin and navigation
            loginSection.style.display = 'none';
            adminSection.style.display = 'block';
            if (document.getElementById('adminNav')) {
                document.getElementById('adminNav').style.display = 'block';
            }
            
            // Load projects
            loadProjectsList();
        } else {
            // Show error
            loginError.textContent = 'Incorrect password. Please try again.';
            loginError.style.display = 'block';
            document.getElementById('adminPassword').value = '';
        }
    });
}

// ===== CONTACT MESSAGES STORAGE =====
function getContactMessages() {
    const messages = localStorage.getItem('portfolioContactMessages');
    return messages ? JSON.parse(messages) : [];
}

function saveContactMessages(messages) {
    localStorage.setItem('portfolioContactMessages', JSON.stringify(messages));
}

// ===== SKILLS STORAGE =====
function getSkills() {
    const skills = localStorage.getItem('portfolioSkills');
    return skills ? JSON.parse(skills) : [];
}

function saveSkills(skills) {
    localStorage.setItem('portfolioSkills', JSON.stringify(skills));
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
        saveSkills(defaultSkills);
    }
}

// ===== SKILL FORM HANDLING =====
const skillForm = document.getElementById('skillForm');

if (skillForm) {
    skillForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(skillForm);
        const iconValue = formData.get('icon') ? formData.get('icon').trim() : 'fas fa-code';
        const skill = {
            id: Date.now().toString(),
            name: formData.get('name'),
            category: formData.get('category'),
            percentage: parseInt(formData.get('percentage')),
            icon: iconValue
        };
        
        // Get existing skills
        const skills = getSkills();
        
        // Add new skill
        skills.push(skill);
        
        // Save skills
        saveSkills(skills);
        
        // Show success message
        showNotification('Skill added successfully!', 'success');
        
        // Reset form
        skillForm.reset();
        
        // Reload skills list
        loadSkillsList();
    });
}

// ===== LOAD SKILLS LIST =====
function loadSkillsList() {
    const skills = getSkills();
    const skillsList = document.getElementById('skillsList');
    
    if (skills.length === 0) {
        skillsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-code"></i>
                <p>No skills yet. Add your first skill above!</p>
            </div>
        `;
        return;
    }
    
    skillsList.innerHTML = skills.map(skill => {
        const categoryNames = {
            'frontend': 'Frontend Development',
            'backend': 'Backend Development',
            'design': 'Design & Tools'
        };
        
        return `
            <div class="project-item">
                <div class="project-item-header">
                    <div>
                        <div class="project-item-title">
                            <i class="${skill.icon || 'fas fa-code'}"></i> ${skill.name}
                        </div>
                        <span class="project-item-category">${categoryNames[skill.category] || skill.category}</span>
                    </div>
                    <div class="skill-percentage-display">${skill.percentage}%</div>
                </div>
                <div class="project-item-description">
                    <div class="skill-bar-preview">
                        <div class="skill-progress-preview" style="width: ${skill.percentage}%"></div>
                    </div>
                </div>
                <div class="project-item-actions">
                    <button class="action-btn btn-edit" onclick="editSkill('${skill.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteSkill('${skill.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== SKILL ACTIONS =====
function editSkill(id) {
    const skills = getSkills();
    const skill = skills.find(s => s.id === id);
    
    if (skill) {
        // Fill form with skill data
        document.getElementById('skillName').value = skill.name;
        document.getElementById('skillCategory').value = skill.category;
        document.getElementById('skillPercentage').value = skill.percentage;
        const iconInput = document.getElementById('skillIcon');
        iconInput.value = skill.icon || '';
        
        // Show icon preview if icon exists
        if (skill.icon && iconPreview && previewIcon) {
            previewIcon.className = skill.icon.trim();
            iconPreview.style.display = 'flex';
        }
        
        // Delete old skill (will be re-added on submit)
        const filteredSkills = skills.filter(s => s.id !== id);
        saveSkills(filteredSkills);
        
        // Scroll to form
        document.querySelector('.admin-form-container').scrollIntoView({ behavior: 'smooth' });
        
        showNotification('Skill loaded for editing. Update and submit to save changes.', 'success');
    }
}

function deleteSkill(id) {
    if (confirm('Are you sure you want to delete this skill?')) {
        const skills = getSkills();
        const filteredSkills = skills.filter(s => s.id !== id);
        saveSkills(filteredSkills);
        loadSkillsList();
        showNotification('Skill deleted!', 'success');
    }
}

// ===== TAB SWITCHING =====
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
            
            // Load appropriate list
            if (targetTab === 'projects') {
                loadProjectsList();
            } else if (targetTab === 'skills') {
                loadSkillsList();
            } else if (targetTab === 'messages') {
                loadContactMessages();
            } else if (targetTab === 'reviews') {
                loadReviews();
            }
        });
    });
});

// ===== LOAD CONTACT MESSAGES =====
function loadContactMessages() {
    let messages = getContactMessages();
    const messagesList = document.getElementById('messagesList');
    const totalMessages = document.getElementById('totalMessages');
    const unreadMessages = document.getElementById('unreadMessages');
    
    // Mark all existing messages as read (in case there are old unread messages)
    let updated = false;
    messages = messages.map(msg => {
        if (!msg.read) {
            msg.read = true;
            updated = true;
        }
        return msg;
    });
    
    // Save updated messages if any were changed
    if (updated) {
        saveContactMessages(messages);
    }
    
    // Update stats
    if (totalMessages) {
        totalMessages.textContent = `${messages.length} Total`;
    }
    if (unreadMessages) {
        unreadMessages.textContent = `0 Unread`; // Always 0 since all messages are read
    }
    
    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No messages yet. Messages from contact form will appear here.</p>
            </div>
        `;
        return;
    }
    
    messagesList.innerHTML = messages.map(message => {
        const date = new Date(message.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Always show as read
        const readClass = 'read';
        const readIcon = 'fa-envelope-open';
        
        return `
            <div class="project-item message-item ${readClass}" data-id="${message.id}">
                <div class="project-item-header">
                    <div>
                        <div class="project-item-title">
                            <i class="fas ${readIcon}"></i> ${message.name}
                        </div>
                        <span class="project-item-category">${message.email}</span>
                    </div>
                    <div class="message-date">${formattedDate}</div>
                </div>
                <div class="project-item-description">
                    <div class="message-subject">
                        <strong>Subject:</strong> ${message.subject}
                    </div>
                    <div class="message-text">
                        ${message.message}
                    </div>
                </div>
                <div class="project-item-actions">
                    <button class="action-btn btn-email" onclick="window.location.href='mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}&body=${encodeURIComponent('Hi ' + message.name + ',\n\n')}'">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteMessage('${message.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== MESSAGE ACTIONS =====
function deleteMessage(id) {
    if (confirm('Are you sure you want to delete this message?')) {
        const messages = getContactMessages();
        const filteredMessages = messages.filter(m => m.id !== id);
        saveContactMessages(filteredMessages);
        loadContactMessages();
        showNotification('Message deleted!', 'success');
    }
}

// ===== REVIEW STORAGE =====
function getReviews() {
    const reviews = localStorage.getItem('userReviews');
    return reviews ? JSON.parse(reviews) : [];
}

function saveReviews(reviews) {
    localStorage.setItem('userReviews', JSON.stringify(reviews));
}

// ===== LOAD REVIEWS =====
function loadReviews() {
    const reviews = getReviews();
    const reviewsList = document.getElementById('reviewsList');
    const totalReviews = document.getElementById('totalReviews');
    
    // Update stats
    if (totalReviews) {
        totalReviews.textContent = `${reviews.length} Total`;
    }
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <p>No reviews yet. Reviews from clients will appear here.</p>
            </div>
        `;
        return;
    }
    
    // Sort reviews by timestamp (newest first)
    const sortedReviews = reviews.sort((a, b) => {
        const timestampA = a.timestamp || 0;
        const timestampB = b.timestamp || 0;
        return timestampB - timestampA; // Newest first
    });
    
    reviewsList.innerHTML = sortedReviews.map(review => {
        const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        const date = review.date || 'N/A';
        
        return `
            <div class="project-item message-item" data-id="${review.id}">
                <div class="project-item-header">
                    <div>
                        <div class="project-item-title">
                            <i class="fas fa-user"></i> ${review.name}
                        </div>
                        <span class="project-item-category">${review.role || 'Client'}</span>
                    </div>
                    <div class="message-date">${date}</div>
                </div>
                <div class="project-item-description">
                    <div class="user-review-rating" style="margin-bottom: 1rem; color: #fbbf24; font-size: 1rem;">
                        ${Array(review.rating).fill(0).map(() => '<i class="fas fa-star"></i>').join('')}
                        ${Array(5 - review.rating).fill(0).map(() => '<i class="far fa-star"></i>').join('')}
                        <span style="margin-left: 0.5rem; color: var(--text-secondary);">(${review.rating}/5)</span>
                    </div>
                    <div class="message-text" style="margin-bottom: 0.5rem;">
                        ${review.message}
                    </div>
                    <div class="message-subject" style="margin-top: 0.5rem;">
                        <strong>Project:</strong> ${review.project || 'General Project'}
                    </div>
                </div>
                <div class="project-item-actions">
                    <button class="action-btn btn-delete" onclick="deleteReview('${review.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== REVIEW ACTIONS =====
function deleteReview(id) {
    if (confirm('Are you sure you want to delete this review?')) {
        const reviews = getReviews();
        const filteredReviews = reviews.filter(r => r.id !== id);
        saveReviews(filteredReviews);
        loadReviews();
        showNotification('Review deleted!', 'success');
    }
}

// ===== ICON PREVIEW =====
const skillIconInput = document.getElementById('skillIcon');
const iconPreview = document.getElementById('iconPreview');
const previewIcon = document.getElementById('previewIcon');

if (skillIconInput && iconPreview && previewIcon) {
    skillIconInput.addEventListener('input', (e) => {
        const iconValue = e.target.value.trim();
        if (iconValue) {
            // Update preview icon
            previewIcon.className = iconValue;
            iconPreview.style.display = 'flex';
            
            // Check if icon might not exist (common mistakes)
            if (iconValue.includes('photoshop') && !iconValue.includes('adobe') && !iconValue.includes('image')) {
                // Show warning for Photoshop
                const small = skillIconInput.nextElementSibling;
                if (small && !small.querySelector('.icon-warning')) {
                    const warning = document.createElement('div');
                    warning.className = 'icon-warning';
                    warning.style.cssText = 'color: #fbbf24; margin-top: 0.5rem; font-size: 0.85rem;';
                    warning.innerHTML = '⚠️ <code>fab fa-photoshop</code> doesn\'t exist. Try <code>fab fa-adobe</code> or <code>fas fa-image</code>';
                    small.appendChild(warning);
                }
            } else {
                // Remove warning if exists
                const warning = small?.querySelector('.icon-warning');
                if (warning) warning.remove();
            }
        } else {
            iconPreview.style.display = 'none';
        }
    });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Check if already authenticated
    if (checkAuth()) {
        loginSection.style.display = 'none';
        adminSection.style.display = 'block';
        if (document.getElementById('adminNav')) {
            document.getElementById('adminNav').style.display = 'block';
        }
        initializeDefaultSkills();
    loadProjectsList();
        loadSkillsList();
        loadContactMessages();
    } else {
        loginSection.style.display = 'block';
        adminSection.style.display = 'none';
        if (document.getElementById('adminNav')) {
            document.getElementById('adminNav').style.display = 'none';
        }
    }
});

