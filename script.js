// Tab switching
window.openTab = function(tabName) {
    document.querySelectorAll('.tab-panel').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    if (event && event.target) {
        event.target.classList.add('active');
    }
};

// Helper to add input rows
function addRow(containerId, placeholder, value = '') {
    const div = document.createElement('div');
    div.className = 'row-entry';
    div.innerHTML = `
        <input type="text" placeholder="${placeholder}" value="${value.replace(/"/g, '&quot;')}">
        <button class="btn-del" onclick="this.parentElement.remove()">✕</button>
    `;
    document.getElementById(containerId).appendChild(div);
}

// Timeline functions
window.addTimelineRow = function(data = {}) {
    const tbody = document.getElementById('timeline-rows');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="t-age" value="${(data.age || '').replace(/"/g, '&quot;')}" placeholder="e.g., Childhood"></td>
        <td><input type="text" class="t-sym" value="${(data.sym || '').replace(/"/g, '&quot;')}" placeholder="Symptoms/Changes"></td>
        <td><input type="text" class="t-con" value="${(data.con || '').replace(/"/g, '&quot;')}" placeholder="Context/Triggers"></td>
        <td><input type="text" class="t-out" value="${(data.out || '').replace(/"/g, '&quot;')}" placeholder="Response/Outcomes"></td>
        <td><button class="btn-del" onclick="this.parentElement.parentElement.remove()">✕</button></td>
    `;
    tbody.appendChild(row);
};

// List functions
window.addFamily = (v = '') => addRow('family-list', 'Relation: Name', v);
window.addHobby = (v = '') => addRow('hobby-list', 'Hobby', v);
window.addMusic = (v = '') => addRow('music-list', 'Music', v);
window.addFilm = (v = '') => addRow('film-list', 'Film/Show', v);

// Global variable to track docx availability
let docxReady = false;

// Function to check if docx is loaded
function checkDocx() {
    return new Promise((resolve) => {
        if (typeof window.docx !== 'undefined') {
            resolve(true);
            return;
        }
        
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (typeof window.docx !== 'undefined') {
                clearInterval(interval);
                resolve(true);
            } else if (attempts > 50) { // 5 seconds timeout
                clearInterval(interval);
                resolve(false);
            }
        }, 100);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    const loadingDiv = document.getElementById('loading-indicator');
    
    // Show loading
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
        loadingDiv.style.background = '#f39c12';
        loadingDiv.innerHTML = '⏳ Loading docx library...';
    }
    
    // Wait for docx to load
    const loaded = await checkDocx();
    
    if (loaded) {
        docxReady = true;
        if (loadingDiv) {
            loadingDiv.style.background = '#27ae60';
            loadingDiv.innerHTML = '✓ Ready to export';
            setTimeout(() => {
                if (loadingDiv) loadingDiv.style.display = 'none';
            }, 2000);
        }
        console.log('docx library loaded successfully!');
    } else {
        if (loadingDiv) {
            loadingDiv.style.background = '#e74c3c';
            loadingDiv.innerHTML = '✗ Failed to load. Using fallback method.';
            setTimeout(() => {
                if (loadingDiv) loadingDiv.style.display = 'none';
            }, 3000);
        }
        console.warn('docx library not loaded, using fallback');
    }
    
    // Add initial timeline row
    addTimelineRow();
    
    // Add sample data
    addFamily('Father: John Doe');
    addFamily('Mother: Jane Doe');
    addHobby('Reading');
    addHobby('Hiking');
    addMusic('Classical');
    addMusic('Jazz');
    addFilm('Drama');
    addFilm('Documentary');
    
    // Set today's date
    const dateInput = document.getElementById('session-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    console.log('App ready!');
});

// Helper function to create HTML content for fallback export
function generateHTMLContent(title, content) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 40px;
                    line-height: 1.6;
                }
                h1 {
                    color: #2c3e50;
                    text-align: center;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #34495e;
                    margin-top: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th {
                    background: #34495e;
                    color: white;
                    padding: 10px;
                    text-align: left;
                }
                td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                ul {
                    margin: 10px 0;
                }
                li {
                    margin: 5px 0;
                }
                .section {
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `;
}

