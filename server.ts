import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import fs from "fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import PDFDocument from "pdfkit";
import mammoth from "mammoth";
import dotenv from "dotenv";

dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Multer setup for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const upload = multer({ storage });

  // In-memory store for materials
  let materials: any[] = [
    {
      id: "m1",
      title: "System Design Primer & Architecture Cheat Sheet",
      type: "pdf",
      url: "/api/materials/download/m1",
      uploadedBy: "SkillX Admin",
      category: "Engineering",
      description: "Complete guide covering Load Balancers, Microservices, Caching Strategies (Redis/Memcached), Database Sharding, and Event-Driven Pipelines.",
      timestamp: new Date().toISOString()
    },
    {
      id: "m2",
      title: "React 19 & TypeScript Performance Tuning",
      type: "notes",
      url: "/api/materials/download/m2",
      uploadedBy: "Sarah Wilson (Google)",
      category: "Engineering",
      description: "Proven practices for optimizing React component re-renders, useMemo/useCallback memoization, code splitting, and bundle size reduction.",
      timestamp: new Date().toISOString()
    },
    {
      id: "m3",
      title: "Product Strategy & Metric Frameworks",
      type: "pdf",
      url: "/api/materials/download/m3",
      uploadedBy: "Michael Chen (Meta)",
      category: "Product",
      description: "Frameworks for answering Product Sense, Execution, and A/B Testing interview questions at top Tier-1 tech companies.",
      timestamp: new Date().toISOString()
    },
    {
      id: "m4",
      title: "Data Structures & Algorithms Cheat Sheet",
      type: "pdf",
      url: "/api/materials/download/m4",
      uploadedBy: "David Kim (Netflix)",
      category: "Engineering",
      description: "Quick reference guide for Big-O time complexity, Binary Search Trees, Dynamic Programming patterns, and Graph Traversals (DFS/BFS).",
      timestamp: new Date().toISOString()
    },
    {
      id: "m5",
      title: "UX Design System & Accessibility Guidelines",
      type: "link",
      url: "https://www.behance.net/",
      uploadedBy: "Elena Rodriguez (Airbnb)",
      category: "Design",
      description: "WCAG 2.1 accessibility checklists, contrast ratios, micro-interactions, and design token naming conventions.",
      timestamp: new Date().toISOString()
    },
    {
      id: "m6",
      title: "Machine Learning & LLM Fine-Tuning Guide",
      type: "video",
      url: "https://www.coursera.org/",
      uploadedBy: "Jessica Lee (Amazon)",
      category: "Data Science",
      description: "Comprehensive crash course on PyTorch, RAG architectures, prompt engineering, and model deployment pipelines.",
      timestamp: new Date().toISOString()
    }
  ];

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Resume Analysis Endpoint (Extract text from PDF)
  app.post("/api/resume/extract", upload.single("resume"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      let extractedText = "";

      if (fileExt === ".pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const uint8Array = new Uint8Array(dataBuffer);
        
        try {
          const loadingTask = pdfjs.getDocument({
            data: uint8Array,
            useSystemFonts: true,
            disableFontFace: true
          });
          
          const pdfDocument = await loadingTask.promise;
          let fullText = "";
          
          for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            fullText += pageText + "\n";
          }
          
          extractedText = fullText;
        } catch (pdfError: any) {
          console.error("PDFJS extraction failed:", pdfError);
          if (pdfError.name === 'PasswordException') {
            throw new Error('This PDF is password protected. Please upload an unprotected version.');
          } else if (pdfError.name === 'InvalidPDFException') {
            throw new Error('The uploaded file is not a valid PDF.');
          } else if (pdfError.name === 'FormatError') {
            throw new Error('The PDF format is invalid or corrupted.');
          } else if (pdfError.name === 'AbortException') {
            throw new Error('The PDF processing was aborted.');
          }
          throw new Error(`Failed to process PDF: ${pdfError.message}`);
        }
      } else if (fileExt === ".docx") {
        try {
          const result = await mammoth.extractRawText({ path: filePath });
          extractedText = result.value;
        } catch (docxError: any) {
          console.error("Mammoth extraction failed:", docxError);
          throw new Error(`Failed to process Word document: ${docxError.message}`);
        }
      } else if (fileExt === ".txt") {
        extractedText = fs.readFileSync(filePath, "utf-8");
      } else {
        return res.status(400).json({ error: "Unsupported file format. Please upload a PDF, DOCX, or TXT file." });
      }
      
      // Clean up uploaded file
      fs.unlinkSync(filePath);

      if (!extractedText || extractedText.trim().length < 10) {
        return res.status(400).json({ error: "Could not extract enough text from the file. It might be empty or an image-based PDF." });
      }

      res.json({ text: extractedText });
    } catch (error: any) {
      console.error("Resume extraction failed", error);
      res.status(500).json({ error: error.message || "Failed to extract text from resume" });
    }
  });

  // Study Materials Endpoints
  app.post("/api/materials/upload", upload.single("material"), (req, res) => {
    try {
      const { title, type, category, url, description } = req.body;
      
      let finalUrl = url;
      if (req.file) {
        finalUrl = `/uploads/${req.file.filename}`;
      } else if (!finalUrl) {
        finalUrl = `/api/materials/download/${Date.now()}`;
      }

      const newMaterial = {
        id: Date.now().toString(),
        title: title || (req.file ? req.file.originalname : "Untitled Study Resource"),
        type: type || "pdf",
        url: finalUrl,
        uploadedBy: "You (Verified Learner)",
        category: category || "General",
        description: description || "Custom uploaded study resource.",
        timestamp: new Date().toISOString()
      };

      materials.unshift(newMaterial);
      res.json(newMaterial);
    } catch (error) {
      console.error("Material upload failed", error);
      res.status(500).json({ error: "Failed to upload material" });
    }
  });

  app.get("/api/materials", (req, res) => {
    res.json(materials);
  });

  app.get("/api/materials/:id", (req, res) => {
    const material = materials.find(m => m.id === req.params.id);
    if (!material) return res.status(404).json({ error: "Material not found" });
    res.json(material);
  });

  // Download / Generate PDF route for any study material
  app.get("/api/materials/download/:id", (req, res) => {
    try {
      const material = materials.find(m => m.id === req.params.id);
      const title = material ? material.title : "SkillX_Study_Resource";
      const category = material ? material.category : "Engineering";
      const desc = material ? material.description : "Comprehensive study resource for technical interview prep.";

      const doc = new PDFDocument({ margin: 50 });
      const safeFilename = title.replace(/[^a-zA-Z0-9]/g, "_") + ".pdf";

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);

      doc.pipe(res);

      // PDF Design Header
      doc.fillColor("#2563eb").fontSize(22).text(`SkillX Study Resource`, { align: "center" });
      doc.moveDown(0.5);
      doc.fillColor("#0f172a").fontSize(18).text(title, { align: "center" });
      doc.moveDown(0.5);
      doc.fillColor("#64748b").fontSize(10).text(`Category: ${category} | Provided by SkillX Mentorship Platform`, { align: "center" });
      doc.moveDown(2);

      // Section: Summary
      doc.fillColor("#2563eb").fontSize(14).text("Overview & Key Concepts");
      doc.moveDown(0.5);
      doc.fillColor("#334155").fontSize(11).text(desc, { leading: 16 });
      doc.moveDown(1.5);

      // Section: Core Study Notes
      doc.fillColor("#2563eb").fontSize(14).text("Core Study Notes & High-Yield Topics");
      doc.moveDown(0.5);

      const bulletPoints = [
        "1. Architectural Fundamentals: Focus on scalability, fault-tolerance, and latency optimization.",
        "2. System Trade-offs: Consistency vs. Availability (CAP Theorem), Synchronous vs. Asynchronous communication.",
        "3. Data Management: SQL indexing strategies, NoSQL document stores, and caching layers.",
        "4. Practical Interview Tips: Always clarify constraints, outline high-level diagrams first, then dive deep into bottlenecks."
      ];

      bulletPoints.forEach((point) => {
        doc.fillColor("#1e293b").fontSize(10).text(point);
        doc.moveDown(0.5);
      });

      doc.moveDown(2);
      doc.fillColor("#94a3b8").fontSize(8).text(`SkillX Learning Intelligence • Generated on ${new Date().toLocaleDateString()}`, { align: "center" });

      doc.end();
    } catch (e) {
      console.error("PDF download error:", e);
      res.status(500).send("Failed to generate PDF resource.");
    }
  });

  // Documentation PDF Generation Route
  app.get("/api/documentation/download", (req, res) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=SkillX_Project_Documentation.pdf');
      
      doc.pipe(res);

      doc.fillColor('#2563eb').fontSize(24).text('SkillX Project Documentation', { align: 'center' });
      doc.moveDown(0.5);
      doc.fillColor('#64748b').fontSize(10).text('AI Skill Exchange & Interview Intelligence Platform', { align: 'center' });
      doc.moveDown(2);

      doc.fillColor('#0f172a').fontSize(16).text('1. Project Overview');
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#334155').text('SkillX is an AI-powered platform designed for modern learners and mentors. It features a Resume Analyzer, Mock Interview system with Proctoring, and a Mentor/Learner dashboard.');
      doc.moveDown();
      doc.fillColor('#2563eb').text('Shared URL: https://ais-pre-ziiaiuhvfctmdf6tjv3aki-709390180053.asia-east1.run.app');
      doc.moveDown(2);

      doc.fillColor('#0f172a').fontSize(16).text('2. Technical Stack & Uses');
      doc.moveDown(0.5);
      
      const techStack = [
        ['Language', 'TypeScript, HTML5, CSS3'],
        ['Frontend Frameworks', 'React 19, Tailwind CSS, Motion, Recharts'],
        ['Backend & Infrastructure', 'Node.js, Express.js, Vite'],
        ['AI & Services', 'Google Gemini AI (gemini-1.5-flash), Firebase Auth, Firebase Firestore'],
        ['PDF Extraction', 'PDF.js (pdfjs-dist)']
      ];

      techStack.forEach(([category, tools]) => {
        doc.fontSize(12).fillColor('#334155').text(`${category}: `, { continued: true }).fillColor('#4b5563').text(tools);
        doc.moveDown(0.3);
      });
      doc.moveDown(2);

      doc.fillColor('#0f172a').fontSize(16).text('3. Viva Questions & Answers');
      doc.moveDown(0.5);

      const qs = [
        { q: 'Why React for this project?', a: 'Component-based architecture allowed for reusable UI elements and high performance for real-time dashboards.' },
        { q: 'Explain the proctoring logic.', a: 'It uses visibilitychange listeners for tab detection and camera API for focus monitoring, with voice warnings via SpeechSynthesis.' },
        { q: 'How does AI analysis work?', a: 'Resume text is extracted via PDF.js on the backend, then passed to Gemini AI for qualitative scoring and skill gap analysis.' }
      ];

      qs.forEach((item, index) => {
        doc.fontSize(12).fillColor('#0f172a').text(`${index + 1}. ${item.q}`);
        doc.fontSize(10).fillColor('#475569').text(`Ans: ${item.a}`);
        doc.moveDown();
      });

      doc.fontSize(8).fillColor('#94a3b8').text(`Generated automatically for SkillX Project - ${new Date().toLocaleDateString()}`, {
        align: 'center',
        baseline: 'bottom'
      });

      doc.end();
    } catch (error) {
      console.error("PDF Generation Error:", error);
      res.status(500).send("Failed to generate PDF documentation.");
    }
  });

  // Serve static files from uploads
  app.use("/uploads", express.static(uploadsDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
