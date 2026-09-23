require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Project.deleteMany({});

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@qaplatform.com',
    password: 'Admin@1234',
    role: 'super_admin',
    isVerified: true,
  });

  const dev = await User.create({
    name: 'John Developer',
    email: 'dev@qaplatform.com',
    password: 'Admin@1234',
    role: 'developer',
    isVerified: true,
  });

  const tester = await User.create({
    name: 'Jane Tester',
    email: 'tester@qaplatform.com',
    password: 'Admin@1234',
    role: 'tester',
    isVerified: true,
  });

  await Project.create({
    name: 'Demo Project',
    key: 'DEMO',
    description: 'A sample project to explore the platform',
    type: 'web',
    priority: 'high',
    status: 'active',
    owner: admin._id,
    qaLead: tester._id,
    devLead: dev._id,
    members: [
      { user: admin._id, role: 'project_admin' },
      { user: dev._id, role: 'developer' },
      { user: tester._id, role: 'tester' },
    ],
    techStack: ['React', 'Node.js', 'MongoDB'],
    releaseVersion: '1.0.0',
    startDate: new Date(),
  });

  console.log('Seed complete!');
  console.log('Admin: admin@qaplatform.com / Admin@1234');
  console.log('Dev:   dev@qaplatform.com  / Admin@1234');
  console.log('Tester:tester@qaplatform.com / Admin@1234');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