// EXPORT FUNCTIONS
window.exportTimeline = async function() {
    try {
        const rows = Array.from(document.querySelectorAll('#timeline-rows tr'));
        
        if (rows.length === 0) {
            alert('No timeline data to export');
            return;
        }

        // Get list data
        const family = Array.from(document.querySelectorAll('#family-list input')).map(i => i.value).filter(v => v);
        const hobbies = Array.from(document.querySelectorAll('#hobby-list input')).map(i => i.value).filter(v => v);
        const music = Array.from(document.querySelectorAll('#music-list input')).map(i => i.value).filter(v => v);
        const films = Array.from(document.querySelectorAll('#film-list input')).map(i => i.value).filter(v => v);

        // Build HTML content
        let tableHTML = '<table><thead><tr><th>Age/Period</th><th>Symptoms</th><th>Context</th><th>Outcomes</th></tr></thead><tbody>';
        
        rows.forEach(row => {
            const inputs = Array.from(row.querySelectorAll('input'));
            tableHTML += '<tr>';
            inputs.slice(0, 4).forEach(input => {
                tableHTML += `<td>${input.value || ''}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        
        let relationshipsHTML = '<div class="section"><h2>RELATIONSHIPS</h2><ul>';
        if (family.length > 0) {
            family.forEach(f => {
                relationshipsHTML += `<li>${f}</li>`;
            });
        } else {
            relationshipsHTML += '<li>None listed</li>';
        }
        relationshipsHTML += '</ul></div>';
        
        let interestsHTML = '<div class="section"><h2>INTERESTS</h2>';
        interestsHTML += '<h3>Hobbies:</h3><ul>';
        if (hobbies.length > 0) {
            hobbies.forEach(h => {
                interestsHTML += `<li>${h}</li>`;
            });
        } else {
            interestsHTML += '<li>None listed</li>';
        }
        interestsHTML += '</ul>';
        
        interestsHTML += '<h3>Music:</h3><ul>';
        if (music.length > 0) {
            music.forEach(m => {
                interestsHTML += `<li>${m}</li>`;
            });
        } else {
            interestsHTML += '<li>None listed</li>';
        }
        interestsHTML += '</ul>';
        
        interestsHTML += '<h3>Films/Shows:</h3><ul>';
        if (films.length > 0) {
            films.forEach(f => {
                interestsHTML += `<li>${f}</li>`;
            });
        } else {
            interestsHTML += '<li>None listed</li>';
        }
        interestsHTML += '</ul></div>';
        
        const fullHTML = `
            <h1>CLIENT TIMELINE & BACKGROUND</h1>
            <div class="section">
                <h2>TIMELINE HISTORY</h2>
                ${tableHTML}
            </div>
            ${relationshipsHTML}
            ${interestsHTML}
        `;
        
        const htmlContent = generateHTMLContent('Client Timeline', fullHTML);
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        saveAs(blob, 'Client_Timeline.doc');
        alert('Timeline exported successfully!');
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting timeline: ' + error.message);
    }
};

window.exportCaseNote = async function() {
    try {
        const get = (id) => document.getElementById(id)?.value || '';
        
        const clientId = get('client-id') || 'Client';
        const demographics = get('demographics') || '';
        const therapist = get('therapist') || '';
        const sessionDate = get('session-date') || '';
        const sessionTime = get('session-time') || '';
        const supervisor = get('supervisor') || '';
        const sessionNum = get('session-num') || '';
        const agenda = get('agenda') || '';
        const sessionFocus = get('session-focus') || '';
        const subjective = get('subjective') || '';
        const objective = get('objective') || '';
        const assessment = get('assessment') || '';
        const plan = get('plan') || '';
        
        const fullHTML = `
            <h1>SESSION CASE NOTE</h1>
            
            <table style="width: 100%; margin: 20px 0;">
                <tr style="background: #34495e; color: white;">
                    <th>Client Information</th>
                    <th>Session Details</th>
                    <th>Additional</th>
                </tr>
                <tr>
                    <td>
                        <strong>ID:</strong> ${clientId}<br>
                        <strong>Client:</strong> ${demographics}
                    </td>
                    <td>
                        <strong>Therapist:</strong> ${therapist}<br>
                        <strong>Date:</strong> ${sessionDate}<br>
                        <strong>Time:</strong> ${sessionTime}
                    </td>
                    <td>
                        <strong>Supervisor:</strong> ${supervisor}<br>
                        <strong>Session #:</strong> ${sessionNum}
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <strong>Agenda:</strong> ${agenda}
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <h2>1. SUBJECTIVE</h2>
                        <strong>Focus:</strong> ${sessionFocus}<br>
                        ${subjective.replace(/\n/g, '<br>')}
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <h2>2. OBJECTIVE</h2>
                        ${objective.replace(/\n/g, '<br>')}
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <h2>3. ASSESSMENT</h2>
                        ${assessment.replace(/\n/g, '<br>')}
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <h2>4. PLAN</h2>
                        ${plan.replace(/\n/g, '<br>')}
                    </td>
                </tr>
            </table>
        `;
        
        const htmlContent = generateHTMLContent('Session Case Note', fullHTML);
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        saveAs(blob, `Case_Note_${clientId.replace(/\s/g, '_')}.doc`);
        alert('Case note exported successfully!');
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting case note: ' + error.message);
    }
};
