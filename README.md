# 🏸 Badminton Tournament Management System — Enterprise SaaS Edition

## 🌟 OVERVIEW

**Production-ready, enterprise-grade tournament management platform** with:
- ✅ **Multi-tenant SaaS architecture** — Organizations, subscriptions, usage limits
- ✅ **Granular RBAC** (Role-Based Access Control) — 6 roles, 20+ permissions
- ✅ **Fully customizable rules** — Every scoring parameter configurable per category
- ✅ **BWF-compliant scoring** — Toss, rally point, deuce, golden point, side switching
- ✅ **Real-time live scoring** — Professional umpire portal with keyboard shortcuts
- ✅ **Zero-config bracket generation** — Single/double elimination, round robin, groups
- ✅ **Payment management** — Entry fees, payment proofs, approvals
- ✅ **Team collaboration** — Invite users, assign roles, manage permissions

---

## 📋 TABLE OF CONTENTS

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Quick Start](#-quick-start)
4. [SaaS Architecture](#-saas-architecture)
5. [Role & Permission System](#-role--permission-system)
6. [Tournament Rules Engine](#-tournament-rules-engine)
7. [BWF Scoring System](#-bwf-scoring-system)
8. [API Documentation](#-api-documentation)
9. [File Structure](#-file-structure)
10. [Deployment](#-deployment)

---

## ✨ FEATURES

### 🏢 **Multi-Tenant SaaS**
- **Organizations** — Each org has its own users, tournaments, data
- **Subscription plans** — Free, Starter, Pro, Enterprise
- **Usage limits** — Tournaments, users, storage per plan
- **Billing tracking** — Monitor usage, upgrade prompts

### 👥 **Role-Based Access Control (RBAC)**

| Role | Permissions |
|------|------------|
| **Super Admin** | Everything — cross-organization access |
| **Org Admin** | Manage org settings, invite users, view billing, all tournaments |
| **Organizer** | Create tournaments, manage registrations, generate brackets |
| **Staff** | Approve registrations, schedule matches, view data |
| **Umpire** | Score live matches, edit results |
| **Player** | View tournaments, brackets (read-only) |

**Granular permissions** across:
- Tournaments (create, edit, delete, viewAll)
- Registrations (approve, reject, viewPayments, editPayments)
- Brackets (generate, edit, viewAll)
- Matches (schedule, score, editScores, viewLive)
- Users (invite, edit, delete, viewAll)
- Settings (editOrg, viewBilling, manageBilling)

### ⚙️ **Fully Customizable Tournament Rules**

**Per-category configuration:**

#### Format Options
- **Knockout** — Single elimination, double elimination, 3rd place match
- **Round Robin** — Group count, teams advancing per group, points system
- **Group + Knockout** — Hybrid format

#### Match Scoring
- **Sets** — Best of 1, 3, or 5
- **Points per set** — 11, 15, 21, 25, or 30 points
- **Deuce rules:**
  - Standard (2-point advantage)
  - Golden point (sudden death)
  - Hard cap (no advantage)
- **Point advantage** — Configurable gap needed to win
- **Max cap** — Absolute maximum points (BWF: 30)

#### Service & Court
- **Rally point scoring** — BWF standard (point on every rally)
- **Side switching** — Auto after each set
- **Mid-set switch** — At 11 points in 3rd set (configurable)

#### Timeouts & Breaks
- **Timeouts per set** — 0-3
- **Timeout duration** — Configurable seconds
- **Set break** — Rest between sets
- **Match break** — Optional rest before deciding set

#### Advanced
- **Walkover** — Allow forfeits
- **Tiebreakers** — Head-to-head, set diff, point diff, playoff
- **Custom point systems** — For round robin

### 🏆 **BWF-Compliant Scoring**

#### Pre-Match Toss Flow
1. Set court number
2. Coin toss — record winner
3. Winner chooses: Serve / Receive / Left side / Right side
4. Loser gets remaining choice
5. Summary screen before match start

#### Live Scoring
- **Full-screen scoring interface** — Giant tap zones
- **Keyboard shortcuts** — ← / A (Team 1), → / D (Team 2), Z / Backspace (Undo)
- **Server tracking** — Point scorer becomes server (rally point)
- **Side tracking** — Visual left/right indicators
- **Set progress** — Circles showing current/won sets
- **Alert banners** — Match point, deuce, set point, side switch
- **Auto-detection** — Deuce, golden point, set completion, match winner
- **Auto-advancement** — Winner progresses to next round in bracket
- **Undo** — Full history with unlimited undo

#### Regulations Enforced
- ✅ Rally point scoring (scorer becomes server)
- ✅ Sides switch after each set
- ✅ Sides switch at 11 in 3rd set
- ✅ Deuce at 20-20 (configurable)
- ✅ Golden point at 29-29 (configurable)
- ✅ Set winner serves first in next set
- ✅ Cap at 30 points (configurable)

### 🎫 **Umpire Access System**
- **Single 6-character code** per tournament
- **No login required** — code-based access
- **WhatsApp copy button** — Pre-formatted message
- **Works on any device** — Phone, tablet, laptop
- **Multi-match support** — All matches in one portal
- **Auto-refresh** — Live updates every 10 seconds
- **Filter by status** — Live, Pending, Completed

### 📊 **Smart Bracket Generation**
- **Automatic seeding** — Random or manual
- **Zero BYE vs BYE matches** — Intelligent placement
- **Visual tree display** — Round-by-round progression
- **Live status tracking** — Pending, Live, Completed
- **Match scheduling** — Set court, time
- **Winner auto-advancement** — No manual updates needed

### 💰 **Payment Management**
- **Entry fee configuration** — Per tournament
- **Payment instructions** — UPI, bank details
- **Screenshot upload** — Players attach payment proof
- **Approval workflow** — Organizers verify payments
- **Payment filtering** — Approved, pending, rejected

### 📱 **Public Registration**
- **Shareable link** — /tournaments/:id/register
- **Team entry** — Singles or doubles players
- **Category selection** — Dropdown of available categories
- **Payment proof upload** — Image/PDF
- **Confirmation screen** — Registration received

---

## 🛠 TECH STACK

### Backend
- **Node.js** + Express.js
- **MongoDB** + Mongoose (Multi-tenant schema design)
- **JWT** authentication
- **Multer** file uploads
- **bcrypt** password hashing

### Frontend
- **React** 18
- **React Router** v6
- **Axios** API client
- **Context API** state management
- **Custom design system** (no UI library — pure CSS)

### Design
- **DM Sans** + **DM Mono** fonts
- **Dark theme** — Professional color palette
- **Responsive** — Mobile, tablet, desktop
- **Animations** — Smooth transitions, micro-interactions

---

## 🚀 QUICK START

### Prerequisites
- Node.js v16+ (Tested on v24.2.0)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# 1. Extract the ZIP
unzip badminton-advanced-system.zip
cd badminton-app

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Configure MongoDB
# Edit backend/server.js
# Uncomment lines 18-22 and set your MongoDB connection string

# 5. Start backend (from backend folder)
npm run dev
# → Running on http://localhost:3001

# 6. Start frontend (from frontend folder, new terminal)
npm start
# → Running on http://localhost:3000
```

### First Login

**Default super admin (create manually in MongoDB):**
```javascript
{
  email: "admin@example.com",
  password: "admin123", // will be hashed
  name: "Super Admin",
  role: "super_admin"
}
```

Or register a new user → auto-assigned "organizer" role.

---

## 🏢 SAAS ARCHITECTURE

### Database Schema

#### **Organization**
```javascript
{
  name: String,
  slug: String, // unique URL-friendly identifier
  owner: ObjectId, // User who created the org
  subscription: {
    plan: 'free' | 'starter' | 'pro' | 'enterprise',
    status: 'trial' | 'active' | 'suspended' | 'cancelled',
    startDate, endDate, autoRenew
  },
  limits: {
    tournaments: Number,
    totalUsers: Number,
    storageGB: Number,
    customBranding: Boolean,
    whiteLabel: Boolean,
    apiAccess: Boolean
  },
  usage: {
    tournamentsCreated: Number,
    activeUsers: Number,
    storageUsedMB: Number
  },
  branding: {
    primaryColor, secondaryColor,
    customDomain, emailFooter
  },
  settings: {
    defaultCurrency, timezone, dateFormat,
    autoApproveRegistrations, requirePaymentProof
  }
}
```

#### **User**
```javascript
{
  email, password, name, phone,
  organizationId: ObjectId,
  role: 'super_admin' | 'org_admin' | 'organizer' | 'umpire' | 'staff' | 'player',
  permissions: {
    tournaments: { create, edit, delete, viewAll },
    registrations: { approve, reject, viewPayments, editPayments },
    brackets: { generate, edit, viewAll },
    matches: { schedule, score, editScores, viewLive },
    users: { invite, edit, delete, viewAll },
    settings: { editOrg, viewBilling, manageBilling }
  },
  isActive, lastLogin, isVerified
}
```

#### **Tournament**
```javascript
{
  name, description, venue, startDate, endDate,
  organization: ObjectId,
  organizer: ObjectId,
  collaborators: [{ user, role, addedAt }],
  status: 'draft' | 'upcoming' | 'live' | 'completed' | 'cancelled',
  requirePayment, entryFee, paymentDetails,
  umpireAccessCode: String, // 6-char code
  categories: [{
    name, type, gender, ageGroup,
    rules: {
      format: 'knockout' | 'round_robin' | 'group_knockout',
      knockout: { singleElimination, doubleElimination, thirdPlaceMatch },
      roundRobin: { groupCount, teamsAdvancePerGroup, pointsForWin, pointsForLoss },
      bestOf, pointsPerSet,
      deuce, deuceType, goldenPoint, maxCap, pointAdvantage,
      rallyPoint, serveSideSwitch, midSetSwitch, midSetSwitchPoint,
      timeoutsPerSet, timeoutDurationSec,
      setBreakDurationSec, matchBreakDurationSec,
      allowWalkover, tiebreaker
    },
    bracket: Object, // nested match tree
    bracketGenerated: Boolean
  }],
  settings: {
    allowPublicRegistration, autoApproveRegistrations,
    enableLiveScoring, enablePublicBrackets
  }
}
```

### Subscription Plans

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Tournaments | 2 | 10 | 50 | Unlimited |
| Users | 5 | 10 | Unlimited | Unlimited |
| Storage | 1 GB | 5 GB | 20 GB | Unlimited |
| Custom Branding | ❌ | ❌ | ✅ | ✅ |
| White Label | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ❌ | ✅ |

---

## 🔐 ROLE & PERMISSION SYSTEM

### Implementation

**Middleware:**
```javascript
// Check specific permission
checkPermission('tournaments', 'create')

// Check role
requireRole('org_admin', 'super_admin')

// Check organization membership
checkOrganization()
```

**Example route:**
```javascript
router.post('/tournaments', 
  auth, 
  checkOrganization(), 
  checkPermission('tournaments', 'create'),
  async (req, res) => {
    // Create tournament
  }
);
```

### Permission Matrix

| Permission | Super | Org Admin | Organizer | Staff | Umpire | Player |
|------------|-------|-----------|-----------|-------|--------|--------|
| Create tournament | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete tournament | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve registration | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Generate bracket | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Schedule match | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Score live match | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Edit match result | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Invite users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View billing | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage billing | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## ⚙️ TOURNAMENT RULES ENGINE

### Configurable Parameters

**Format:**
- Single elimination knockout
- Double elimination (losers bracket)
- Round robin (league)
- Group + knockout (hybrid)
- 3rd place playoff (optional)

**Scoring:**
- Best of 1, 3, or 5 sets
- 11, 15, 21, 25, or 30 points per set
- Deuce on/off
- Deuce type: Standard (2-pt advantage) / Golden point / Hard cap
- Point advantage: 1, 2, or custom
- Max cap: 25, 30, or custom

**Service:**
- Rally point (BWF) or traditional
- Side switching on/off
- Mid-set switch (3rd set) on/off
- Switch point (default 11)

**Breaks:**
- Timeouts: 0-3 per set
- Timeout duration: 30-120 seconds
- Set break: 60-180 seconds
- Match break: 0-300 seconds

**Advanced:**
- Walkover allowed/disallowed
- Tiebreaker rules (round robin)
- Points for win/loss/draw

### Example: Custom Tournament

**Beach Badminton (Best of 5 to 15 points, no deuce)**

```javascript
rules: {
  format: 'knockout',
  bestOf: 5,
  pointsPerSet: 15,
  deuce: false,
  rallyPoint: true,
  serveSideSwitch: true,
  midSetSwitch: false,
  timeoutsPerSet: 1,
  timeoutDurationSec: 30,
  setBreakDurationSec: 60
}
```

---

## 🏸 BWF SCORING SYSTEM

### Toss Workflow

```
┌─────────────────────┐
│  Set Court Number   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Coin Toss Winner  │
│   (Team 1 or 2)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Winner's Choice:   │
│  • Serve            │
│  • Receive          │
│  • Left side        │
│  • Right side       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Loser's Choice:    │
│  (Remaining option) │
│  • Side if winner   │
│    chose serve      │
│  • Serve if winner  │
│    chose side       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Summary & Start    │
│  • First server     │
│  • First receiver   │
│  • Team 1 side      │
│  • Team 2 side      │
└─────────────────────┘
```

### Scoring Rules

**Rally Point:**
- Point on every rally (regardless of server)
- Point scorer becomes new server
- Server alternates on every point

**Deuce (20-20):**
- Need 2-point advantage to win
- OR Golden point at 29-29 (next point wins)
- OR Hard cap at 30

**Set Completion:**
- First to 21 with 2-point gap
- OR Golden point winner
- OR First to 30 (cap)

**Match Winner:**
- Best of 3: First to 2 sets
- Best of 5: First to 3 sets

**Side Switching:**
- After every set
- At 11 points in 3rd set

**Server in New Set:**
- Winner of previous set serves first

---

## 📡 API DOCUMENTATION

### Authentication

**Register**
```
POST /api/auth/register
Body: { email, password, name }
Response: { user, token }
```

**Login**
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

### Organizations

**Get my org**
```
GET /api/organizations/my
Headers: Authorization: Bearer <token>
Response: { name, subscription, limits, usage }
```

**Get org users**
```
GET /api/organizations/users
Headers: Authorization: Bearer <token>
Response: { users: [...] }
```

**Invite user**
```
POST /api/organizations/users/invite
Headers: Authorization: Bearer <token>
Body: { email, name, role }
Response: { user, temporaryPassword }
```

**Update user role**
```
PUT /api/organizations/users/:userId
Headers: Authorization: Bearer <token>
Body: { role, permissions, isActive }
```

### Tournaments

**Create**
```
POST /api/tournaments
Headers: Authorization: Bearer <token>
Body: { name, venue, startDate, endDate, categories: [...], ... }
Response: { tournament }
```

**Get my tournaments**
```
GET /api/tournaments/my
Headers: Authorization: Bearer <token>
Response: [{ _id, name, status, ... }]
```

### Brackets

**Generate bracket**
```
POST /api/brackets/generate
Headers: Authorization: Bearer <token>
Body: { tournamentId, categoryId }
Response: { bracket, totalTeams }
```

**Start toss**
```
PUT /api/brackets/match/toss-init
Body: { tournamentId, categoryId, matchId, umpireCode, courtNumber }
Response: { match }
```

**Record toss winner**
```
PUT /api/brackets/match/toss-result
Body: { tournamentId, categoryId, matchId, umpireCode, tossWinner }
Response: { match }
```

**Toss winner's choice**
```
PUT /api/brackets/match/toss-choice
Body: { tournamentId, categoryId, matchId, umpireCode, choice }
Response: { match }
```

**Start match**
```
PUT /api/brackets/match/start
Body: { tournamentId, categoryId, matchId, umpireCode }
Response: { match }
```

**Score point**
```
PUT /api/brackets/match/score
Body: { tournamentId, categoryId, matchId, umpireCode, scorer: 'team1' | 'team2' }
Response: { match, bracket }
```

**Undo point**
```
PUT /api/brackets/match/undo
Body: { tournamentId, categoryId, matchId, umpireCode }
Response: { match }
```

**Umpire lookup**
```
POST /api/brackets/umpire/lookup
Body: { code: '6CHAR' }
Response: { tournament, matches, categories }
```

---

## 📁 FILE STRUCTURE

```
badminton-app/
├── backend/
│   ├── models/
│   │   ├── User.js                  # User with RBAC
│   │   ├── Organization.js          # Multi-tenant
│   │   ├── Tournament.js            # Full rules config
│   │   └── Registration.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── organizations.js         # Team management
│   │   ├── tournaments.js
│   │   ├── registrations.js
│   │   └── brackets.js              # BWF scoring engine
│   ├── middleware/
│   │   ├── auth.js
│   │   └── permissions.js           # RBAC middleware
│   ├── utils/
│   │   └── fixtureGenerator.js      # Bracket algorithm
│   ├── uploads/                     # Payment screenshots
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── TournamentCreatePage.js  # Full customization
│   │   │   ├── TournamentDetailPage.js  # Admin panel
│   │   │   ├── RegistrationsPage.js
│   │   │   ├── BracketPage.js
│   │   │   ├── UmpirePortalPage.js      # Toss + scoring
│   │   │   ├── TeamManagementPage.js    # RBAC UI
│   │   │   ├── PublicTournamentsPage.js
│   │   │   └── PublicRegisterPage.js
│   │   ├── App.js
│   │   ├── api.js
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## 🚀 DEPLOYMENT

### Backend (Node.js)

**Environment variables (.env):**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=production
```

**Platforms:**
- **Heroku:** `git push heroku main`
- **Railway:** Connect GitHub repo
- **DigitalOcean App Platform:** Connect repo
- **AWS EC2:** PM2 + nginx reverse proxy

### Frontend (React)

**Build:**
```bash
npm run build
# Creates /build folder
```

**Platforms:**
- **Netlify:** Drag & drop /build folder
- **Vercel:** Connect GitHub repo
- **Cloudflare Pages:** Connect repo
- **AWS S3 + CloudFront:** Upload /build to S3

### Database (MongoDB)

**MongoDB Atlas (Recommended):**
1. Create cluster at mongodb.com/cloud/atlas
2. Get connection string
3. Add to backend .env

---

## 📝 USAGE EXAMPLES

### 1. Create Organization (First-time setup)

```javascript
// POST /api/organizations (Super admin creates org)
{
  name: "Chennai Badminton Association",
  email: "info@cbachennai.in",
  phone: "+91 98765 43210",
  subscription: { plan: "pro" }
}
```

### 2. Invite Team Members

```javascript
// POST /api/organizations/users/invite
{
  email: "john@example.com",
  name: "John Smith",
  role: "organizer"  // Gets default permissions for organizer
}
```

### 3. Create Tournament with Custom Rules

```javascript
// POST /api/tournaments
{
  name: "Summer Championship 2024",
  venue: "Indoor Arena",
  startDate: "2024-07-01",
  endDate: "2024-07-03",
  categories: [{
    name: "Men Singles",
    type: "singles",
    gender: "men",
    ageGroup: "open",
    rules: {
      format: "knockout",
      knockout: { singleElimination: true, thirdPlaceMatch: true },
      bestOf: 3,
      pointsPerSet: 21,
      deuce: true,
      deuceType: "standard",
      goldenPoint: true,
      maxCap: 30,
      pointAdvantage: 2,
      rallyPoint: true,
      serveSideSwitch: true,
      midSetSwitch: true,
      midSetSwitchPoint: 11,
      timeoutsPerSet: 0,
      setBreakDurationSec: 120
    }
  }]
}
```

### 4. Umpire Workflow

```
1. Organizer shares code: AB3F9K
2. Umpire opens: /umpire
3. Enters code → sees all matches
4. Taps live match → toss flow
5. Records toss: winner, choice, loser choice
6. Starts match
7. Scores points: tap or keyboard
8. System auto-detects deuce, set end, match winner
9. Winner auto-advances in bracket
```

---

## 🎯 ROADMAP

### Planned Features
- [ ] SMS notifications (Twilio)
- [ ] Email notifications (SendGrid)
- [ ] Payment gateway integration (Razorpay)
- [ ] QR code entry tickets
- [ ] Spectator live view (public bracket + scores)
- [ ] Player profiles & stats
- [ ] Historical analytics dashboard
- [ ] Multi-language support
- [ ] Mobile apps (React Native)
- [ ] API webhooks
- [ ] Export reports (PDF, Excel)

---

## 🤝 SUPPORT

**Issues?** Create a GitHub issue or contact support.

**Custom development?** Available for enterprise clients.

---

## 📄 LICENSE

Proprietary — Enterprise license required for commercial use.

---

Built with 🏸 for tournament organizers worldwide.
