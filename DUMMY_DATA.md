# 📊 DUMMY DATA REFERENCE

All dummy data is created by running `npm run seed` in the backend folder.

---

## 🏢 ORGANIZATION

```javascript
{
  name: "Chennai Badminton Association",
  slug: "chennai-badminton",
  email: "info@cbachennai.in",
  phone: "+91 98765 43210",
  subscription: {
    plan: "pro", // 50 tournaments, unlimited users
    status: "active"
  }
}
```

---

## 👥 USERS (Login Credentials)

| Role | Email | Password | Can Do |
|------|-------|----------|---------|
| **Org Admin** | admin@cbachennai.in | admin123 | Everything — manage org, billing, users, all tournaments |
| **Organizer** | organizer@cbachennai.in | organizer123 | Create tournaments, manage registrations, generate brackets |
| **Staff** | staff@cbachennai.in | staff123 | Approve registrations, schedule matches, view data |
| **Umpire** | umpire@cbachennai.in | umpire123 | Score live matches, edit results |
| **Player** | player@example.com | player123 | View tournaments and brackets (read-only) |

---

## 🏆 TOURNAMENT

**Name:** Summer Championship 2024  
**Venue:** Chennai Indoor Sports Complex  
**Dates:** July 15-17, 2024  
**Entry Fee:** ₹500  
**Status:** Upcoming  
**Umpire Code:** `DEMO24`

**Payment Details:**
```
Payment Methods:
🔹 UPI: cbachennai@upi
🔹 Bank Transfer:
   Bank: HDFC Bank
   Account: 50200012345678
   IFSC: HDFC0001234
   Name: Chennai Badminton Association

⚠️ Upload payment screenshot after registration!
```

---

## 📋 CATEGORIES

### 1. Men Singles Open
- **Type:** Singles
- **Gender:** Men
- **Age:** Open
- **Format:** Knockout (single elimination)
- **Rules:** Best of 3, 21 points, BWF standard
- **3rd Place Match:** Yes
- **Prize:** ₹15,000 (winner), ₹8,000 (runner-up), ₹3,000 (semifinalist)
- **Approved Players:** 8

### 2. Women Singles Open
- **Type:** Singles
- **Gender:** Women
- **Age:** Open
- **Format:** Knockout
- **Rules:** Best of 3, 21 points, BWF standard
- **3rd Place Match:** Yes
- **Prize:** ₹15,000 (winner), ₹8,000 (runner-up), ₹3,000 (semifinalist)
- **Approved Players:** 6

### 3. Men Doubles Open
- **Type:** Doubles
- **Gender:** Men
- **Age:** Open
- **Format:** Knockout
- **Rules:** Best of 3, 21 points, BWF standard
- **3rd Place Match:** No
- **Prize:** ₹20,000 (winner), ₹10,000 (runner-up)
- **Approved Teams:** 4

### 4. Mixed Doubles Open
- **Type:** Mixed
- **Gender:** Mixed
- **Age:** Open
- **Format:** Knockout
- **Rules:** Best of 3, 21 points, BWF standard
- **3rd Place Match:** Yes
- **Prize:** ₹18,000 (winner), ₹9,000 (runner-up), ₹3,000 (semifinalist)
- **Approved Teams:** 4

### 5. Under 17 Boys Singles
- **Type:** Singles
- **Gender:** Men
- **Age:** U17
- **Format:** Knockout
- **Rules:** Best of 3, 21 points, golden point deuce
- **3rd Place Match:** Yes
- **Prize:** ₹5,000 (winner), ₹2,500 (runner-up)
- **Approved Players:** 0 (empty for testing)

---

## ✅ APPROVED REGISTRATIONS

### Men Singles Open (8 players)
1. Arjun Verma — arjun@example.com — +91 98765 11111
2. Rohit Sharma — rohit@example.com — +91 98765 11112
3. Karthik Rao — karthik@example.com — +91 98765 11113
4. Aditya Nair — aditya@example.com — +91 98765 11114
5. Rahul Desai — rahul@example.com — +91 98765 11115
6. Manish Gupta — manish@example.com — +91 98765 11116
7. Deepak Kumar — deepak@example.com — +91 98765 11117
8. Sunil Reddy — sunil@example.com — +91 98765 11118

