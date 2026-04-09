const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

/**
 * Génère un PDF d'ordonnance médicale
 * @param {{ doctor, patient, appointment, content, prescriptionId }} data
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePrescriptionPDF({ doctor, patient, appointment, content, prescriptionId }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ─── Header ──────────────────────────────────────────────
    doc
      .fontSize(20)
      .fillColor('#1a73e8')
      .text('TéléMéd Congo', { align: 'center' })
      .fontSize(12)
      .fillColor('#555')
      .text('Plateforme de Téléconsultation Médicale', { align: 'center' })
      .moveDown(0.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#1a73e8')
      .stroke()
      .moveDown();

    // ─── Informations médecin ─────────────────────────────────
    doc
      .fontSize(14)
      .fillColor('#222')
      .text('ORDONNANCE MÉDICALE', { align: 'center', underline: true })
      .moveDown(0.5);

    const date = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    doc
      .fontSize(11)
      .fillColor('#333')
      .text(`Réf: ${prescriptionId}`, { align: 'right' })
      .text(`Date: ${date}`, { align: 'right' })
      .moveDown();

    // ─── Bloc médecin ─────────────────────────────────────────
    doc
      .rect(50, doc.y, 230, 80)
      .strokeColor('#ddd')
      .stroke();

    const doctorBoxY = doc.y + 10;
    doc
      .fontSize(11)
      .fillColor('#1a73e8')
      .text('PRESCRIPTEUR', 60, doctorBoxY, { underline: false })
      .fillColor('#222')
      .fontSize(10)
      .text(`Dr ${doctor.prenom} ${doctor.nom}`, 60, doctorBoxY + 18)
      .text(`Spécialité: ${doctor.specialite}`, 60, doctorBoxY + 32)
      .text(`Tél: ${doctor.user?.phone || 'N/A'}`, 60, doctorBoxY + 46);

    // ─── Bloc patient ─────────────────────────────────────────
    doc
      .rect(310, doc.y - 90, 235, 80)
      .strokeColor('#ddd')
      .stroke();

    const patientBoxY = doc.y - 80;
    doc
      .fontSize(11)
      .fillColor('#1a73e8')
      .text('PATIENT', 320, patientBoxY)
      .fillColor('#222')
      .fontSize(10)
      .text(`${patient.prenom} ${patient.nom}`, 320, patientBoxY + 18)
      .text(
        `Né(e) le: ${patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : 'N/A'}`,
        320,
        patientBoxY + 32
      )
      .text(`Tél: ${patient.user?.phone || 'N/A'}`, 320, patientBoxY + 46);

    doc.moveDown(4);

    // ─── Contenu de l'ordonnance ──────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#eee')
      .stroke()
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor('#1a73e8')
      .text('PRESCRIPTION:', { underline: false })
      .moveDown(0.3);

    doc.fontSize(11).fillColor('#222').text(content, { lineGap: 6 }).moveDown(2);

    // ─── Footer ───────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#ddd')
      .stroke()
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor('#888')
      .text(
        'Cette ordonnance a été émise via la plateforme TéléMéd Congo. Elle est valable pour une durée déterminée par le médecin.',
        { align: 'center' }
      )
      .moveDown(0.3)
      .text('TéléMéd Congo — Brazzaville, République du Congo', { align: 'center' });

    // ─── Signature zone ───────────────────────────────────────
    const sigY = doc.y + 20;
    doc
      .rect(360, sigY, 185, 60)
      .strokeColor('#ddd')
      .stroke()
      .fontSize(10)
      .fillColor('#555')
      .text('Signature du médecin', 365, sigY + 5)
      .text(`Dr ${doctor.prenom} ${doctor.nom}`, 365, sigY + 42);

    doc.end();
  });
}

/**
 * Upload le PDF vers Cloudinary (ou sauvegarde localement en dev)
 * @param {Buffer} pdfBuffer
 * @param {string} filename
 * @returns {Promise<string>} URL du PDF
 */
async function uploadPDF(pdfBuffer, filename) {
  const env = require('../config/env');

  if (!env.CLOUDINARY_CLOUD_NAME) {
    // En dev : retourner une URL simulée
    console.log(`[PDF MOCK] Prescription PDF generated: ${filename}.pdf (${pdfBuffer.length} bytes)`);
    return `https://placeholder.telecmed-congo.com/prescriptions/${filename}.pdf`;
  }

  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'prescriptions', public_id: filename, format: 'pdf', resource_type: 'raw' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    const readable = new Readable();
    readable.push(pdfBuffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

module.exports = { generatePrescriptionPDF, uploadPDF };
