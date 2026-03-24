// Check if docx is loaded
let docxLoaded = false;

// Function to wait for docx to load
function waitForDocx() {
    return new Promise((resolve) => {
        if (typeof docx !== 'undefined') {
            docxLoaded = true;
            resolve(true);
            return;
        }
        
        // Check every 100ms for up to 10 seconds
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (typeof docx !== 'undefined') {
                clearInterval(interval);
                docxLoaded = true;
                resolve(true);
            } else if (attempts >= 100) {
                clearInterval(interval);
                resolve(false);
            }
        }, 100);
    });
}

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

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    // Show loading indicator
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) loadingDiv.style.display = 'block';
    
    // Wait for docx to load
    const loaded = await waitForDocx();
    
    if (loadingDiv) loadingDiv.style.display = 'none';
    
    if (loaded) {
        console.log('docx library loaded successfully!');
        // Enable export buttons
        const timelineBtn = document.getElementById('exportTimelineBtn');
        const caseNoteBtn = document.getElementById('exportCaseNoteBtn');
        if (timelineBtn) timelineBtn.disabled = false;
        if (caseNoteBtn) caseNoteBtn.disabled = false;
    } else {
        console.error('Failed to load docx library');
        alert('Failed to load the document generation library. Please check your internet connection and refresh the page.');
        // Disable export buttons
        const timelineBtn = document.getElementById('exportTimelineBtn');
        const caseNoteBtn = document.getElementById('exportCaseNoteBtn');
        if (timelineBtn) {
            timelineBtn.disabled = true;
            timelineBtn.title = 'Library failed to load. Please refresh the page.';
        }
        if (caseNoteBtn) {
            caseNoteBtn.disabled = true;
            caseNoteBtn.title = 'Library failed to load. Please refresh the page.';
        }
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

// EXPORT FUNCTIONS
window.exportTimeline = async function() {
    try {
        if (!docxLoaded || typeof docx === 'undefined') {
            alert('Document library is still loading. Please wait a moment and try again.');
            return;
        }
        
        const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, TextRun } = docx;
        
        const rows = Array.from(document.querySelectorAll('#timeline-rows tr'));
        
        if (rows.length === 0) {
            alert('No timeline data to export');
            return;
        }

        // Create table rows with data
        const tableRows = [];
        
        // Add header row
        const headerCells = ['Age/Period', 'Symptoms', 'Context', 'Outcomes'].map(headerText => 
            new TableCell({
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 }
                },
                shading: { fill: "34495E" },
                children: [new Paragraph({
                    children: [new TextRun({ text: headerText, bold: true, color: "FFFFFF" })]
                })]
            })
        );
        tableRows.push(new TableRow({ children: headerCells }));
        
        // Add data rows
        rows.forEach(row => {
            const inputs = Array.from(row.querySelectorAll('input'));
            const dataCells = inputs.slice(0, 4).map(input => 
                new TableCell({
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 }
                    },
                    children: [new Paragraph(input.value || '')]
                })
            );
            tableRows.push(new TableRow({ children: dataCells }));
        });

        // Get list data
        const family = Array.from(document.querySelectorAll('#family-list input')).map(i => i.value).filter(v => v);
        const hobbies = Array.from(document.querySelectorAll('#hobby-list input')).map(i => i.value).filter(v => v);
        const music = Array.from(document.querySelectorAll('#music-list input')).map(i => i.value).filter(v => v);
        const films = Array.from(document.querySelectorAll('#film-list input')).map(i => i.value).filter(v => v);

        // Create document sections
        const children = [
            new Paragraph({
                children: [new TextRun({ text: 'CLIENT TIMELINE & BACKGROUND', bold: true, size: 32 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
                children: [new TextRun({ text: 'TIMELINE HISTORY', bold: true, size: 24 })],
                spacing: { after: 200 }
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
                children: [new TextRun({ text: 'RELATIONSHIPS', bold: true, size: 24 })],
                spacing: { before: 400, after: 200 }
            })
        ];
        
        // Add relationships
        if (family.length > 0) {
            family.forEach(f => {
                children.push(new Paragraph({ children: [new TextRun({ text: `• ${f}` })] }));
            });
        } else {
            children.push(new Paragraph({ children: [new TextRun({ text: 'None listed' })] }));
        }
        
        // Add interests section
        children.push(
            new Paragraph({ text: '' }),
            new Paragraph({
                children: [new TextRun({ text: 'INTERESTS', bold: true, size: 24 })],
                spacing: { before: 400, after: 200 }
            }),
            new Paragraph({ children: [new TextRun({ text: 'Hobbies:', bold: true })] })
        );
        
        if (hobbies.length > 0) {
            hobbies.forEach(h => {
                children.push(new Paragraph({ children: [new TextRun({ text: `  • ${h}` })] }));
            });
        } else {
            children.push(new Paragraph({ children: [new TextRun({ text: '  • None listed' })] }));
        }
        
        children.push(new Paragraph({ children: [new TextRun({ text: 'Music:', bold: true })] }));
        if (music.length > 0) {
            music.forEach(m => {
                children.push(new Paragraph({ children: [new TextRun({ text: `  • ${m}` })] }));
            });
        } else {
            children.push(new Paragraph({ children: [new TextRun({ text: '  • None listed' })] }));
        }
        
        children.push(new Paragraph({ children: [new TextRun({ text: 'Films/Shows:', bold: true })] }));
        if (films.length > 0) {
            films.forEach(f => {
                children.push(new Paragraph({ children: [new TextRun({ text: `  • ${f}` })] }));
            });
        } else {
            children.push(new Paragraph({ children: [new TextRun({ text: '  • None listed' })] }));
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, 'Client_Timeline.docx');
        alert('Timeline exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting timeline: ' + error.message);
    }
};

window.exportCaseNote = async function() {
    try {
        if (!docxLoaded || typeof docx === 'undefined') {
            alert('Document library is still loading. Please wait a moment and try again.');
            return;
        }
        
        const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, TextRun } = docx;
        
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

        // Create table rows for case note
        const tableRows = [
            // Header row with 3 columns
            new TableRow({
                children: [
                    new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [new Paragraph({ children: [new TextRun({ text: 'Client Information', bold: true })] })]
                    }),
                    new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [new Paragraph({ children: [new TextRun({ text: 'Session Details', bold: true })] })]
                    }),
                    new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [new Paragraph({ children: [new TextRun({ text: 'Additional', bold: true })] })]
                    })
                ]
            }),
            // Data row
            new TableRow({
                children: [
                    new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [
                            new Paragraph(`ID: ${clientId}`),
                            new Paragraph(`Client: ${demographics}`)
                        ]
                    }),
                    new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [
                            new Paragraph(`Therapist: ${therapist}`),
                            new Paragraph(`Date: ${sessionDate}`),
                            new Paragraph(`Time: ${sessionTime}`)
                        ]
                    }),
                    new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [
                            new Paragraph(`Supervisor: ${supervisor}`),
                            new Paragraph(`Session #: ${sessionNum}`)
                        ]
                    })
                ]
            }),
            // Agenda row
            new TableRow({
                children: [
                    new TableCell({
                        columnSpan: 3,
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [new Paragraph({ children: [new TextRun({ text: `Agenda: ${agenda}`, bold: true })] })]
                    })
                ]
            }),
            // Subjective
            new TableRow({
                children: [
                    new TableCell({
                        columnSpan: 3,
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [
                            new Paragraph({ children: [new TextRun({ text: '1. SUBJECTIVE', bold: true })] }),
                            new Paragraph(`Focus: ${sessionFocus}`),
                            new Paragraph(subjective || '')
                        ]
                    })
                ]
            }),
            // Objective
            new TableRow({
                children: [
                    new TableCell({
                        columnSpan: 3,
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [
                            new Paragraph({ children: [new TextRun({ text: '2. OBJECTIVE', bold: true })] }),
                            new Paragraph(objective || '')
                        ]
                    })
                ]
            }),
            // Assessment
            new TableRow({
                children: [
                    new TableCell({
                        columnSpan: 3,
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [
                            new Paragraph({ children: [new TextRun({ text: '3. ASSESSMENT', bold: true })] }),
                            new Paragraph(assessment || '')
                        ]
                    })
                ]
            }),
            // Plan
            new TableRow({
                children: [
                    new TableCell({
                        columnSpan: 3,
                        borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                        children: [
                            new Paragraph({ children: [new TextRun({ text: '4. PLAN', bold: true })] }),
                            new Paragraph(plan || '')
                        ]
                    })
                ]
            })
        ];

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: 'SESSION CASE NOTE', bold: true, size: 32 })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({ text: '' }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: tableRows
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Case_Note_${clientId.replace(/\s/g, '_')}.docx`);
        alert('Case note exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting case note: ' + error.message);
    }
};
