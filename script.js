// Tab switching
window.openTab = function(tabName) {
    document.querySelectorAll('.tab-panel').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
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
document.addEventListener('DOMContentLoaded', function() {
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
    document.getElementById('session-date').value = new Date().toISOString().split('T')[0];
    
    console.log('App ready!');
});

// EXPORT FUNCTIONS
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } = docx;

window.exportTimeline = async function() {
    try {
        const rows = Array.from(document.querySelectorAll('#timeline-rows tr'));
        
        if (rows.length === 0) {
            alert('No timeline data to export');
            return;
        }

        // Create table headers
        const headers = ['Age/Period', 'Symptoms', 'Context', 'Outcomes'].map(h => 
            new TableCell({ 
                shading: { fill: '34495e' },
                children: [new Paragraph({ text: h, bold: true, color: 'ffffff' })] 
            })
        );

        const tableRows = [
            new TableRow({ children: headers }),
            ...rows.map(row => {
                const inputs = Array.from(row.querySelectorAll('input'));
                return new TableRow({
                    children: inputs.map(i => 
                        new TableCell({ children: [new Paragraph(i.value || ' ')] })
                    )
                });
            })
        ];

        // Get list data
        const family = Array.from(document.querySelectorAll('#family-list input')).map(i => i.value).filter(v => v);
        const hobbies = Array.from(document.querySelectorAll('#hobby-list input')).map(i => i.value).filter(v => v);
        const music = Array.from(document.querySelectorAll('#music-list input')).map(i => i.value).filter(v => v);
        const films = Array.from(document.querySelectorAll('#film-list input')).map(i => i.value).filter(v => v);

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: 'CLIENT TIMELINE & BACKGROUND', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                    new Paragraph(''),
                    new Paragraph({ text: 'TIMELINE HISTORY', bold: true }),
                    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows }),
                    new Paragraph(''),
                    new Paragraph({ text: 'RELATIONSHIPS', bold: true }),
                    ...family.map(f => new Paragraph(`• ${f}`)),
                    new Paragraph(''),
                    new Paragraph({ text: 'INTERESTS', bold: true }),
                    new Paragraph({ text: 'Hobbies:', bold: true }),
                    ...hobbies.map(h => new Paragraph(`  • ${h}`)),
                    new Paragraph({ text: 'Music:', bold: true }),
                    ...music.map(m => new Paragraph(`  • ${m}`)),
                    new Paragraph({ text: 'Films/Shows:', bold: true }),
                    ...films.map(f => new Paragraph(`  • ${f}`))
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, 'Client_Timeline.docx');
        alert('Timeline exported successfully!');
    } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
    }
};

window.exportCaseNote = async function() {
    try {
        const get = (id) => document.getElementById(id)?.value || ' ';

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: 'SESSION CASE NOTE', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                    new Paragraph(''),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [
                                new TableCell({ children: [
                                    new Paragraph({ text: 'Client Information', bold: true }),
                                    new Paragraph(`ID: ${get('client-id')}`),
                                    new Paragraph(`Client: ${get('demographics')}`)
                                ]}),
                                new TableCell({ children: [
                                    new Paragraph({ text: 'Session Details', bold: true }),
                                    new Paragraph(`Therapist: ${get('therapist')}`),
                                    new Paragraph(`Date: ${get('session-date')}`),
                                    new Paragraph(`Time: ${get('session-time')}`)
                                ]}),
                                new TableCell({ children: [
                                    new Paragraph({ text: 'Additional', bold: true }),
                                    new Paragraph(`Supervisor: ${get('supervisor')}`),
                                    new Paragraph(`Session #: ${get('session-num')}`)
                                ]})
                            ]}),
                            new TableRow({ children: [
                                new TableCell({ columnSpan: 3, children: [
                                    new Paragraph({ text: `Agenda: ${get('agenda')}`, bold: true })
                                ]})
                            ]}),
                            new TableRow({ children: [
                                new TableCell({ columnSpan: 3, children: [
                                    new Paragraph({ text: '1. SUBJECTIVE', bold: true }),
                                    new Paragraph(`Focus: ${get('session-focus')}`),
                                    new Paragraph(get('subjective'))
                                ]})
                            ]}),
                            new TableRow({ children: [
                                new TableCell({ columnSpan: 3, children: [
                                    new Paragraph({ text: '2. OBJECTIVE', bold: true }),
                                    new Paragraph(get('objective'))
                                ]})
                            ]}),
                            new TableRow({ children: [
                                new TableCell({ columnSpan: 3, children: [
                                    new Paragraph({ text: '3. ASSESSMENT', bold: true }),
                                    new Paragraph(get('assessment'))
                                ]})
                            ]}),
                            new TableRow({ children: [
                                new TableCell({ columnSpan: 3, children: [
                                    new Paragraph({ text: '4. PLAN', bold: true }),
                                    new Paragraph(get('plan'))
                                ]})
                            ]})
                        ]
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        const clientId = get('client-id').trim() || 'Client';
        saveAs(blob, `Case_Note_${clientId}.docx`);
        alert('Case note exported successfully!');
    } catch (error) {
        alert('Error: ' + error.message);
        console.error(error);
    }
};
