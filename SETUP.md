# 🚀 QUICK SETUP GUIDE

## Prerequisites
- Node.js v16+ installed
- MongoDB installed (local or Atlas)

---

## Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

---

## Step 2: Configure MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com

# Start MongoDB
# macOS/Linux: mongod
# Windows: net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `backend/server.js` line 19

---

## Step 3: Uncomment MongoDB Connection

Edit `backend/server.js`:

```javascript
// UNCOMMENT THESE LINES (18-22):
mongoose.connect('mongodb://localhost:27017/badminton-tournament', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));
```

---

## Step 4: Seed Database with Dummy Data

```bash
cd backend
node seed.js
```

**This creates:**
- ✅ 1 Organization (Chennai Badminton Association)
- ✅ 5 Users (different roles)
- ✅ 1 Tournament (Summer Championship 2024)
- ✅ 5 Categories (Men/Women Singles, Men/Mixed Doubles, U17)
- ✅ 22 Approved Registrations
- ✅ 2 Pending Registrations

---

## Step 5: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# → http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# → http://localhost:3000
```

---

## Step 6: Login & Test

### Login Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Org Admin** | admin@cbachennai.in | admin123 | Everything |
| **Organizer** | organizer@cbachennai.in | organizer123 | Create tournaments, manage registrations |
| **Staff** | staff@cbachennai.in | staff123 | Approve registrations, schedule matches |
| **Umpire** | umpire@cbachennai.in | umpire123 | Score matches only |
| **Player** | player@example.com | player123 | View only |

### Test Flow

1. **Login** → Use `admin@cbachennai.in / admin123`

2. **Dashboard** → You'll see "Summer Championship 2024"

3. **Click Tournament** → View admin panel with 4 tabs

4. **Go to "Brackets & Scoring" tab**
   - Click "⚡ Generate Bracket" for any category
   - Watch bracket auto-generate!

5. **Go to "🔐 Umpire Access" tab**
   - See giant code: **DEMO24**
   - Click "Copy WhatsApp Message"
   - Click "🏸 Open Portal"

6. **Umpire Portal** (new tab)
   - Enter code: **DEMO24**
   - See all matches
   - Click a match → Complete toss → Score live!

7. **Test Keyboard Shortcuts**
   - ← or A = Team 1 point
   - → or D = Team 2 point
   - Z or Backspace = Undo

8. **Team Management** (Org Admin only)
   - Click "Team" in navbar
   - See all 5 users with roles
   - Invite new user
   - Change roles

9. **Registrations**
   - Click "Manage Registrations" from tournament
   - Approve/reject pending entries
   - View payment screenshots

---

## 🎯 What's Included in Dummy Data

### Organization
- **Name:** Chennai Badminton Association
- **Plan:** Pro (50 tournaments, unlimited users)
- **Features:** Custom branding, API access, analytics

### Users (All Active & Verified)
- **Admin:** Full organization control + billing
- **Organizer:** Create/manage tournaments
- **Staff:** Approve registrations, schedule
- **Umpire:** Score matches live
- **Player:** View tournaments (read-only)

### Tournament: Summer Championship 2024
- **Venue:** Chennai Indoor Sports Complex
- **Dates:** July 15-17, 2024
- **Entry Fee:** ₹500
- **Umpire Code:** DEMO24
- **Status:** Upcoming

### Categories (5)
1. **Men Singles Open** — 8 players approved
2. **Women Singles Open** — 6 players approved
3. **Men Doubles Open** — 4 teams approved
4. **Mixed Doubles Open** — 4 teams approved
5. **Under 17 Boys Singles** — 0 players (empty for testing)

### Registrations
- **Approved:** 22 entries (ready to generate brackets)
- **Pending:** 2 entries (for testing approval flow)

---

## 🧪 Testing Scenarios

### 1. Generate Brackets
```
Login as Admin/Organizer
→ Tournament Detail
→ Brackets tab
→ Generate bracket for "Men Singles Open"
→ 8 players → Perfect bracket (QF, SF, F)
```

### 2. Live Scoring
```
Generate bracket first
→ Click "Full Bracket" button
→ Click "Start Match" on any match
→ Set court number, first server
→ Open Umpire Portal (code: DEMO24)
→ Enter toss details
→ Score live with keyboard shortcuts
→ Watch auto-detection (deuce, set end, match winner)
```

### 3. Role Testing
```
Logout → Login as Staff (staff@cbachennai.in / staff123)
→ Try to create tournament → BLOCKED (no permission)
→ Go to registrations → Can approve ✅
→ Go to brackets → Can view but not generate ❌
```

### 4. Team Management
```
Login as Admin
→ Click "Team" in navbar
→ Invite new user: test@example.com
→ Assign role: Umpire
→ See temp password in response
→ User appears in list
→ Change their role to Staff
→ Disable/enable users
```

### 5. Public Registration
```
Open: http://localhost:3000/tournaments/public
→ See "Summer Championship 2024"
→ Click "Register"
→ Fill form, upload fake payment proof
→ Submit → Status: Pending
→ Login as Admin → Approve/reject
```

---

## 📊 Database Structure

```
badminton-tournament (Database)
├── organizations (1 doc)
│   └── Chennai Badminton Association
├── users (5 docs)
│   ├── admin@cbachennai.in (org_admin)
│   ├── organizer@cbachennai.in (organizer)
│   ├── staff@cbachennai.in (staff)
│   ├── umpire@cbachennai.in (umpire)
│   └── player@example.com (player)
├── tournaments (1 doc)
│   └── Summer Championship 2024
│       ├── 5 categories
│       └── umpireAccessCode: DEMO24
└── registrations (24 docs)
    ├── 22 approved
    └── 2 pending
```

---

## 🔧 Troubleshooting

**MongoDB connection failed?**
```bash
# Check if MongoDB is running
mongosh
# OR
mongo
```

**Port already in use?**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Seed script fails?**
```bash
# Make sure MongoDB is running
# Clear database manually:
mongosh badminton-tournament
db.dropDatabase()
exit
# Re-run seed
node seed.js
```

**Can't generate brackets?**
```
Make sure:
1. At least 2 approved registrations exist
2. You're logged in as Admin or Organizer
3. Category hasn't already generated bracket
```

---

## 🎯 Next Steps After Testing

1. **Customize** tournament settings in seed.js
2. **Add more** categories/registrations
3. **Test** full toss → scoring → bracket update flow
4. **Deploy** to production (see README.md deployment section)
5. **Configure** payment gateway (Razorpay integration ready)

---

## 📞 Support

Issues? Check:
- Console for errors (F12 in browser)
- Backend terminal for API errors
- MongoDB logs for database issues

**Ready to sell to badminton federations worldwide! 🏸**
