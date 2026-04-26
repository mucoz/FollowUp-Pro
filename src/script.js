// =============== VERİ YAPISI ===============
let topics = [];
let nextId = 1;
let deleteTarget = { type: null, id: null, topicId: null, parentId: null };
let currentEditTopic = null;
let currentTab = 'active'; // 'active' or 'completed'

// XP ve Level Sistemi
let userXP = 0;
let userLevel = 1;

// =============== YARDIMCI FONKSİYONLAR ===============
class FollowUpAlgorithm {
    static calculateRank(topic) {
        let score = 0;
        const entryCount = this.countEntries(topic.entries);
        score += entryCount * 50;
        
        if (topic.lastActivity && !topic.completed) {
            const daysSinceActivity = (Date.now() - topic.lastActivity) / (1000 * 60 * 60 * 24);
            const recencyScore = Math.max(0, 100 - daysSinceActivity * 2);
            score += recencyScore * 0.3;
        }
        
        const avgDepth = this.calculateAverageDepth(topic.entries);
        score += avgDepth * 20;
        
        return score;
    }
    
    static countEntries(entries) {
        let count = entries.length;
        for (let entry of entries) {
            if (entry.children) {
                count += this.countEntries(entry.children);
            }
        }
        return count;
    }
    
    static calculateAverageDepth(entries, currentDepth = 1) {
        if (entries.length === 0) return 0;
        let totalDepth = 0;
        let count = 0;
        
        for (let entry of entries) {
            totalDepth += currentDepth;
            count++;
            if (entry.children && entry.children.length > 0) {
                const childStats = this.calculateAverageDepth(entry.children, currentDepth + 1);
                totalDepth += childStats.total;
                count += childStats.count;
            }
        }
        return count > 0 ? totalDepth / count : 0;
    }
}

// XP Yönetimi
class XPSystem {
    static async addXP(amount, action = 'entry_added') {
        userXP += amount;
        
        const oldLevel = userLevel;
        userLevel = Math.floor(userXP / 1000) + 1;
        
        updateXPDisplay();
        
        if (userLevel > oldLevel) {
            await showAdvancedCelebration();
            showNotification(`🎉 LEVEL UP! Level ${userLevel} 🎉`, 'levelup');
        }
        
        if (action === 'entry_added' && amount === 25) {
            if (Math.random() < 0.3) {
                userXP += 25;
                showNotification('⚡ CRITICAL! +25 Bonus XP!', 'bonus');
                await showConfetti(3);
            }
        }
        
        saveToLocal();
        return userLevel;
    }
    
    static getXPReward(action) {
        const rewards = {
            'topic_created': 50,
            'entry_added': 25,
            'entry_deleted': -10,
            'topic_completed': 100,
            'topic_reactivated': 50
        };
        return rewards[action] || 10;
    }
}

// Gelişmiş Kutlama Efektleri
async function showAdvancedCelebration() {
    // Çoklu konfeti dalgası
    for (let i = 0; i < 5; i++) {
        setTimeout(() => showConfetti(8), i * 200);
    }
    
    // Havai fişek efekti
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * window.innerWidth + 'px';
            firework.style.top = Math.random() * window.innerHeight * 0.5 + 'px';
            firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            document.body.appendChild(firework);
            setTimeout(() => firework.remove(), 1000);
        }, i * 100);
    }
    
    // Ekran flaşı
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = 9999;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
}

