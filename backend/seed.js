const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Organization = require('./models/Organization');
const User = require('./models/User');
const Tournament = require('./models/Tournament');
const Registration = require('./models/Registration');
console.log("🚀 SEED FUNCTION STARTED");
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/badminton-tournament', {
}).then(() => {
  console.log('✅ MongoDB connected');
  seedDatabase();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function seedDatabase() {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Tournament.deleteMany({});
    await Registration.deleteMany({});
    // ═══════════════════════════════════════════════════════
    // 11 CREATE ADMIN USER FIRST
    // ═══════════════════════════════════════════════════════
    console.log('👤 Creating admin user...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await User.create({
      email: 'admin@cbachennai.in',
      password: hashedPassword,
      name: 'Rajesh Kumar',
      mobile: '+91 98765 43210',
      role: 'org_admin',
      isActive: true,
      isVerified: true,
    });

    console.log(`✅ Admin created: ${adminUser.email}`);

    // ═══════════════════════════════════════════════════════
    // 1. CREATE ORGANIZATION
    // ═══════════════════════════════════════════════════════
   const org = await Organization.create({
  name: 'Chennai Badminton Association',
  slug: 'chennai-badminton',
  owner: adminUser._id, // ✅ REQUIRED FIELD PASSED HERE
  email: 'info@cbachennai.in',
  mobile: '+91 98765 43210',
  website: 'https://cbachennai.in',
  address: {
    street: '123 Sports Complex Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '600001',
  },
  subscription: {
    plan: 'pro',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-01-01'),
    autoRenew: true,
  },
  limits: {
    tournaments: 50,
    usersPerTournament: 999,
    totalUsers: 999,
    storageGB: 20,
    customBranding: true,
    whiteLabel: false,
    apiAccess: true,
    advancedAnalytics: true,
  },
  usage: {
    tournamentsCreated: 1,
    activeUsers: 5,
    storageUsedMB: 45,
  },
  branding: {
    primaryColor: '#00d4ff',
    secondaryColor: '#00e676',
    emailFooter: 'Chennai Badminton Association | Chennai, India',
  },
  settings: {
    defaultCurrency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    autoApproveRegistrations: false,
    requirePaymentProof: true,
    enablePublicBrackets: true,
    enableLiveScoring: true,
  },
});
    console.log(`✅ Organization created: ${org.name} (${org.slug})`);
    adminUser.organizationId = org._id;
await adminUser.save();

adminUser.organizationId = org._id;
await adminUser.save();

    // ═══════════════════════════════════════════════════════
    // 2. CREATE USERS (Different roles)
    // ═══════════════════════════════════════════════════════
    console.log('👥 Creating users...');
    

    // Organizer
    const organizer = await User.create({
      email: 'organizer@cbachennai.in',
      password: 'organizer123',
      name: 'Priya Sharma',
      mobile: '+91 98765 43211',
      organizationId: org._id,
      role: 'organizer',
      isActive: true,
      isVerified: true,
    });
    console.log(`✅ Organizer: ${organizer.email} (password: organizer123)`);

    // Staff
    const staff = await User.create({
      email: 'staff@cbachennai.in',
      password: 'staff123',
      name: 'Amit Patel',
      mobile: '+91 98765 43212',
      organizationId: org._id,
      role: 'staff',
      isActive: true,
      isVerified: true,
    });
    console.log(`✅ Staff: ${staff.email} (password: staff123)`);

    // Umpire
    const umpire = await User.create({
      email: 'umpire@cbachennai.in',
      password: 'umpire123',
      name: 'Suresh Reddy',
      mobile: '+91 98765 43213',
      organizationId: org._id,
      role: 'umpire',
      isActive: true,
      isVerified: true,
    });
    console.log(`✅ Umpire: ${umpire.email} (password: umpire123)`);

    // Player (for testing public view)
    const player = await User.create({
      email: 'player@example.com',
      password: 'player123',
      name: 'Vikram Singh',
      mobile: '+91 98765 43214',
      organizationId: org._id,
      role: 'player',
      isActive: true,
      isVerified: true,
    });
    console.log(`✅ Player: ${player.email} (password: player123)`);

    // ═══════════════════════════════════════════════════════
    // 3. CREATE TOURNAMENT
    // ═══════════════════════════════════════════════════════
    console.log('🏆 Creating tournament...');
    const tournament = await Tournament.create({
      name: 'Summer Championship 2024',
      description: 'Annual summer badminton tournament featuring multiple categories across all age groups and skill levels. Prize money for winners!',
      venue: 'Chennai Indoor Sports Complex',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-17'),
      organizerName: 'Rajesh Kumar',
      contactEmail: 'info@cbachennai.in',
      contactPhone: '+91 98765 43210',
      organization: org._id,
      organizer: adminUser._id,
      collaborators: [
        { user: organizer._id, role: 'admin', addedAt: new Date() },
        { user: staff._id, role: 'staff', addedAt: new Date() },
        { user: umpire._id, role: 'umpire', addedAt: new Date() },
      ],
      status: 'upcoming',
      requirePayment: true,
      entryFee: 500,
      paymentDetails: `Payment Methods:
🔹 UPI: cbachennai@upi
🔹 Bank Transfer:
   Bank: HDFC Bank
   Account: 50200012345678
   IFSC: HDFC0001234
   Name: Chennai Badminton Association

⚠️ Upload payment screenshot after registration!`,
      umpireAccessCode: 'DEMO24',
      categories: [
        {
          name: 'Men Singles Open',
          type: 'singles',
          gender: 'men',
          ageGroup: 'open',
          rules: {
            format: 'knockout',
            knockout: {
              singleElimination: true,
              doubleElimination: false,
              thirdPlaceMatch: true,
            },
            roundRobin: {
              groupCount: 2,
              teamsAdvancePerGroup: 2,
              pointsForWin: 2,
              pointsForLoss: 0,
              pointsForDraw: 1,
            },
            bestOf: 3,
            pointsPerSet: 21,
            deuce: true,
            deuceType: 'standard',
            goldenPoint: true,
            maxCap: 30,
            pointAdvantage: 2,
            rallyPoint: true,
            serveSideSwitch: true,
            midSetSwitch: true,
            midSetSwitchPoint: 11,
            timeoutsPerSet: 0,
            timeoutDurationSec: 60,
            setBreakDurationSec: 120,
            matchBreakDurationSec: 0,
            allowWalkover: true,
            walkoverAdvancesWinner: true,
            tiebreaker: ['head_to_head', 'set_difference', 'point_difference'],
          },
          maxTeams: 32,
          minTeams: 2,
          registrationDeadline: new Date('2024-07-10'),
          prizes: {
            winner: 15000,
            runnerUp: 8000,
            semifinalist: 3000,
          },
          bracket: null,
          bracketGenerated: false,
        },
        {
          name: 'Women Singles Open',
          type: 'singles',
          gender: 'women',
          ageGroup: 'open',
          rules: {
            format: 'knockout',
            knockout: {
              singleElimination: true,
              doubleElimination: false,
              thirdPlaceMatch: true,
            },
            bestOf: 3,
            pointsPerSet: 21,
            deuce: true,
            deuceType: 'standard',
            goldenPoint: true,
            maxCap: 30,
            pointAdvantage: 2,
            rallyPoint: true,
            serveSideSwitch: true,
            midSetSwitch: true,
            midSetSwitchPoint: 11,
            timeoutsPerSet: 0,
            setBreakDurationSec: 120,
            allowWalkover: true,
            tiebreaker: ['head_to_head', 'set_difference'],
          },
          prizes: {
            winner: 15000,
            runnerUp: 8000,
            semifinalist: 3000,
          },
          bracketGenerated: false,
        },
        {
          name: 'Men Doubles Open',
          type: 'doubles',
          gender: 'men',
          ageGroup: 'open',
          rules: {
            format: 'knockout',
            knockout: { singleElimination: true, thirdPlaceMatch: false },
            bestOf: 3,
            pointsPerSet: 21,
            deuce: true,
            deuceType: 'standard',
            goldenPoint: true,
            maxCap: 30,
            pointAdvantage: 2,
            rallyPoint: true,
            serveSideSwitch: true,
            midSetSwitch: true,
            midSetSwitchPoint: 11,
            allowWalkover: true,
          },
          prizes: {
            winner: 20000,
            runnerUp: 10000,
          },
          bracketGenerated: false,
        },
        {
          name: 'Mixed Doubles Open',
          type: 'mixed',
          gender: 'mixed',
          ageGroup: 'open',
          rules: {
            format: 'knockout',
            knockout: { singleElimination: true, thirdPlaceMatch: true },
            bestOf: 3,
            pointsPerSet: 21,
            deuce: true,
            deuceType: 'standard',
            goldenPoint: true,
            maxCap: 30,
            rallyPoint: true,
            serveSideSwitch: true,
            midSetSwitch: true,
            allowWalkover: true,
          },
          prizes: {
            winner: 18000,
            runnerUp: 9000,
            semifinalist: 3000,
          },
          bracketGenerated: false,
        },
        {
          name: 'Under 17 Boys Singles',
          type: 'singles',
          gender: 'men',
          ageGroup: 'u17',
          rules: {
            format: 'knockout',
            knockout: { singleElimination: true, thirdPlaceMatch: true },
            bestOf: 3,
            pointsPerSet: 21,
            deuce: true,
            deuceType: 'golden_point',
            goldenPoint: true,
            maxCap: 30,
            rallyPoint: true,
            serveSideSwitch: true,
            midSetSwitch: true,
            allowWalkover: true,
          },
          prizes: {
            winner: 5000,
            runnerUp: 2500,
          },
          bracketGenerated: false,
        },
      ],
      settings: {
        allowPublicRegistration: true,
        autoApproveRegistrations: false,
        enableLiveScoring: true,
        enablePublicBrackets: true,
        requirePaymentProof: true,
        notifyOnRegistration: true,
        notifyOnMatchStart: false,
      },
    });
    console.log(`✅ Tournament created: ${tournament.name}`);
    console.log(`   📍 Venue: ${tournament.venue}`);
    console.log(`   📅 Dates: ${tournament.startDate.toLocaleDateString()} - ${tournament.endDate.toLocaleDateString()}`);
    console.log(`   💰 Entry Fee: ₹${tournament.entryFee}`);
    console.log(`   🔐 Umpire Code: ${tournament.umpireAccessCode}`);
    console.log(`   📋 Categories: ${tournament.categories.length}`);

    // ═══════════════════════════════════════════════════════
    // 4. CREATE REGISTRATIONS (Approved teams)
    // ═══════════════════════════════════════════════════════
    console.log('📝 Creating registrations...');
    
    const menSinglesCategory = tournament.categories.find(c => c.name === 'Men Singles Open');
    const womenSinglesCategory = tournament.categories.find(c => c.name === 'Women Singles Open');
    const menDoublesCategory = tournament.categories.find(c => c.name === 'Men Doubles Open');
    const mixedDoublesCategory = tournament.categories.find(c => c.name === 'Mixed Doubles Open');
    
    // Men Singles - 8 players
    const menSinglesPlayers = [
      { name: 'Arjun Verma', mobile: '+91 98765 11111', email: 'arjun@example.com' },
      { name: 'Rohit Sharma', mobile: '+91 98765 11112', email: 'rohit@example.com' },
      { name: 'Karthik Rao', mobile: '+91 98765 11113', email: 'karthik@example.com' },
      { name: 'Aditya Nair', mobile: '+91 98765 11114', email: 'aditya@example.com' },
      { name: 'Rahul Desai', mobile: '+91 98765 11115', email: 'rahul@example.com' },
      { name: 'Manish Gupta', mobile: '+91 98765 11116', email: 'manish@example.com' },
      { name: 'Deepak Kumar', mobile: '+91 98765 11117', email: 'deepak@example.com' },
      { name: 'Sunil Reddy', mobile: '+91 98765 11118', email: 'sunil@example.com' },
    ];

    for (const p of menSinglesPlayers) {
      await Registration.create({
        tournament: tournament._id,
        categoryName: menSinglesCategory.name,
        teamName: p.name,
        player1: { name: p.name, mobile: p.mobile, email: p.email },
        player2: null,
        status: 'approved',
        paymentScreenshot: 'dummy-payment.jpg',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
      });
    }
    console.log(`✅ ${menSinglesPlayers.length} registrations: Men Singles`);

    // Women Singles - 6 players
    const womenSinglesPlayers = [
      { name: 'Ananya Iyer', mobile: '+91 98765 22221', email: 'ananya@example.com' },
      { name: 'Priya Menon', mobile: '+91 98765 22222', email: 'priya@example.com' },
      { name: 'Sneha Pillai', mobile: '+91 98765 22223', email: 'sneha@example.com' },
      { name: 'Divya Nair', mobile: '+91 98765 22224', email: 'divya@example.com' },
      { name: 'Kavya Reddy', mobile: '+91 98765 22225', email: 'kavya@example.com' },
      { name: 'Lakshmi Krishnan', mobile: '+91 98765 22226', email: 'lakshmi@example.com' },
    ];

    for (const p of womenSinglesPlayers) {
      await Registration.create({
        tournament: tournament._id,
        categoryName: womenSinglesCategory.name,
        teamName: p.name,
        player1: { name: p.name, mobile: p.mobile, email: p.email },
        player2: null,
        status: 'approved',
        paymentScreenshot: 'dummy-payment.jpg',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
      });
    }
    console.log(`✅ ${womenSinglesPlayers.length} registrations: Women Singles`);

    // Men Doubles - 4 teams
    const menDoublesTeams = [
      { p1: 'Arjun Verma', p2: 'Rohit Sharma', mobile1: '+91 98765 11111', mobile2: '+91 98765 11112' },
      { p1: 'Karthik Rao', p2: 'Aditya Nair', mobile1: '+91 98765 11113', mobile2: '+91 98765 11114' },
      { p1: 'Rahul Desai', p2: 'Manish Gupta', mobile1: '+91 98765 11115', mobile2: '+91 98765 11116' },
      { p1: 'Deepak Kumar', p2: 'Sunil Reddy', mobile1: '+91 98765 11117', mobile2: '+91 98765 11118' },
    ];

    for (const t of menDoublesTeams) {
      await Registration.create({
        tournament: tournament._id,
        categoryName: menDoublesCategory.name,
        teamName: `${t.p1} / ${t.p2}`,
        player1: { name: t.p1, mobile: t.mobile1, email: `${t.p1.toLowerCase().replace(' ', '')}@example.com` },
        player2: { name: t.p2, mobile: t.mobile2, email: `${t.p2.toLowerCase().replace(' ', '')}@example.com` },
        status: 'approved',
        paymentScreenshot: 'dummy-payment.jpg',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
      });
    }
    console.log(`✅ ${menDoublesTeams.length} registrations: Men Doubles`);

    // Mixed Doubles - 4 teams
    const mixedDoublesTeams = [
      { p1: 'Arjun Verma', p2: 'Ananya Iyer' },
      { p1: 'Rohit Sharma', p2: 'Priya Menon' },
      { p1: 'Karthik Rao', p2: 'Sneha Pillai' },
      { p1: 'Aditya Nair', p2: 'Divya Nair' },
    ];

    for (const t of mixedDoublesTeams) {
      await Registration.create({
        tournament: tournament._id,
        categoryName: mixedDoublesCategory.name,
        teamName: `${t.p1} / ${t.p2}`,
        player1: { name: t.p1, mobile: '+91 98765 00000', email: `${t.p1.toLowerCase().replace(' ', '')}@example.com` },
        player2: { name: t.p2, mobile: '+91 98765 00001', email: `${t.p2.toLowerCase().replace(' ', '')}@example.com` },
        status: 'approved',
        paymentScreenshot: 'dummy-payment.jpg',
        approvedBy: adminUser._id,
        approvedAt: new Date(),
      });
    }
    console.log(`✅ ${mixedDoublesTeams.length} registrations: Mixed Doubles`);

    // Pending registrations (for testing approval workflow)
    await Registration.create({
      tournament: tournament._id,
      categoryName: menSinglesCategory.name,
      teamName: 'Pending Player 1',
      player1: { name: 'Pending Player 1', mobile: '+91 98765 99991', email: 'pending1@example.com' },
      status: 'pending',
      paymentScreenshot: 'payment-proof-pending.jpg',
    });

    await Registration.create({
      tournament: tournament._id,
      categoryName: womenSinglesCategory.name,
      teamName: 'Pending Player 2',
      player1: { name: 'Pending Player 2', mobile: '+91 98765 99992', email: 'pending2@example.com' },
      status: 'pending',
      paymentScreenshot: 'payment-proof-pending.jpg',
    });

    console.log(`✅ 2 pending registrations (for testing approval)`);

    // ═══════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    
    console.log('\n📊 SUMMARY:');
    console.log(`   🏢 Organization: ${org.name}`);
    console.log(`   👥 Users: 5 (1 admin, 1 organizer, 1 staff, 1 umpire, 1 player)`);
    console.log(`   🏆 Tournament: ${tournament.name}`);
    console.log(`   📋 Categories: ${tournament.categories.length}`);
    console.log(`   ✅ Approved Registrations: ${menSinglesPlayers.length + womenSinglesPlayers.length + menDoublesTeams.length + mixedDoublesTeams.length}`);
    console.log(`   ⏳ Pending Registrations: 2`);

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('   ┌─────────────────────────────────────────────────┐');
    console.log('   │ Org Admin:   admin@cbachennai.in / admin123     │');
    console.log('   │ Organizer:   organizer@cbachennai.in / organizer123');
    console.log('   │ Staff:       staff@cbachennai.in / staff123     │');
    console.log('   │ Umpire:      umpire@cbachennai.in / umpire123   │');
    console.log('   │ Player:      player@example.com / player123     │');
    console.log('   └─────────────────────────────────────────────────┘');

    console.log('\n🔐 UMPIRE PORTAL:');
    console.log(`   Code: ${tournament.umpireAccessCode}`);
    console.log(`   URL:  http://localhost:3000/umpire`);

    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Start backend:  cd backend && npm run dev');
    console.log('   2. Start frontend: cd frontend && npm start');
    console.log('   3. Login with any credentials above');
    console.log('   4. Go to tournament → Generate brackets');
    console.log('   5. Open umpire portal with code: DEMO24');
    console.log('   6. Start scoring matches!');
    
    console.log('\n' + '═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}
