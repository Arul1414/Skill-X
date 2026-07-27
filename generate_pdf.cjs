const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generatePDF() {
    const doc = new PDFDocument({ margin: 50 });
    const outputDir = path.join(__dirname, 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    const outputPath = path.join(outputDir, 'SkillX_Documentation.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Title
    doc.fillColor('#2563eb')
       .fontSize(24)
       .text('SkillX Project Documentation', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fillColor('#64748b')
       .fontSize(10)
       .text('AI Skill Exchange & Interview Intelligence Platform', { align: 'center' });
    
    doc.moveDown(2);

    // Overview
    doc.fillColor('#0f172a')
       .fontSize(16)
       .text('1. Project Overview');
    doc.moveDown(0.5);
    doc.fontSize(12)
       .text('SkillX is an AI-powered platform designed for modern learners and mentors. It features a Resume Analyzer, Mock Interview system with Proctoring, and a Mentor/Learner dashboard.');
    
    doc.moveDown();
    doc.fillColor('#2563eb')
       .text('Project Link:  https://ais-pre-ziiaiuhvfctmdf6tjv3aki-709390180053.asia-east1.run.app');

    doc.moveDown(2);

    // Technical Stack
    doc.fillColor('#0f172a')
       .fontSize(16)
       .text('2. Technical Stack & Uses');
    doc.moveDown(0.5);
    
    const techStack = [
        ['Language', 'TypeScript, HTML5, CSS3'],
        ['Frontend', 'React 19, Tailwind CSS, Motion, Recharts'],
        ['Backend', 'Node.js, Express.js'],
        ['Database', 'Firebase Firestore'],
        ['AI', 'Google Gemini AI (gemini-1.5-flash)'],
        ['Security', 'Firebase Auth, Security Rules']
    ];

    techStack.forEach(([category, tools]) => {
        doc.fontSize(12).fillColor('#334155').text(`${category}: `, { continued: true })
           .fillColor('#4b5563').text(tools);
        doc.moveDown(0.3);
    });

    doc.moveDown(2);

    // Viva Questions
    doc.fillColor('#0f172a')
       .fontSize(16)
       .text('3. Viva Questions & Answers');
    doc.moveDown(0.5);

    const questions = [
        { q: 'Why React for this project?', a: 'Component-based architecture allowed for reusable UI elements and high performance for real-time dashboards.' },
        { q: 'What is the role of the Express backend?', a: 'To handle heavy file processing (PDF parsing) and secure file management away from the client.' },
        { q: 'How does AI analyze the resume?', a: 'Extracts text using PDF.js and sends it to Gemini AI with a specific prompt to identify skills and gaps.' },
        { q: 'How does proctoring work?', a: 'Combines browser visibility listeners for tab switches with voice alerts via SpeechSynthesis API.' }
    ];

    questions.forEach((item, index) => {
        doc.fontSize(12).fillColor('#0f172a').text(`${index + 1}. ${item.q}`);
        doc.fontSize(10).fillColor('#475569').text(`Ans: ${item.a}`);
        doc.moveDown();
    });

    // Footer
    doc.fontSize(8)
       .fillColor('#94a3b8')
       .text(`Generated on ${new Date().toLocaleDateString()} for SkillX Development Team`, {
           align: 'center',
           baseline: 'bottom'
       });

    doc.end();
    console.log('PDF Generated successfully at:', outputPath);
}

generatePDF();
