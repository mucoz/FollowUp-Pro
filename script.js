// =============== VERİ YAPISI ===============
let topics = [];
let nextId = 1;
let deleteTarget = { type: null, id: null, topicId: null, parentId: null };
let currentEditTopic = null;
let currentTab = 'active'; // 'active' or 'completed'
let searchQuery = '';

// XP ve Level Sistemi
let userXP = 0;
let userLevel = 1;

// Expand/Collapse state per entry
const collapsedEntries = new Set();
let expandedTopicId = null;

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
            showSchoolPrideConfetti();
            showNotification(`🎉 LEVEL UP! Level ${userLevel} 🎉`, 'levelup');
        }
        
        if (action === 'entry_added' && amount === 25) {
            if (Math.random() < 0.3) {
                userXP += 25;
                showNotification('⚡ CRITICAL! +25 Bonus XP!', 'bonus');
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

// Confetti Effects using canvas-confetti
const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFD700', '#FF1493'];

async function showConfetti(count = 3) {
    const defaults = { origin: { y: 0.7 }, colors: confettiColors };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(200 * particleRatio)
        });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

async function showAdvancedCelebration() {
    const colors = confettiColors;
    const count = 400;

    function fire(particleRatio, opts) {
        confetti({
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            colors
        });
    }

    function realisticBurst(origin) {
        fire(0.25, { spread: 26, startVelocity: 55, origin });
        fire(0.2, { spread: 60, origin });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin });
        fire(0.1, { spread: 120, startVelocity: 45, origin });
    }

    // Center burst
    realisticBurst({ y: 0.6 });

    // Side bursts with delay
    setTimeout(() => realisticBurst({ x: 0.2, y: 0.7 }), 150);
    setTimeout(() => realisticBurst({ x: 0.8, y: 0.7 }), 300);
    setTimeout(() => realisticBurst({ y: 0.5 }), 450);

    // Fireworks from both sides
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            confetti({
                particleCount: 100,
                startVelocity: 40,
                spread: 360,
                ticks: 80,
                origin: { x: 0.15, y: Math.random() * 0.5 },
                colors
            });
            confetti({
                particleCount: 100,
                startVelocity: 40,
                spread: 360,
                ticks: 80,
                origin: { x: 0.85, y: Math.random() * 0.5 },
                colors
            });
        }, i * 250 + 600);
    }

    // Screen flash
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