### Women Singles Open (6 players)
1. Ananya Iyer — ananya@example.com — +91 98765 22221
2. Priya Menon — priya@example.com — +91 98765 22222
3. Sneha Pillai — sneha@example.com — +91 98765 22223
4. Divya Nair — divya@example.com — +91 98765 22224
5. Kavya Reddy — kavya@example.com — +91 98765 22225
6. Lakshmi Krishnan — lakshmi@example.com — +91 98765 22226

### Men Doubles Open (4 teams)
1. Arjun Verma / Rohit Sharma
2. Karthik Rao / Aditya Nair
3. Rahul Desai / Manish Gupta
4. Deepak Kumar / Sunil Reddy

### Mixed Doubles Open (4 teams)
1. Arjun Verma / Ananya Iyer
2. Rohit Sharma / Priya Menon
3. Karthik Rao / Sneha Pillai
4. Aditya Nair / Divya Nair

---

## ⏳ PENDING REGISTRATIONS (For Testing Approval)

1. **Pending Player 1** — pending1@example.com — Men Singles Open
2. **Pending Player 2** — pending2@example.com — Women Singles Open

**Test:** Login as Admin/Organizer/Staff → Registrations page → Approve/Reject

---

## 🎮 TESTING SCENARIOS

### Scenario 1: Generate 8-Player Bracket
```
Login: admin@cbachennai.in / admin123
→ Tournament: Summer Championship 2024
→ Brackets & Scoring tab
→ Click "⚡ Generate Bracket" for Men Singles Open
→ Result: Perfect bracket (8 players → QF, SF, F, 3rd place)
```

### Scenario 2: Generate 6-Player Bracket (with BYEs)
```
Same steps for Women Singles Open
→ Result: 6 players → 2 BYEs in Round 1 → QF, SF, F
```

### Scenario 3: Live Scoring Flow
```
1. Generate bracket (Men Singles)
2. Click "📊 Full Bracket"
3. Click "▶ Start Match" on Quarterfinal 1
4. Set court: 1, first server: Team 1
5. Copy umpire code: DEMO24
6. Open /umpire in new tab
7. Enter code: DEMO24
8. Click the match → Complete toss
9. Score: ← (Team 1), → (Team 2), Z (Undo)
10. Watch: Auto-detect deuce, set end, match winner
11. Winner auto-advances to next round
```

### Scenario 4: Role Permission Testing
```
# Test Umpire can't create tournaments
Logout → Login: umpire@cbachennai.in / umpire123
→ Click "Create Tournament" → BLOCKED (403)
→ Go to /umpire → Enter DEMO24 → Works ✅

# Test Staff can approve but not generate brackets
Logout → Login: staff@cbachennai.in / staff123
→ Registrations → Approve pending → Works ✅
→ Generate bracket → BLOCKED (403)
```

### Scenario 5: Team Management
```
Login: admin@cbachennai.in / admin123
→ Click "Team" in navbar
→ Invite: newuser@example.com, Name: Test User, Role: Staff
→ Copy temp password from response
→ See user in list
→ Change role to Umpire
→ Toggle active/inactive
→ Remove user
```

---

## 🔐 UMPIRE PORTAL ACCESS

**Code:** `DEMO24`  
**URL:** `http://localhost:3000/umpire`  
**Works for:** All matches in Summer Championship 2024

**How to use:**
1. Open umpire portal
2. Enter code: DEMO24
3. See all matches across all categories
4. Filter by: All / Live / Pending / Done
5. Click match → Complete toss → Score live

---

## 💾 DATABASE STATS

After seeding:
- **Organizations:** 1
- **Users:** 5
- **Tournaments:** 1
- **Categories:** 5
- **Registrations:** 24 (22 approved, 2 pending)
- **Matches:** 0 (created when bracket is generated)

---

## 🗑️ RESET DATABASE

```bash
mongosh badminton-tournament
db.dropDatabase()
exit

# Re-seed
cd backend
npm run seed
```

---

## 📝 CUSTOMIZATION

Want different dummy data?

Edit `backend/seed.js`:
- Change organization name (line 33)
- Change tournament details (line 166)
- Add/remove categories (line 185)
- Add/remove players (line 338)
- Change umpire code (line 152 → default: DEMO24)

Then re-run: `npm run seed`

---

**All set! Login and test every feature! 🏸**