async function showConfetti(waveCount = 3) {
    const canvas = document.getElementById('confettiCanvas');
    canvas.classList.remove('hidden');
    
    for (let w = 0; w < waveCount; w++) {
        setTimeout(() => {
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFD700', '#FF1493'];
            for (let i = 0; i < 80; i++) {
                const piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                piece.style.left = Math.random() * window.innerWidth + 'px';
                piece.style.top = '-10px';
                piece.style.width = Math.random() * 8 + 4 + 'px';
                piece.style.height = Math.random() * 8 + 4 + 'px';
                piece.style.animationDuration = Math.random() * 2 + 1 + 's';
                piece.style.animationDelay = Math.random() * 0.5 + 's';
                canvas.appendChild(piece);
                
                setTimeout(() => piece.remove(), 3000);
            }
        }, w * 200);
    }
    
    setTimeout(() => canvas.classList.add('hidden'), 3000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    let bgColor = 'bg-white/95';
    let icon = 'fa-info-circle';
    let iconColor = 'text-blue-500';
    
    if (type === 'success') {
        icon = 'fa-check-circle';
        iconColor = 'text-green-500';
    } else if (type === 'bonus') {
        icon = 'fa-bolt';
        iconColor = 'text-yellow-500';
    } else if (type === 'levelup') {
        icon = 'fa-trophy';
        iconColor = 'text-yellow-500';
        bgColor = 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
    }
    
    notification.className = `fixed top-20 right-3 z-50 ios-card ${bgColor} backdrop-blur rounded-xl px-4 py-2 shadow-2xl transform transition-all duration-300 animate-bounce`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fas ${icon} ${iconColor} text-sm"></i>
            <span class="font-semibold text-sm ${type === 'levelup' ? 'text-white' : 'text-gray-800'}">${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

function updateXPDisplay() {
    const currentLevelXP = (userLevel - 1) * 1000;
    const nextLevelXP = userLevel * 1000;
    const xpInCurrentLevel = userXP - currentLevelXP;
    const progressPercent = (xpInCurrentLevel / 1000) * 100;
    
    document.getElementById('totalXp').textContent = userXP;
    document.getElementById('level').textContent = userLevel;
    document.getElementById('xpProgressBar').style.width = `${progressPercent}%`;
    document.getElementById('xpProgressText').textContent = `${xpInCurrentLevel}/1000 XP`;
}

// Modal Yönetimi
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // İlk input'u bul ve focusla
        setTimeout(() => {
            const firstInput = modal.querySelector('input:not([type="hidden"]), textarea, button:not(.close-modal)');
            if (firstInput && firstInput.focus) {
                firstInput.focus();
                // Input tipine göre seçim yap
                if (firstInput.tagName === 'INPUT' || firstInput.tagName === 'TEXTAREA') {
                    firstInput.select();
                }
            }
        }, 150);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Entry Render (Recursive) - Daha kompakt
function renderEntries(entries, level = 0, topicId, parentId = null, isReadOnly = false) {
    if (!entries || entries.length === 0) return '';
    
    return entries.map(entry => `
        <div class="entry-item ml-${Math.min(level * 3, 8)} relative pl-3 py-1">
            <div class="bg-white/80 backdrop-blur rounded-lg p-2 mb-1 shadow-sm">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="text-gray-800 text-xs">${escapeHtml(entry.title)}</h4>
                        <p class="font-semibold text-red-600 text-xs mt-0.5">${escapeHtml(entry.question)}</p>
                        <div class="text-[10px] text-gray-400 mt-1">
                            <i class="far fa-clock"></i> ${new Date(entry.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                    ${!isReadOnly ? `
                        <div class="flex gap-1 ml-2">
                            <button onclick="openEditEntryModal('${topicId}', '${entry.id}', '${parentId || ''}')" class="text-blue-500 hover:text-blue-700 transition text-xs">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteEntry('${topicId}', '${entry.id}', '${parentId || ''}')" class="text-red-500 hover:text-red-700 transition text-xs">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                ${!isReadOnly ? `
                    <button onclick="openEntryModal('${topicId}', '${entry.id}')" class="mt-1 text-blue-500 text-xs hover:text-blue-700 transition">
                        <i class="fas fa-reply"></i> Follow up
                    </button>
                ` : ''}
            </div>
            ${entry.children && entry.children.length > 0 ? renderEntries(entry.children, level + 1, topicId, entry.id, isReadOnly) : ''}
        </div>
    `).join('');
}

// Topic Render
function renderTopics() {
    let filteredTopics = currentTab === 'active' 
        ? topics.filter(t => !t.completed)
        : topics.filter(t => t.completed);
    
    const rankedTopics = [...filteredTopics].sort((a, b) => {
        if (currentTab === 'active') {
            const rankA = FollowUpAlgorithm.calculateRank(a);
            const rankB = FollowUpAlgorithm.calculateRank(b);
            return rankB - rankA;
        }
        return b.completedAt - a.completedAt;
    });
    
    const container = document.getElementById('topicsContainer');
    const isReadOnly = currentTab === 'completed';
    
    if (rankedTopics.length === 0) {
        container.innerHTML = `
            <div class="ios-card bg-white/10 backdrop-blur rounded-2xl p-8 text-center">
                <i class="fas ${currentTab === 'active' ? 'fa-lightbulb' : 'fa-check-circle'} text-4xl text-white/30 mb-2"></i>
                <h3 class="text-base font-semibold text-white mb-1">${currentTab === 'active' ? 'There are not active topics yet' : 'There are no completed topics yet'}</h3>
                <p class="text-white/60 text-xs">${currentTab === 'active' ? 'Start by clicking the "New Topic" button!' : 'The topics you have completed will appear here'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = rankedTopics.map(topic => `
        <div class="topic-card ios-card bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20">
            <!-- Topic Header - Daha kompakt -->
            <div class="p-3 cursor-pointer" onclick="toggleTopic('${topic.id}')">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                            <h2 class="text-base font-bold text-white">${escapeHtml(topic.title)}</h2>
                            <span class="px-1.5 py-0.5 bg-blue-500/30 text-blue-200 rounded-full text-[10px]">
                                📊 ${FollowUpAlgorithm.countEntries(topic.entries)} entry
                            </span>
                            ${currentTab === 'active' ? `
                                <span class="px-1.5 py-0.5 bg-purple-500/30 text-purple-200 rounded-full text-[10px]">
                                    🏆 ${Math.floor(FollowUpAlgorithm.calculateRank(topic))} puan
                                </span>
                            ` : `
                                <span class="px-1.5 py-0.5 bg-green-500/30 text-green-200 rounded-full text-[10px]">
                                    ✅ ${new Date(topic.completedAt).toLocaleDateString('tr-TR')}
                                </span>
                            `}
                        </div>
                        ${topic.description ? `<p class="text-white/70 text-xs">${escapeHtml(topic.description)}</p>` : ''}
                    </div>
                    <div class="flex gap-1 ml-2">
                        ${!isReadOnly ? `
                            <button onclick="event.stopPropagation(); openEditTopicModal('${topic.id}')" class="text-white/70 hover:text-white transition text-sm">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="event.stopPropagation(); deleteTopic('${topic.id}')" class="text-white/70 hover:text-red-400 transition text-sm">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        ` : ''}
                        <i class="fas fa-chevron-down text-white/70 transition-transform duration-200 text-sm" id="chevron-${topic.id}"></i>
                    </div>
                </div>
            </div>
            
            <!-- Topic Content (Expandable) - Daha kompakt -->
            <div id="topic-${topic.id}" class="hidden px-3 pb-3">
                ${topic.entries && topic.entries.length > 0 ? renderEntries(topic.entries, 0, topic.id, null, isReadOnly) : `
                    <div class="text-center py-4 text-white/50 text-sm">
                        <i class="fas fa-comment-dots text-2xl mb-1"></i>
                        <p class="text-xs">Henüz entry yok</p>
                    </div>
                `}
                
                ${!isReadOnly ? `
                    <button onclick="openEntryModal('${topic.id}')" class="mt-2 w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1 text-sm">
                        <i class="fas fa-plus-circle text-xs"></i>
                        Add New Entry
                    </button>
                    
                    <button onclick="completeTopic('${topic.id}')" class="mt-1 w-full bg-green-500/80 hover:bg-green-500 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1 text-sm">
                        <i class="fas fa-check-circle text-xs"></i>
                        Complete Topic (+100 XP)
                    </button>
                ` : `
                    <button onclick="reactivateTopic('${topic.id}')" class="mt-2 w-full bg-yellow-500/80 hover:bg-yellow-500 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1 text-sm">
                        <i class="fas fa-undo-alt text-xs"></i>
                        Reactivate (+50 XP)
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// Scroll to bottom of expanded topic
function scrollToTopicBottom(topicId) {
    setTimeout(() => {
        const topicElement = document.getElementById(`topic-${topicId}`);
        if (topicElement && !topicElement.classList.contains('hidden')) {
            topicElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, 100);
}

// =============== CRUD İŞLEMLERİ ===============
function createTopic(title, description) {
    const newTopic = {
        id: Date.now().toString(),
        title: title,
        description: description,
        entries: [],
        createdAt: Date.now(),
        lastActivity: Date.now(),
        completed: false,
        completedAt: null
    };
    topics.push(newTopic);
    XPSystem.addXP(XPSystem.getXPReward('topic_created'), 'topic_created');
    saveToLocal();
    renderTopics();
    showNotification(`"${title}" konusu oluşturuldu! +50 XP`, 'success');
}

function addEntry(topicId, title, question, parentId = null) {
    const topic = topics.find(t => t.id === topicId);
    if (!topic || topic.completed) return;
    
    const newEntry = {
        id: Date.now().toString(),
        title: title,
        question: question,
        createdAt: Date.now(),
        children: []
    };
    
    if (parentId && parentId !== 'null') {
        const addToParent = (entries) => {
            for (let entry of entries) {
                if (entry.id === parentId) {
                    entry.children.push(newEntry);
                    return true;
                }
                if (entry.children && addToParent(entry.children)) return true;
            }
            return false;
        };
        addToParent(topic.entries);
    } else {
        topic.entries.push(newEntry);
    }
    
    topic.lastActivity = Date.now();
    XPSystem.addXP(XPSystem.getXPReward('entry_added'), 'entry_added');
    saveToLocal();
    renderTopics();
    
    // Expand the topic to show new entry
    const topicContent = document.getElementById(`topic-${topicId}`);
    if (topicContent && topicContent.classList.contains('hidden')) {
        toggleTopic(topicId);
    }
    scrollToTopicBottom(topicId);
    
    showNotification(`New entry added! +25 XP`, 'success');
    
    if (Math.random() < 0.1) {
        showConfetti(1);
    }
}

function completeTopic(topicId) {
    const topic = topics.find(t => t.id === topicId);
    if (topic && !topic.completed) {
        topic.completed = true;
        topic.completedAt = Date.now();
        XPSystem.addXP(XPSystem.getXPReward('topic_completed'), 'topic_completed');
        showAdvancedCelebration();
        showNotification(`🎉 "${topic.title}" konusu tamamlandı! +100 XP 🎉`, 'success');
        saveToLocal();
        renderTopics();
    }
}

function reactivateTopic(topicId) {
    const topic = topics.find(t => t.id === topicId);
    if (topic && topic.completed) {
        topic.completed = false;
        topic.completedAt = null;
        topic.lastActivity = Date.now();
        XPSystem.addXP(XPSystem.getXPReward('topic_reactivated'), 'topic_reactivated');
        showNotification(`"${topic.title}" konusu yeniden aktifleştirildi! +50 XP`, 'success');
        saveToLocal();
        
        // Switch to active tab
        currentTab = 'active';
        document.getElementById('activeTabBtn').classList.add('bg-blue-500', 'text-white');
        document.getElementById('activeTabBtn').classList.remove('bg-white/10', 'text-white/70');
        document.getElementById('completedTabBtn').classList.remove('bg-blue-500', 'text-white');
        document.getElementById('completedTabBtn').classList.add('bg-white/10', 'text-white/70');
        renderTopics();
    }
}

function editTopicTitle(topicId, newTitle) {
    const topic = topics.find(t => t.id === topicId);
    if (topic && !topic.completed) {
        topic.title = newTitle;
        saveToLocal();
        renderTopics();
        showNotification('Konu düzenlendi', 'success');
    }
}

function editEntryContent(topicId, entryId, parentId, newTitle, newQuestion) {
    const topic = topics.find(t => t.id === topicId);
    if (!topic || topic.completed) return;
    
    const findAndEdit = (entries) => {
        for (let entry of entries) {
            if (entry.id === entryId) {
                entry.title = newTitle;
                entry.question = newQuestion;
                return true;
            }
            if (entry.children && findAndEdit(entry.children)) return true;
        }
        return false;
    };
    
    findAndEdit(topic.entries);
    saveToLocal();
    renderTopics();
    showNotification('Entry düzenlendi', 'success');
}

function deleteTopic(topicId) {
    deleteTarget = { type: 'topic', id: topicId };
    document.getElementById('confirmMessage').textContent = 'Bu konu ve içindeki tüm entry\'ler silinecek. Bu işlem geri alınamaz!';
    openModal('confirmModal');
}

function deleteEntryRecursive(topicId, entryId, parentId = null) {
    const topic = topics.find(t => t.id === topicId);
    if (!topic || topic.completed) return;
    
    const deleteFromParent = (entries, parent) => {
        const index = entries.findIndex(e => e.id === entryId);
        if (index !== -1) {
            const deletedEntry = entries[index];
            if (deletedEntry.children && deletedEntry.children.length > 0) {
                if (parent) {
                    parent.children.push(...deletedEntry.children);
                } else {
                    topic.entries.push(...deletedEntry.children);
                }
            }
            entries.splice(index, 1);
            return true;
        }
        
        for (let entry of entries) {
            if (entry.children && deleteFromParent(entry.children, entry)) {
                return true;
            }
        }
        return false;
    };
    
    if (parentId && parentId !== 'null') {
        const parent = findEntryById(topic.entries, parentId);
        if (parent) {
            deleteFromParent(parent.children, parent);
        }
    } else {
        deleteFromParent(topic.entries, null);
    }
    
    XPSystem.addXP(XPSystem.getXPReward('entry_deleted'), 'entry_deleted');
    saveToLocal();
    renderTopics();
    showNotification('Entry silindi', 'info');
}

function findEntryById(entries, id) {
    for (let entry of entries) {
        if (entry.id === id) return entry;
        if (entry.children) {
            const found = findEntryById(entry.children, id);
            if (found) return found;
        }
    }
    return null;
}

// =============== UI EVENT HANDLER'LAR ===============
function toggleTopic(topicId) {
    const content = document.getElementById(`topic-${topicId}`);
    const chevron = document.getElementById(`chevron-${topicId}`);
    content.classList.toggle('hidden');
    chevron.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    
    // Auto-scroll when expanded
    if (!content.classList.contains('hidden')) {
        scrollToTopicBottom(topicId);
    }
}

function openEntryModal(topicId, parentId = null) {
    const topic = topics.find(t => t.id === topicId);
    if (topic && topic.completed) {
        showNotification('Tamamlanmış konuya entry eklenemez!', 'info');
        return;
    }
    
    document.getElementById('currentTopicId').value = topicId;
    document.getElementById('currentParentId').value = parentId || '';
    document.getElementById('entryTitle').value = '';
    document.getElementById('entryQuestion').value = '';
    openModal('entryModal');
}

function openEditTopicModal(topicId) {
    const topic = topics.find(t => t.id === topicId);
    if (!topic || topic.completed) return;
    
    document.getElementById('editTopicId').value = topicId;
    document.getElementById('editTopicTitle').value = topic.title;
    openModal('editTopicModal');
}

function openEditEntryModal(topicId, entryId, parentId) {
    const topic = topics.find(t => t.id === topicId);
    if (!topic || topic.completed) return;
    
    const entry = findEntryById(topic.entries, entryId);
    if (!entry) return;
    
    document.getElementById('editEntryTopicId').value = topicId;
    document.getElementById('editEntryId').value = entryId;
    document.getElementById('editEntryParentId').value = parentId || '';
    document.getElementById('editEntryTitle').value = entry.title;
    document.getElementById('editEntryQuestion').value = entry.question;
    openModal('editEntryModal');
}

function deleteEntry(topicId, entryId, parentId) {
    deleteTarget = { type: 'entry', id: entryId, topicId: topicId, parentId: parentId };
    document.getElementById('confirmMessage').textContent = 'Bu entry silinecek ve altındaki entry\'ler bir üst seviyeye taşınacak. Devam etmek istiyor musunuz?';
    openModal('confirmModal');
}

// =============== STORAGE ===============
function saveToLocal() {
    const data = {
        topics: topics,
        nextId: nextId,
        userXP: userXP,
        userLevel: userLevel
    };
    localStorage.setItem('followup_app', JSON.stringify(data));
}

function loadFromLocal() {
    const saved = localStorage.getItem('followup_app');
    if (saved) {
        const data = JSON.parse(saved);
        topics = data.topics || [];
        nextId = data.nextId || 1;
        userXP = data.userXP || 0;
        userLevel = data.userLevel || 1;
    }
    renderTopics();
    updateXPDisplay();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// =============== MODAL KEYBOARD NAVIGATION ===============

// Modal açıldığında ilk input'a focus ver
function setupModalFocus(modalId, firstInputId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Modal her açıldığında
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (!modal.classList.contains('hidden')) {
                    const firstInput = document.getElementById(firstInputId);
                    if (firstInput) {
                        setTimeout(() => firstInput.focus(), 100);
                    }
                }
            }
        });
    });
    
    observer.observe(modal, { attributes: true });
}

// Modal içinde Enter tuşu ile submit
function setupEnterSubmit(modalId, buttonId, ...inputIds) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const inputs = inputIds.map(id => document.getElementById(id)).filter(el => el);
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const button = document.getElementById(buttonId);
                    if (button) button.click();
                }
            });
        }
    });
}

// Tab sırasını düzenle (isteğe bağlı)
function setupTabOrder(modalId, inputIds) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const inputs = inputIds.map(id => document.getElementById(id)).filter(el => el);
    
    // Tab index'leri ayarla
    inputs.forEach((input, index) => {
        if (input) input.tabIndex = index + 1;
    });
    
    // Son input'ta Enter tuşu ile submit
    const lastInput = inputs[inputs.length - 1];
    if (lastInput) {
        lastInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const saveBtn = modal.querySelector('button[id*="save"], button[id*="Save"]');
                if (saveBtn) saveBtn.click();
            }
        });
    }
}

// =============== MEVCUT MODAL'LARI GÜNCELLE ===============

// New Topic Modal için focus ve enter desteği
function initNewTopicModal() {
    const modal = document.getElementById('topicModal');
    const titleInput = document.getElementById('topicTitle');
    const descInput = document.getElementById('topicDesc');
    const saveBtn = document.getElementById('saveTopicBtn');
    
    if (!modal || !titleInput) return;
    
    // Modal açılınca focus
    const observer = new MutationObserver(() => {
        if (!modal.classList.contains('hidden')) {
            setTimeout(() => titleInput.focus(), 100);
        }
    });
    observer.observe(modal, { attributes: true });
    
    // Enter ile submit
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (descInput) descInput.focus();
        }
    });
    
    if (descInput) {
        descInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (saveBtn) saveBtn.click();
            }
        });
    }
}

// New Entry Modal için focus ve enter desteği
function initNewEntryModal() {
    const modal = document.getElementById('entryModal');
    const titleInput = document.getElementById('entryTitle');
    const questionInput = document.getElementById('entryQuestion');
    const saveBtn = document.getElementById('saveEntryBtn');
    
    if (!modal || !titleInput) return;
    
    // Modal açılınca focus
    const observer = new MutationObserver(() => {
        if (!modal.classList.contains('hidden')) {
            setTimeout(() => titleInput.focus(), 100);
        }
    });
    observer.observe(modal, { attributes: true });
    
    // Enter ile navigation
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (questionInput) questionInput.focus();
        }
    });
    
    if (questionInput) {
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (saveBtn) saveBtn.click();
            }
        });
    }
}

// Edit Topic Modal
function initEditTopicModal() {
    const modal = document.getElementById('editTopicModal');
    const titleInput = document.getElementById('editTopicTitle');
    const saveBtn = document.getElementById('saveEditTopicBtn');
    
    if (!modal || !titleInput) return;
    
    const observer = new MutationObserver(() => {
        if (!modal.classList.contains('hidden')) {
            setTimeout(() => {
                titleInput.focus();
                titleInput.select(); // Mevcut metni seç
            }, 100);
        }
    });
    observer.observe(modal, { attributes: true });
    
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (saveBtn) saveBtn.click();
        }
    });
}

// Edit Entry Modal
function initEditEntryModal() {
    const modal = document.getElementById('editEntryModal');
    const titleInput = document.getElementById('editEntryTitle');
    const questionInput = document.getElementById('editEntryQuestion');
    const saveBtn = document.getElementById('saveEditEntryBtn');
    
    if (!modal || !titleInput) return;
    
    const observer = new MutationObserver(() => {
        if (!modal.classList.contains('hidden')) {
            setTimeout(() => {
                titleInput.focus();
                titleInput.select();
            }, 100);
        }
    });
    observer.observe(modal, { attributes: true });
    
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (questionInput) questionInput.focus();
        }
    });
    
    if (questionInput) {
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (saveBtn) saveBtn.click();
            }
        });
    }
}

// Confirm Modal (Escape ile kapatma)
function initConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') {
                closeModal('confirmModal');
            } else if (e.key === 'Enter') {
                const confirmBtn = document.getElementById('confirmDeleteBtn');
                if (confirmBtn) confirmBtn.click();
            }
        }
    });
}

// =============== GENEL ESCAPE DESTEĞİ ===============
function initGlobalEscape() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Tüm açık modalları kapat
            const openModals = document.querySelectorAll('.modal:not(.hidden)');
            openModals.forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

// =============== TÜM MODALLARI BAŞLAT ===============
function initAllModals() {
    initNewTopicModal();
    initNewEntryModal();
    initEditTopicModal();
    initEditEntryModal();
    initConfirmModal();
    initGlobalEscape();
    
    // Ayrıca close-modal butonları için Enter desteği
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const modal = btn.closest('.modal');
                if (modal) closeModal(modal.id);
            }
        });
    });
}

// =============== OPSİYONEL: GELİŞMİŞ FOCUS HIGHLIGHT ===============
function addFocusStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Focus highlight for better visibility */
        input:focus, textarea:focus, button:focus {
            outline: none;
            ring: 2px solid #3B82F6;
            ring-offset: 2px;
        }
        
        /* Smooth focus transition */
        input, textarea, button {
            transition: all 0.2s ease;
        }
        
        /* Modal içindeki ilk input için hafif animasyon */
        .modal:not(.hidden) input:first-of-type {
            animation: gentlePulse 0.5s ease-out;
        }
        
        @keyframes gentlePulse {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
            }
            50% {
                transform: scale(1.02);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
        }
        
        /* Tab navigation highlight */
        *:focus-visible {
            outline: 2px solid #3B82F6;
            outline-offset: 2px;
            border-radius: 8px;
        }
    `;
    document.head.appendChild(style);
}

// =============== INITIALIZATION ===============
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocal();
    
    // Tab switching
    document.getElementById('activeTabBtn').addEventListener('click', () => {
        currentTab = 'active';
        document.getElementById('activeTabBtn').classList.add('bg-blue-500', 'text-white');
        document.getElementById('activeTabBtn').classList.remove('bg-white/10', 'text-white/70');
        document.getElementById('completedTabBtn').classList.remove('bg-blue-500', 'text-white');
        document.getElementById('completedTabBtn').classList.add('bg-white/10', 'text-white/70');
        renderTopics();
    });
    
    document.getElementById('completedTabBtn').addEventListener('click', () => {
        currentTab = 'completed';
        document.getElementById('completedTabBtn').classList.add('bg-blue-500', 'text-white');
        document.getElementById('completedTabBtn').classList.remove('bg-white/10', 'text-white/70');
        document.getElementById('activeTabBtn').classList.remove('bg-blue-500', 'text-white');
        document.getElementById('activeTabBtn').classList.add('bg-white/10', 'text-white/70');
        renderTopics();
    });
    
    // Event Listeners
    document.getElementById('newTopicBtn').addEventListener('click', () => openModal('topicModal'));
    
    document.getElementById('saveTopicBtn').addEventListener('click', () => {
        const title = document.getElementById('topicTitle').value.trim();
        const desc = document.getElementById('topicDesc').value.trim();
        if (title) {
            createTopic(title, desc);
            closeModal('topicModal');
            document.getElementById('topicTitle').value = '';
            document.getElementById('topicDesc').value = '';
        } else {
            showNotification('Lütfen bir başlık girin!', 'info');
        }
    });
    
    document.getElementById('saveEntryBtn').addEventListener('click', () => {
        const title = document.getElementById('entryTitle').value.trim();
        const question = document.getElementById('entryQuestion').value.trim();
        const topicId = document.getElementById('currentTopicId').value;
        const parentId = document.getElementById('currentParentId').value;
        
        if (title && question) {
            addEntry(topicId, title, question, parentId || null);
            closeModal('entryModal');
        } else {
            showNotification('Lütfen hem başlık hem de soru girin!', 'info');
        }
    });
    
    document.getElementById('saveEditTopicBtn').addEventListener('click', () => {
        const topicId = document.getElementById('editTopicId').value;
        const newTitle = document.getElementById('editTopicTitle').value.trim();
        if (newTitle) {
            editTopicTitle(topicId, newTitle);
            closeModal('editTopicModal');
        }
    });
    
    document.getElementById('saveEditEntryBtn').addEventListener('click', () => {
        const topicId = document.getElementById('editEntryTopicId').value;
        const entryId = document.getElementById('editEntryId').value;
        const parentId = document.getElementById('editEntryParentId').value;
        const newTitle = document.getElementById('editEntryTitle').value.trim();
        const newQuestion = document.getElementById('editEntryQuestion').value.trim();
        
        if (newTitle && newQuestion) {
            editEntryContent(topicId, entryId, parentId, newTitle, newQuestion);
            closeModal('editEntryModal');
        } else {
            showNotification('Lütfen tüm alanları doldurun!', 'info');
        }
    });
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (deleteTarget.type === 'topic') {
            const index = topics.findIndex(t => t.id === deleteTarget.id);
            if (index !== -1) {
                topics.splice(index, 1);
                saveToLocal();
                renderTopics();
                showNotification('Konu silindi', 'info');
            }
        } else if (deleteTarget.type === 'entry') {
            deleteEntryRecursive(deleteTarget.topicId, deleteTarget.id, deleteTarget.parentId);
        }
        closeModal('confirmModal');
        deleteTarget = {};
    });
    
    // Tüm close-modal butonları
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = btn.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });
    
    // Modal dışına tıklayınca kapat
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });

    initAllModals();
    addFocusStyles();
});