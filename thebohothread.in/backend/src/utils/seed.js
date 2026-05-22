require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User    = require('../models/User.model');
const Note    = require('../models/Note.model');
const School  = require('../models/School.model');
const Student = require('../models/Student.model');
const FeeStructure = require('../models/FeeStructure.model');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/school-crm';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clean existing
  await Promise.all([
    User.deleteMany({}),
    Note.deleteMany({}),
    School.deleteMany({}),
    Student.deleteMany({}),
    FeeStructure.deleteMany({}),
  ]);
  console.log('🧹 Cleaned existing data');

  // Create admin
  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@studyhub.in',
    password: 'admin123',
    role: 'admin',
  });
  console.log('👤 Admin created:', admin.email);

  // Create school
  const school = await School.create({
    name: 'Delhi Public School',
    address: 'Mathura Road, New Delhi',
    phone: '9876543210',
    email: 'admin@dps.edu.in',
    subscriptionPlan: 'pro',
    subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });
  console.log('🏫 School created:', school.name);

  // Create school admin
  const schoolAdmin = await User.create({
    name: 'School Admin',
    email: 'school@dps.edu.in',
    password: 'school123',
    role: 'school_admin',
    schoolId: school._id,
  });
  console.log('👤 School admin created:', schoolAdmin.email);

  // Create student user
  const studentUser = await User.create({
    name: 'Rahul Kumar',
    email: 'student@example.com',
    password: 'student123',
    role: 'student',
    class: '10',
  });
  console.log('👤 Student created:', studentUser.email);

  // Create sample notes
  const notes = await Note.insertMany([
    {
      title: 'Light – Reflection and Refraction',
      subject: 'Science',
      class: '10',
      chapter: 'Light',
      content: `# Light – Reflection and Refraction\n\n## Laws of Reflection\n\n1. The angle of incidence equals the angle of reflection\n2. The incident ray, reflected ray and normal all lie in the same plane\n\n## Refraction\n\nRefraction is the bending of light as it passes from one medium to another.\n\n### Snell's Law\n\n$$n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$$\n\n## Types of Mirrors\n\n- **Concave mirror**: Converging mirror\n- **Convex mirror**: Diverging mirror (used in vehicles)`,
      tags: ['light', 'optics', 'reflection', 'refraction'],
      isRevisionNote: false,
      downloadCount: 4200,
      viewCount: 12000,
    },
    {
      title: 'Quadratic Equations – Complete Notes',
      subject: 'Mathematics',
      class: '10',
      chapter: 'Quadratic Equations',
      content: `# Quadratic Equations\n\n## Standard Form\n\nAn equation of the form **ax² + bx + c = 0** where a ≠ 0\n\n## Methods of Solving\n\n### 1. Factorization\nFind two numbers that multiply to ac and add to b.\n\n### 2. Completing the Square\n\n### 3. Quadratic Formula\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n## Discriminant (D)\n\n- **D > 0**: Two distinct real roots\n- **D = 0**: Two equal real roots  \n- **D < 0**: No real roots (complex roots)`,
      tags: ['quadratic', 'algebra', 'equations', 'maths'],
      isRevisionNote: true,
      downloadCount: 3800,
      viewCount: 9500,
    },
    {
      title: 'Rise of Nationalism in Europe',
      subject: 'Social Science',
      class: '10',
      chapter: 'Nationalism',
      content: `# The Rise of Nationalism in Europe\n\n## Introduction\n\nNationalism emerged as a powerful force in 19th century Europe.\n\n## The French Revolution and Napoleon\n\nThe French Revolution (1789) created ideas of:\n- Liberty\n- Equality  \n- Fraternity\n\n## Romanticism and Nationalism\n\nRomanticism was a cultural movement that helped develop national identity through:\n- Folk songs and poetry\n- Language and culture\n- Shared history`,
      tags: ['nationalism', 'Europe', 'history', 'French Revolution'],
      isRevisionNote: false,
      downloadCount: 3100,
      viewCount: 7800,
    },
    {
      title: 'Electrochemistry – Revision Notes',
      subject: 'Chemistry',
      class: '12',
      chapter: 'Electrochemistry',
      content: `# Electrochemistry\n\n## Key Concepts\n\n### Electrochemical Cells\n- **Galvanic/Voltaic Cell**: Converts chemical energy to electrical energy\n- **Electrolytic Cell**: Converts electrical energy to chemical energy\n\n### Standard Electrode Potential (E°)\n\n### Nernst Equation\n$$E = E° - \\frac{RT}{nF}\\ln Q$$\n\n## Faraday's Laws\n\n1. Mass of substance deposited ∝ charge passed\n2. Same charge deposits different substances in ratio of equivalent weights`,
      tags: ['electrochemistry', 'galvanic', 'electrolysis', 'chemistry'],
      isRevisionNote: true,
      downloadCount: 2200,
      viewCount: 6000,
    },
    {
      title: 'Trigonometry – Formula Sheet',
      subject: 'Mathematics',
      class: '10',
      chapter: 'Trigonometry',
      content: `# Trigonometry Formula Sheet\n\n## Basic Ratios\n\n| Ratio | Formula |\n|-------|--------|\n| sin θ | P/H |\n| cos θ | B/H |\n| tan θ | P/B |\n\n## Identities\n\n- sin²θ + cos²θ = 1\n- 1 + tan²θ = sec²θ\n- 1 + cot²θ = cosec²θ\n\n## Standard Values\n\n| Angle | sin | cos | tan |\n|-------|-----|-----|-----|\n| 0°    | 0   | 1   | 0   |\n| 30°   | 1/2 | √3/2 | 1/√3 |\n| 45°   | 1/√2 | 1/√2 | 1 |\n| 60°   | √3/2 | 1/2 | √3 |\n| 90°   | 1   | 0   | ∞  |`,
      tags: ['trigonometry', 'formulas', 'maths', 'identities'],
      isRevisionNote: true,
      downloadCount: 5600,
      viewCount: 15000,
    },
  ]);
  console.log(`📚 ${notes.length} sample notes created`);

  // Create sample students
  const students = await Student.insertMany([
    { name: 'Arjun Sharma', rollNumber: '001', class: '10', section: 'A', parentName: 'Suresh Sharma', parentPhone: '9876543211', gender: 'male', dob: '2008-05-15', schoolId: school._id, address: 'Sector 12, Delhi' },
    { name: 'Priya Singh', rollNumber: '002', class: '10', section: 'A', parentName: 'Rajesh Singh', parentPhone: '9876543212', gender: 'female', dob: '2008-08-22', schoolId: school._id, address: 'Rohini, Delhi' },
    { name: 'Rohan Gupta', rollNumber: '003', class: '10', section: 'B', parentName: 'Mohan Gupta', parentPhone: '9876543213', gender: 'male', dob: '2008-03-10', schoolId: school._id, address: 'Dwarka, Delhi' },
    { name: 'Anjali Verma', rollNumber: '001', class: '9', section: 'A', parentName: 'Vijay Verma', parentPhone: '9876543214', gender: 'female', dob: '2009-11-05', schoolId: school._id, address: 'Janakpuri, Delhi' },
    { name: 'Karan Mehta', rollNumber: '002', class: '9', section: 'A', parentName: 'Deepak Mehta', parentPhone: '9876543215', gender: 'male', dob: '2009-07-18', schoolId: school._id, address: 'Pitampura, Delhi' },
  ]);
  console.log(`👨‍🎓 ${students.length} sample students created`);

  // Fee structures
  await FeeStructure.insertMany([
    {
      schoolId: school._id,
      class: '10',
      academicYear: '2024-25',
      tuitionFee: 8000,
      admissionFee: 0,
      examFee: 500,
      otherFees: [{ name: 'Sports Fee', amount: 300 }, { name: 'Lab Fee', amount: 200 }],
      totalAmount: 9000,
      dueDate: new Date('2024-07-10'),
    },
    {
      schoolId: school._id,
      class: '9',
      academicYear: '2024-25',
      tuitionFee: 7000,
      admissionFee: 0,
      examFee: 500,
      otherFees: [{ name: 'Sports Fee', amount: 300 }],
      totalAmount: 7800,
      dueDate: new Date('2024-07-10'),
    },
  ]);
  console.log('💰 Fee structures created');

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('🔑 LOGIN CREDENTIALS');
  console.log('─────────────────────────────────────────');
  console.log('Admin:        admin@studyhub.in    / admin123');
  console.log('School Admin: school@dps.edu.in    / school123');
  console.log('Student:      student@example.com  / student123');
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
