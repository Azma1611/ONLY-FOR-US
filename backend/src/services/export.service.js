import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const archiver = require('archiver');

export const generatePDF = async (data, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="export.pdf"');
  
  doc.pipe(res);
  doc.fontSize(25).text('Only For Us - Export', 100, 100);
  doc.fontSize(12).text(JSON.stringify(data, null, 2), 100, 150);
  doc.end();
};

export const generateCSV = (data, res) => {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'CSV generation failed' });
  }
};

export const generateZIP = (data, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="backup.zip"');
  
  archive.pipe(res);
  archive.append(JSON.stringify(data, null, 2), { name: 'backup.json' });
  archive.finalize();
};