function showSchoolPrideConfetti(duration = 2000) {
    const end = Date.now() + duration;
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFD700', '#FF1493'];

    (function frame() {
        confetti({
            particleCount: 8,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors
        });
        confetti({
            particleCount: 8,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
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
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function entryBgStyle(level, hue) {
    const l = 82 + level * 3;
    const s = Math.max(50 - level * 6, 20);
    return `background-color: hsla(${hue}, ${s}%, ${Math.min(l, 97)}%, 0.85)`;
}

function entryHue(id) {
    let hue = Math.abs(hashCode(id)) % 360;
    if (hue < 30 || hue > 330) hue = (hue + 60) % 360;
    return hue;
}

function renderEntries(entries, level = 0, topicId, parentId = null, isReadOnly = false, hue = null) {
    if (!entries || entries.length === 0) return '';
    
    return entries.map(entry => {
        const entryHueValue = hue !== null ? hue : entryHue(entry.id);
        const bgStyle = entryBgStyle(level, entryHueValue);
        const hasChildren = entry.children && entry.children.length > 0;
        const isCollapsed = collapsedEntries.has(entry.id);
        
        return `
        <div class="entry-item ml-${Math.min(level * 3, 8)} relative pl-3 py-1">
            <div class="backdrop-blur rounded-lg p-2 mb-1 shadow-sm" style="${bgStyle}">
                <div class="flex justify-between items-start">
                    <div class="flex items-start flex-1 min-w-0">
                        <button onclick="toggleEntryCollapse('${entry.id}')" data-entry-id="${entry.id}" class="mt-0.5 mr-1 text-gray-500 hover:text-gray-700 transition flex-shrink-0 ${hasChildren ? '' : 'invisible'}">
                            <i class="fas fa-chevron-right text-[10px] transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}"></i>
                        </button>
                        <div class="min-w-0">
                            <h4 class="text-gray-800 text-xs font-medium truncate">${escapeHtml(entry.title)}</h4>
                            <p class="font-semibold text-red-600 text-xs mt-0.5 truncate">${escapeHtml(entry.question)}</p>
                            <div class="text-[10px] text-gray-400 mt-1">
                                <i class="far fa-clock"></i> ${new Date(entry.createdAt).toLocaleDateString()} ${new Date(entry.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                    ${!isReadOnly ? `
                        <div class="flex gap-1 ml-2 flex-shrink-0">
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
            ${hasChildren ? `<div id="ecw-${entry.id}" class="entry-children-wrapper ${isCollapsed ? '' : 'expanded'}">${renderEntries(entry.children, level + 1, topicId, entry.id, isReadOnly, entryHueValue)}</div>` : ''}
        </div>
    `; }).join('');
}

// Topic Render
function topicMatchesSearch(topic, query) {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();

    if (topic.title.toLowerCase().includes(lowerQuery)) return true;
    if (topic.description && topic.description.toLowerCase().includes(lowerQuery)) return true;

    function entryMatches(entries) {
        for (const entry of entries) {
            if (entry.title.toLowerCase().includes(lowerQuery) ||
                entry.question.toLowerCase().includes(lowerQuery)) {
                return true;
            }
            if (entry.children && entryMatches(entry.children)) {
                return true;
            }
        }
        return false;
    }

    return entryMatches(topic.entries);
}

function renderTopics() {
    let filteredTopics = currentTab === 'active' 
        ? topics.filter(t => !t.completed)
        : topics.filter(t => t.completed);
    
    if (searchQuery) {
        filteredTopics = filteredTopics.filter(t => topicMatchesSearch(t, searchQuery));
    }
    
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
        if (searchQuery) {
            container.innerHTML = `
                <div class="ios-card bg-white/10 backdrop-blur rounded-2xl p-8 text-center">
                    <i class="fas fa-search-minus text-4xl text-white/30 mb-2"></i>
                    <h3 class="text-base font-semibold text-white mb-1">No results found</h3>
                    <p class="text-white/60 text-xs">No entries match "${escapeHtml(searchQuery)}"</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="ios-card bg-white/10 backdrop-blur rounded-2xl p-8 text-center">
                    <i class="fas ${currentTab === 'active' ? 'fa-lightbulb' : 'fa-check-circle'} text-4xl text-white/30 mb-2"></i>
                    <h3 class="text-base font-semibold text-white mb-1">${currentTab === 'active' ? 'There are not active topics yet' : 'There are no completed topics yet'}</h3>
                    <p class="text-white/60 text-xs">${currentTab === 'active' ? 'Start by clicking the "New Topic" button!' : 'The topics you have completed will appear here'}</p>
                </div>
            `;
        }
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
                                    🏆 ${Math.floor(FollowUpAlgorithm.calculateRank(topic))} pts
                                </span>
                            ` : `
                                <span class="px-1.5 py-0.5 bg-green-500/30 text-green-200 rounded-full text-[10px]">
                                    ✅ ${new Date(topic.completedAt).toLocaleDateString()}
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
                            <p class="text-xs">No entries yet</p>
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
                ` : topic.reactivateUsed ? `
                    <div class="mt-2 w-full bg-white/5 rounded-lg px-3 py-2.5 text-center">
                        <p class="text-white/50 text-xs">This topic can no longer be reactivated. Create a new topic instead.</p>
                    </div>
                ` : `
                    <button onclick="reactivateTopic('${topic.id}')" class="mt-2 w-full bg-yellow-500/80 hover:bg-yellow-500 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1 text-sm">
                        <i class="fas fa-undo-alt text-xs"></i>
                        Reactivate (+50 XP)
                    </button>
                `}
            </div>
        </div>
    `).join('');

    // Re-expand previously expanded topic after re-render
    if (expandedTopicId) {
        const content = document.getElementById(`topic-${expandedTopicId}`);
        const chevron = document.getElementById(`chevron-${expandedTopicId}`);
        if (content) {
            content.classList.remove('hidden');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
    }
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
        completedAt: null,
        reactivateUsed: false
    };
    topics.push(newTopic);
    XPSystem.addXP(XPSystem.getXPReward('topic_created'), 'topic_created');
    saveToLocal();
    renderTopics();
    showNotification(`Topic "${truncate(title)}" created! +50 XP`, 'success');
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
}

function completeTopic(topicId) {
    const topic = topics.find(t => t.id === topicId);
    if (topic && !topic.completed) {
        topic.completed = true;
        topic.completedAt = Date.now();
        XPSystem.addXP(XPSystem.getXPReward('topic_completed'), 'topic_completed');
        showConfetti();
        showNotification(`🎉 Topic "${truncate(topic.title)}" completed! +100 XP 🎉`, 'success');
        saveToLocal();
        renderTopics();
    }
}

function reactivateTopic(topicId) {
    const topic = topics.find(t => t.id === topicId);
    if (topic && topic.completed && !topic.reactivateUsed) {
        topic.reactivateUsed = true;
        topic.completed = false;
        topic.completedAt = null;
        topic.lastActivity = Date.now();
        XPSystem.addXP(XPSystem.getXPReward('topic_reactivated'), 'topic_reactivated');
        showNotification(`Topic "${truncate(topic.title)}" reactivated! +50 XP`, 'success');
        saveToLocal();
        
        // Switch to active tab
        currentTab = 'active';
        document.getElementById('activeTabBtn').classList.add('bg-white/20', 'backdrop-blur', 'text-white');
        document.getElementById('activeTabBtn').classList.remove('text-white/40');
        document.getElementById('completedTabBtn').classList.remove('bg-white/20', 'backdrop-blur', 'text-white');
        document.getElementById('completedTabBtn').classList.add('text-white/40');
        renderTopics();
    }
}

function editTopicTitle(topicId, newTitle) {
    const topic = topics.find(t => t.id === topicId);
    if (topic && !topic.completed) {
        topic.title = newTitle;
        saveToLocal();
        renderTopics();
        showNotification('Topic edited', 'success');
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
    showNotification('Entry edited', 'success');
}

function deleteTopic(topicId) {
    deleteTarget = { type: 'topic', id: topicId };
    document.getElementById('confirmMessage').textContent = 'This topic and all its entries will be deleted. This action cannot be undone!';
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
    showNotification('Entry deleted', 'info');
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
function toggleEntryCollapse(entryId) {
    const wrapper = document.getElementById(`ecw-${entryId}`);
    if (!wrapper) return;

    const chevron = document.querySelector(`button[data-entry-id="${entryId}"] i`);
    
    if (collapsedEntries.has(entryId)) {
        collapsedEntries.delete(entryId);
        wrapper.classList.add('expanded');
        if (chevron) chevron.classList.add('rotate-90');
    } else {
        collapsedEntries.add(entryId);
        wrapper.classList.remove('expanded');
        if (chevron) chevron.classList.remove('rotate-90');
    }
}

function toggleTopic(topicId) {
    const content = document.getElementById(`topic-${topicId}`);
    const chevron = document.getElementById(`chevron-${topicId}`);
    const isOpening = content.classList.contains('hidden');

    document.querySelectorAll('[id^="topic-"]').forEach(el => {
        if (el.id !== `topic-${topicId}` && !el.classList.contains('hidden')) {
            el.classList.add('hidden');
            const otherChevron = document.getElementById(`chevron-${el.id.replace('topic-', '')}`);
            if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
        }
    });

    if (isOpening) {
        content.classList.remove('hidden');
        chevron.style.transform = 'rotate(180deg)';
        expandedTopicId = topicId;
        scrollToTopicBottom(topicId);
    } else {
        content.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
        expandedTopicId = null;
    }
}

function openEntryModal(topicId, parentId = null) {
    const topic = topics.find(t => t.id === topicId);
    if (topic && topic.completed) {
        showNotification('Cannot add entry to a completed topic!', 'info');
        return;
    }
    
    document.getElementById('entryModalTitle').textContent = `New Entry: ${escapeHtml(topic.title)}`;
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
    document.getElementById('confirmMessage').textContent = 'This entry will be deleted and its child entries will be moved up. Do you want to continue?';
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

function truncate(str, max = 50) {
    if (!str || str.length <= max) return str;
    return str.slice(0, max) + '...';
}

const BACKUP_HEADER = '# FollowUp Pro Backup v1 #';
const ENCRYPTION_KEY = 'FuP!2024@Secure#Backup';

function encryptData(data) {
    const json = JSON.stringify(data);
    let result = '';
    for (let i = 0; i < json.length; i++) {
        result += String.fromCharCode(json.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return btoa(encodeURIComponent(result));
}

function decryptData(encoded) {
    const xored = decodeURIComponent(atob(encoded));
    let result = '';
    for (let i = 0; i < xored.length; i++) {
        result += String.fromCharCode(xored.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return JSON.parse(result);
}

function exportBackup() {
    const data = {
        topics: topics,
        nextId: nextId,
        userXP: userXP,
        userLevel: userLevel,
        exportedAt: Date.now()
    };
    const encrypted = encryptData(data);
    const content = BACKUP_HEADER + '\n' + encrypted;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `followup-backup-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Backup exported successfully!', 'success');
}

function importBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const newlineIndex = text.indexOf('\n');

        if (newlineIndex === -1 || text.slice(0, newlineIndex) !== BACKUP_HEADER) {
            document.getElementById('importErrorMessage').textContent = 'The selected file is not a valid FollowUp Pro backup file. Please select a valid .txt backup file.';
            openModal('importErrorModal');
            return;
        }

        let importedData;
        try {
            const encrypted = text.slice(newlineIndex + 1).trim();
            importedData = decryptData(encrypted);
        } catch (err) {
            document.getElementById('importErrorMessage').textContent = 'The backup file appears to be corrupted or tampered with. Please use a valid backup file.';
            openModal('importErrorModal');
            return;
        }

        if (!importedData.topics || !Array.isArray(importedData.topics)) {
            document.getElementById('importErrorMessage').textContent = 'Invalid backup format. The file structure is not recognized.';
            openModal('importErrorModal');
            return;
        }

        const existingIds = new Set(topics.map(t => t.id));
        const importedTopics = importedData.topics.filter(t => !existingIds.has(t.id));
        const skippedCount = importedData.topics.length - importedTopics.length;

        if (importedTopics.length === 0) {
            showNotification('All topics already exist. Nothing to import.', 'info');
            return;
        }

        topics.push(...importedTopics);
        if (importedData.nextId) nextId = Math.max(nextId, importedData.nextId);
        if (importedData.userXP) userXP = Math.max(userXP, importedData.userXP);
        if (importedData.userLevel) userLevel = Math.max(userLevel, importedData.userLevel);

        saveToLocal();
        renderTopics();
        updateXPDisplay();

        let msg = `${importedTopics.length} topic(s) imported successfully.`;
        if (skippedCount > 0) msg += ` ${skippedCount} topic(s) skipped (already exist).`;
        showNotification(msg, 'success');
    };
    reader.readAsText(file);
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

// =============== SETTINGS (Theme & Font) ===============

const themes = [
    { name: 'Royal Purple', from: 'from-slate-900', via: 'via-purple-700', to: 'to-slate-900', color: '#9333ea' },
    { name: 'Ocean Blue', from: 'from-slate-900', via: 'via-blue-700', to: 'to-slate-900', color: '#1d4ed8' },
    { name: 'Deep Indigo', from: 'from-slate-900', via: 'via-indigo-600', to: 'to-slate-900', color: '#6366f1' },
    { name: 'Cyan Sky', from: 'from-slate-900', via: 'via-cyan-600', to: 'to-slate-900', color: '#0891b2' },
    { name: 'Sunset Rose', from: 'from-slate-900', via: 'via-rose-700', to: 'to-slate-900', color: '#be123c' },
    { name: 'Golden Amber', from: 'from-slate-900', via: 'via-amber-600', to: 'to-slate-900', color: '#d97706' },
    { name: 'Fuchsia Glow', from: 'from-slate-900', via: 'via-fuchsia-700', to: 'to-slate-900', color: '#a21caf' },
    { name: 'Forest Emerald', from: 'from-slate-900', via: 'via-emerald-700', to: 'to-slate-900', color: '#047857' },
    { name: 'Teal Depths', from: 'from-slate-900', via: 'via-teal-600', to: 'to-slate-900', color: '#0d9488' }
];

const fonts = [
    { name: 'Default', scale: '100%', className: '' },
    { name: 'Large', scale: '110%', className: 'font-large' },
    { name: 'X-Large', scale: '120%', className: 'font-xlarge' }
];

const PICKER_ITEM_HEIGHT = 56;
const PICKER_VISIBLE = 3;

let settingsThemeIndex = 0;
let settingsFontIndex = 0;
let settingsCurrentTab = 'theme';

// Touch/drag state
let pickerDrag = { isDragging: false, startY: 0, startTranslate: 0, currentTranslate: 0, target: null };

let _pickerMouseMoveHandler = null;
let _pickerMouseUpHandler = null;

function getTrackTranslateY(selectedIndex) {
    return -(selectedIndex * PICKER_ITEM_HEIGHT) + (PICKER_VISIBLE * PICKER_ITEM_HEIGHT) / 2 - PICKER_ITEM_HEIGHT / 2;
}

function renderThemePicker() {
    const container = document.getElementById('settingsThemeContent');
    
    let html = `
        <button class="picker-arrow" onclick="settingsThemeScroll(-1)"><i class="fas fa-chevron-up"></i></button>
        <div class="picker-viewport" id="themePickerViewport">
            <div class="picker-track" id="themePickerTrack" style="transform: translateY(${getTrackTranslateY(settingsThemeIndex)}px)">
    `;
    
    for (let i = 0; i < themes.length; i++) {
        const t = themes[i];
        const selected = i === settingsThemeIndex;
        const dist = Math.abs(i - settingsThemeIndex);
        const opacity = 1 - dist * 0.35;
        const scale = 1 - dist * 0.12;
        
        html += `<div class="picker-item ${selected ? 'selected' : ''}" data-theme-idx="${i}" style="
            background: linear-gradient(135deg, #1e293b, ${t.color}, #1e293b);
            color: white;
            width: ${selected ? '14rem' : '10rem'};
            font-size: ${selected ? '0.9rem' : '0.75rem'};
            font-weight: ${selected ? '700' : '500'};
            opacity: ${Math.max(opacity, 0.3)};
            transform: scale(${Math.max(scale, 0.7)});
        " onclick="settingsThemeSelect(${i})">
            ${selected ? '✦ ' : ''}${t.name}${selected ? ' ✦' : ''}
        </div>`;
    }
    
    html += `
            </div>
        </div>
        <button class="picker-arrow" onclick="settingsThemeScroll(1)"><i class="fas fa-chevron-down"></i></button>
        <div class="text-center text-xs text-gray-400 mt-1" id="themePickerName">${themes[settingsThemeIndex].name}</div>
    `;
    
    container.innerHTML = html;
    initPickerDrag('theme');
}

function renderFontPicker() {
    const container = document.getElementById('settingsFontContent');
    
    let html = `
        <button class="picker-arrow" onclick="settingsFontScroll(-1)"><i class="fas fa-chevron-up"></i></button>
        <div class="picker-viewport" id="fontPickerViewport">
            <div class="picker-track" id="fontPickerTrack" style="transform: translateY(${getTrackTranslateY(settingsFontIndex)}px)">
    `;
    
    for (let i = 0; i < fonts.length; i++) {
        const f = fonts[i];
        const selected = i === settingsFontIndex;
        const dist = Math.abs(i - settingsFontIndex);
        const opacity = 1 - dist * 0.35;
        const scale = 1 - dist * 0.12;
        
        html += `<div class="picker-item ${selected ? 'selected' : ''}" data-font-idx="${i}" style="
            background: white;
            color: #374151;
            width: ${selected ? '14rem' : '10rem'};
            font-size: ${selected ? (i === 0 ? '1rem' : i === 1 ? '1.1rem' : '1.2rem') : '0.8rem'};
            font-weight: ${selected ? '700' : '500'};
            opacity: ${Math.max(opacity, 0.3)};
            transform: scale(${Math.max(scale, 0.7)});
            border: 1px solid ${selected ? '#3B82F6' : '#e5e7eb'};
        " onclick="settingsFontSelect(${i})">
            ${selected ? '✦ ' : ''}Aa ${f.name}${selected ? ' ✦' : ''}
        </div>`;
    }
    
    html += `
            </div>
        </div>
        <button class="picker-arrow" onclick="settingsFontScroll(1)"><i class="fas fa-chevron-down"></i></button>
        <div class="text-center text-xs text-gray-400 mt-1" id="fontPickerName">${fonts[settingsFontIndex].name}</div>
    `;
    
    container.innerHTML = html;
    initPickerDrag('font');
}

function initPickerDrag(type) {
    const viewportId = type === 'theme' ? 'themePickerViewport' : 'fontPickerViewport';
    const viewport = document.getElementById(viewportId);
    if (!viewport) return;

    const getLen = () => type === 'theme' ? themes.length : fonts.length;
    const setIdx = (i) => {
        const len = getLen();
        if (i < 0 || i >= len) return;
        if (type === 'theme') {
            settingsThemeIndex = i;
            applyTheme(i);
            localStorage.setItem('followup_theme', i);
            animatePickerTrack('theme', i);
        } else {
            settingsFontIndex = i;
            applyFont(i);
            localStorage.setItem('followup_font', i);
            animatePickerTrack('font', i);
        }
    };

    // Clean up previous listeners
    if (_pickerMouseMoveHandler) document.removeEventListener('mousemove', _pickerMouseMoveHandler);
    if (_pickerMouseUpHandler) document.removeEventListener('mouseup', _pickerMouseUpHandler);

    function onStart(y) {
        const track = viewport.querySelector('.picker-track');
        if (!track) return;
        pickerDrag.isDragging = true;
        pickerDrag.startY = y;
        pickerDrag.target = track;
        pickerDrag.startTranslate = getTrackTranslateY(type === 'theme' ? settingsThemeIndex : settingsFontIndex);
        pickerDrag.currentTranslate = pickerDrag.startTranslate;
        track.classList.add('no-transition');
        viewport.classList.add('dragging');
    }

    function onMove(y) {
        if (!pickerDrag.isDragging) return;
        const delta = y - pickerDrag.startY;
        pickerDrag.currentTranslate = pickerDrag.startTranslate + delta;
        pickerDrag.target.style.transform = `translateY(${pickerDrag.currentTranslate}px)`;
    }

    function onEnd() {
        if (!pickerDrag.isDragging) return;
        pickerDrag.isDragging = false;
        const track = pickerDrag.target;
        if (!track) return;
        track.classList.remove('no-transition');
        viewport.classList.remove('dragging');

        const len = getLen();
        const currentIdx = type === 'theme' ? settingsThemeIndex : settingsFontIndex;
        const expectedTranslate = getTrackTranslateY(currentIdx);
        const delta = pickerDrag.currentTranslate - expectedTranslate;
        const threshold = PICKER_ITEM_HEIGHT * 0.3;

        if (Math.abs(delta) > threshold) {
            const dir = delta > 0 ? -1 : 1;
            const newIdx = currentIdx + dir;
            if (newIdx >= 0 && newIdx < len) {
                setIdx(newIdx);
            } else {
                track.style.transform = `translateY(${expectedTranslate}px)`;
            }
        } else {
            track.style.transform = `translateY(${expectedTranslate}px)`;
        }

        pickerDrag.target = null;
    }

    // Touch events
    const touchStart = (e) => onStart(e.touches[0].clientY);
    const touchMove = (e) => onMove(e.touches[0].clientY);
    viewport.addEventListener('touchstart', touchStart, { passive: true });
    viewport.addEventListener('touchmove', touchMove, { passive: true });
    viewport.addEventListener('touchend', onEnd, { passive: true });

    // Mouse events
    const mouseStart = (e) => {
        e.preventDefault();
        onStart(e.clientY);
    };
    _pickerMouseMoveHandler = (e) => onMove(e.clientY);
    _pickerMouseUpHandler = onEnd;
    viewport.addEventListener('mousedown', mouseStart);
    document.addEventListener('mousemove', _pickerMouseMoveHandler);
    document.addEventListener('mouseup', _pickerMouseUpHandler);
}

function settingsThemeScroll(dir) {
    const newIdx = settingsThemeIndex + dir;
    if (newIdx < 0 || newIdx >= themes.length) return;
    settingsThemeIndex = newIdx;
    applyTheme(newIdx);
    localStorage.setItem('followup_theme', newIdx);
    animatePickerTrack('theme', newIdx);
}

function settingsFontScroll(dir) {
    const newIdx = settingsFontIndex + dir;
    if (newIdx < 0 || newIdx >= fonts.length) return;
    settingsFontIndex = newIdx;
    applyFont(newIdx);
    localStorage.setItem('followup_font', newIdx);
    animatePickerTrack('font', newIdx);
}

function settingsThemeSelect(idx) {
    if (idx < 0 || idx >= themes.length) return;
    settingsThemeIndex = idx;
    applyTheme(idx);
    localStorage.setItem('followup_theme', idx);
    animatePickerTrack('theme', idx);
}

function settingsFontSelect(idx) {
    if (idx < 0 || idx >= fonts.length) return;
    settingsFontIndex = idx;
    applyFont(idx);
    localStorage.setItem('followup_font', idx);
    animatePickerTrack('font', idx);
}

function animatePickerTrack(type, newIdx) {
    const trackId = type === 'theme' ? 'themePickerTrack' : 'fontPickerTrack';
    const track = document.getElementById(trackId);
    if (!track) {
        if (type === 'theme') renderThemePicker();
        else renderFontPicker();
        return;
    }
    
    track.style.transform = `translateY(${getTrackTranslateY(newIdx)}px)`;
    
    const nameEl = document.getElementById(type === 'theme' ? 'themePickerName' : 'fontPickerName');
    if (nameEl) nameEl.textContent = (type === 'theme' ? themes : fonts)[newIdx].name;
    
    const items = track.querySelectorAll('.picker-item');
    const data = type === 'theme' ? themes : fonts;
    
    items.forEach((el, i) => {
        const selected = i === newIdx;
        const dist = Math.abs(i - newIdx);
        const opacity = 1 - dist * 0.35;
        const scale = 1 - dist * 0.12;
        
        el.classList.toggle('selected', selected);
        el.style.opacity = Math.max(opacity, 0.3);
        el.style.transform = `scale(${Math.max(scale, 0.7)})`;
        
        if (type === 'theme') {
            el.style.width = selected ? '14rem' : '10rem';
            el.style.fontSize = selected ? '0.9rem' : '0.75rem';
            el.style.fontWeight = selected ? '700' : '500';
            el.innerHTML = selected ? `✦ ${data[i].name} ✦` : data[i].name;
        } else {
            el.style.width = selected ? '14rem' : '10rem';
            el.style.fontWeight = selected ? '700' : '500';
            el.style.borderColor = selected ? '#3B82F6' : '#e5e7eb';
            const fontSize = selected ? (i === 0 ? '1rem' : i === 1 ? '1.1rem' : '1.2rem') : '0.8rem';
            el.style.fontSize = fontSize;
            el.innerHTML = selected ? `✦ Aa ${data[i].name} ✦` : `Aa ${data[i].name}`;
        }
    });
}

function applyTheme(index) {
    const i = Math.min(Math.max(index, 0), themes.length - 1);
    const t = themes[i];
    const body = document.body;
    body.classList.add('theme-transition');
    body.style.background = `linear-gradient(135deg, #1e293b, ${t.color}, #1e293b)`;
    body.dataset.theme = i;
}

function applyFont(index) {
    const f = fonts[Math.min(Math.max(index, 0), fonts.length - 1)];
    const app = document.getElementById('app');
    app.classList.remove('font-large', 'font-xlarge');
    if (f.className) app.classList.add(f.className);
    document.body.dataset.font = index;
}

function openSettings() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    settingsCurrentTab = 'theme';
    document.getElementById('settingsThemeContent').classList.remove('hidden');
    document.getElementById('settingsFontContent').classList.add('hidden');
    document.getElementById('settingsThemeTab').classList.add('text-blue-600', 'border-blue-600');
    document.getElementById('settingsThemeTab').classList.remove('text-gray-400', 'border-transparent');
    document.getElementById('settingsFontTab').classList.remove('text-blue-600', 'border-blue-600');
    document.getElementById('settingsFontTab').classList.add('text-gray-400', 'border-transparent');
    renderThemePicker();
}

function closeSettings() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');
    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function loadSettings() {
    const themeIdx = parseInt(localStorage.getItem('followup_theme'));
    const fontIdx = parseInt(localStorage.getItem('followup_font'));
    settingsThemeIndex = !isNaN(themeIdx) && themeIdx >= 0 ? themeIdx : 0;
    settingsFontIndex = !isNaN(fontIdx) && fontIdx >= 0 ? fontIdx : 0;
    const t = themes[Math.min(settingsThemeIndex, themes.length - 1)];
    document.body.style.background = `linear-gradient(135deg, #1e293b, ${t.color}, #1e293b)`;
    document.body.dataset.theme = settingsThemeIndex;
    const f = fonts[Math.min(Math.max(settingsFontIndex, 0), fonts.length - 1)];
    const app = document.getElementById('app');
    app.classList.remove('font-large', 'font-xlarge');
    if (f.className) app.classList.add(f.className);
    document.body.dataset.font = settingsFontIndex;
}

// =============== INITIALIZATION ===============
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocal();
    loadSettings();
    
    // Tab switching
    document.getElementById('activeTabBtn').addEventListener('click', () => {
        currentTab = 'active';
document.getElementById('activeTabBtn').classList.add('bg-white/20', 'backdrop-blur', 'text-white');
                document.getElementById('activeTabBtn').classList.remove('text-white/40');
                document.getElementById('completedTabBtn').classList.remove('bg-white/20', 'backdrop-blur', 'text-white');
                document.getElementById('completedTabBtn').classList.add('text-white/40');
                renderTopics();
            });
            
            document.getElementById('completedTabBtn').addEventListener('click', () => {
                currentTab = 'completed';
                document.getElementById('completedTabBtn').classList.add('bg-white/20', 'backdrop-blur', 'text-white');
                document.getElementById('completedTabBtn').classList.remove('text-white/40');
                document.getElementById('activeTabBtn').classList.remove('bg-white/20', 'backdrop-blur', 'text-white');
                document.getElementById('activeTabBtn').classList.add('text-white/40');
        renderTopics();
    });
    
    // Event Listeners
    document.getElementById('newTopicBtn').addEventListener('click', () => openModal('topicModal'));
    
    document.getElementById('exportBtn').addEventListener('click', exportBackup);
    
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    
    document.getElementById('importFileInput').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importBackup(e.target.files[0]);
            e.target.value = '';
        }
    });

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('settingsCloseBtn').addEventListener('click', closeSettings);
    document.getElementById('settingsOverlay').addEventListener('click', closeSettings);

    document.getElementById('settingsThemeTab').addEventListener('click', () => {
        settingsCurrentTab = 'theme';
        document.getElementById('settingsThemeContent').classList.remove('hidden');
        document.getElementById('settingsFontContent').classList.add('hidden');
        document.getElementById('settingsThemeTab').classList.add('text-blue-600', 'border-blue-600');
        document.getElementById('settingsThemeTab').classList.remove('text-gray-400', 'border-transparent');
        document.getElementById('settingsFontTab').classList.remove('text-blue-600', 'border-blue-600');
        document.getElementById('settingsFontTab').classList.add('text-gray-400', 'border-transparent');
        renderThemePicker();
    });

    document.getElementById('settingsFontTab').addEventListener('click', () => {
        settingsCurrentTab = 'font';
        document.getElementById('settingsFontContent').classList.remove('hidden');
        document.getElementById('settingsThemeContent').classList.add('hidden');
        document.getElementById('settingsFontTab').classList.add('text-blue-600', 'border-blue-600');
        document.getElementById('settingsFontTab').classList.remove('text-gray-400', 'border-transparent');
        document.getElementById('settingsThemeTab').classList.remove('text-blue-600', 'border-blue-600');
        document.getElementById('settingsThemeTab').classList.add('text-gray-400', 'border-transparent');
        renderFontPicker();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const panel = document.getElementById('settingsPanel');
            if (panel.classList.contains('open')) {
                closeSettings();
            }
        }
    });
    
    document.getElementById('saveTopicBtn').addEventListener('click', () => {
        const title = document.getElementById('topicTitle').value.trim();
        const desc = document.getElementById('topicDesc').value.trim();
        if (title) {
            createTopic(title, desc);
            closeModal('topicModal');
            document.getElementById('topicTitle').value = '';
            document.getElementById('topicDesc').value = '';
        } else {
            showNotification('Please enter a title!', 'info');
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
            showNotification('Please enter both title and question!', 'info');
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
            showNotification('Please fill in all fields!', 'info');
        }
    });
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (deleteTarget.type === 'topic') {
            const index = topics.findIndex(t => t.id === deleteTarget.id);
            if (index !== -1) {
                topics.splice(index, 1);
                saveToLocal();
                renderTopics();
                showNotification('Topic deleted', 'info');
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

    // Search
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.trim();
        searchClearBtn.classList.toggle('hidden', !searchQuery);
        renderTopics();
    });

    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClearBtn.classList.add('hidden');
        renderTopics();
        searchInput.focus();
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchQuery = '';
            searchClearBtn.classList.add('hidden');
            renderTopics();
            searchInput.blur();
        }
    });

    // Help Panel
    const helpPanel = document.getElementById('helpPanel');
    const helpOverlay = document.getElementById('helpOverlay');
    let currentHighlight = null;

    function openHelp() {
        helpPanel.classList.add('open');
        helpOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeHelp() {
        helpPanel.classList.remove('open');
        helpOverlay.classList.remove('open');
        document.body.style.overflow = '';
        if (currentHighlight) {
            currentHighlight.classList.remove('target-glow');
            currentHighlight = null;
        }
        document.querySelectorAll('.help-highlight.active-highlight').forEach(el => el.classList.remove('active-highlight'));
    }

    document.getElementById('helpBtn').addEventListener('click', openHelp);
    document.getElementById('helpCloseBtn').addEventListener('click', closeHelp);
    helpOverlay.addEventListener('click', closeHelp);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && helpPanel.classList.contains('open')) closeHelp();
    });

    document.querySelectorAll('.help-highlight').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const target = document.querySelector(el.dataset.target);
            if (target) {
                target.classList.add('target-glow');
                currentHighlight = target;
                el.classList.add('active-highlight');
            }
        });
        el.addEventListener('mouseleave', () => {
            if (currentHighlight) {
                currentHighlight.classList.remove('target-glow');
                currentHighlight = null;
            }
            el.classList.remove('active-highlight');
        });
    });

    initAllModals();
    addFocusStyles();
});