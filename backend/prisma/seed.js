const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // ─── Admin ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin1234!', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '+242060000000' },
    update: {},
    create: {
      phone: '+242060000000',
      email: 'admin@telecmed-congo.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin créé:', admin.phone);

  // ─── Médecins ────────────────────────────────────────────────────────────
  const doctorHash = await bcrypt.hash('Doctor1234!', 10);

  const specialites = [
    { nom: 'Mbemba', prenom: 'Jean-Pierre', specialite: 'Médecin généraliste', tarif: 2500, phone: '+242061111111' },
    { nom: 'Nkounkou', prenom: 'Marie', specialite: 'Pédiatre', tarif: 3000, phone: '+242062222222' },
    { nom: 'Loubaki', prenom: 'Paul', specialite: 'Cardiologue', tarif: 4000, phone: '+242063333333' },
    { nom: 'Mabiala', prenom: 'Sophie', specialite: 'Gynécologue', tarif: 3500, phone: '+242064444444' },
    { nom: 'Nguesso', prenom: 'Christian', specialite: 'Dermatologue', tarif: 3000, phone: '+242065555555' },
  ];

  for (const spec of specialites) {
    const user = await prisma.user.upsert({
      where: { phone: spec.phone },
      update: {},
      create: {
        phone: spec.phone,
        email: `${spec.prenom.toLowerCase()}.${spec.nom.toLowerCase()}@telecmed-congo.com`,
        passwordHash: doctorHash,
        role: 'DOCTOR',
        isVerified: true,
      },
    });

    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        nom: spec.nom,
        prenom: spec.prenom,
        specialite: spec.specialite,
        tarif: spec.tarif,
        description: `Dr ${spec.prenom} ${spec.nom} est spécialiste en ${spec.specialite} avec 10 ans d\'expérience à Brazzaville.`,
        bio: `Diplômé de la Faculté des Sciences de la Santé de Brazzaville. Passionné par la médecine préventive et la téléconsultation.`,
        isVerified: true,
        subscriptionActive: true,
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isAvailableNow: spec.phone === '+242061111111',
      },
    });

    // Disponibilités : Lun-Ven 8h-17h
    await prisma.availability.deleteMany({ where: { doctorId: doctor.id } });
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: { doctorId: doctor.id, dayOfWeek: day, startTime: '08:00', endTime: '17:00' },
      });
    }
    console.log(`✅ Médecin créé: Dr ${spec.prenom} ${spec.nom} (${spec.specialite})`);
  }

  // ─── Patients ────────────────────────────────────────────────────────────
  const patientHash = await bcrypt.hash('Patient1234!', 10);
  const patientUser = await prisma.user.upsert({
    where: { phone: '+242070000001' },
    update: {},
    create: {
      phone: '+242070000001',
      email: 'patient@example.com',
      passwordHash: patientHash,
      role: 'PATIENT',
      isVerified: true,
    },
  });

  await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      nom: 'Moukassa',
      prenom: 'Alain',
      dateNaissance: new Date('1990-05-15'),
      sexe: 'M',
      adresse: 'Quartier Poto-Poto, Brazzaville',
    },
  });
  console.log('✅ Patient de test créé:', patientUser.phone);

  // ─── Articles santé ──────────────────────────────────────────────────────
  const articles = [
    {
      title: 'Comment prévenir le paludisme',
      content: 'Le paludisme est une maladie transmise par les moustiques. Voici les principales mesures de prévention...\n\n1. Utilisez une moustiquaire imprégnée d\'insecticide chaque nuit\n2. Portez des vêtements longs le soir\n3. Appliquez des répulsifs sur la peau exposée\n4. Consultez un médecin en cas de fièvre',
      category: 'maladies',
    },
    {
      title: 'Alimentation saine pendant la grossesse',
      content: 'Une bonne nutrition pendant la grossesse est essentielle pour la santé de la mère et du bébé...\n\n• Mangez des fruits et légumes frais\n• Consommez des protéines (poisson, poulet, légumineuses)\n• Prenez de l\'acide folique dès le début\n• Évitez l\'alcool et les aliments crus',
      category: 'grossesse',
    },
    {
      title: 'Les vaccins essentiels pour les enfants',
      content: 'La vaccination protège vos enfants contre de nombreuses maladies graves...\n\nCalendrier vaccinal recommandé au Congo:\n- Naissance: BCG, Hépatite B\n- 6 semaines: Pentavalent, Rotavirus\n- 6 mois: Vaccin contre la méningite',
      category: 'pediatrie',
    },
    {
      title: 'Hygiène des mains : les bons gestes',
      content: 'Le lavage des mains est l\'un des gestes les plus simples pour prévenir les maladies...\n\nQuand se laver les mains:\n• Avant de manger\n• Après les toilettes\n• Après avoir touché des animaux\n• Avant de préparer à manger',
      category: 'hygiene',
    },
  ];

  for (const art of articles) {
    await prisma.article.create({
      data: { ...art, publishedBy: admin.id, isPublished: true },
    });
  }
  console.log(`✅ ${articles.length} articles santé créés`);

  console.log('\n🎉 Seed terminé avec succès!');
  console.log('\n📋 Comptes de test:');
  console.log('   Admin  : +242060000000 / Admin1234!');
  console.log('   Médecin: +242061111111 / Doctor1234!');
  console.log('   Patient: +242070000001 / Patient1234!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
