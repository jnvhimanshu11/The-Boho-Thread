// ============================================================
// db.js — Firestore-based data layer
//
// SETUP REQUIRED before this file works:
// 1. Add these scripts to EVERY html file <head> BEFORE db.js:
//
//    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
//    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
//    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
//    <script>
//      const firebaseConfig = {
//        apiKey:            "YOUR_API_KEY",
//        authDomain:        "YOUR_PROJECT.firebaseapp.com",
//        projectId:         "YOUR_PROJECT_ID",
//        storageBucket:     "YOUR_PROJECT.appspot.com",
//        messagingSenderId: "YOUR_SENDER_ID",
//        appId:             "YOUR_APP_ID"
//      };
//      firebase.initializeApp(firebaseConfig);
//    </script>
//
// 2. In Firebase Console → Firestore Database → Rules, set:
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /{document=**} {
//          allow read, write: if request.auth != null;
//        }
//      }
//    }
//
// FIRESTORE COLLECTIONS USED:
//   /users/{userId}          — user profiles
//   /groups/{groupId}        — groups
//   /expenses/{expenseId}    — expenses
//   /settlements/{id}        — settlements
//   /invitations/{token}     — invite tokens
// ============================================================

// ── Get Firestore instance (available after firebase.initializeApp)
// OLD: const KEY = 'splitmate_db';
// NEW: we use Firestore directly — no single blob of data
const _fs = () => firebase.firestore();

// ── Helper: generate a random local ID (still used as doc ID)
// UNCHANGED from original
function _id() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ── Helper: random avatar colour
// UNCHANGED from original
function _randomColor() {
  const colors = ['#6c63ff','#22c55e','#f97316','#ef4444','#3b82f6','#a855f7','#14b8a6','#f59e0b','#ec4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ============================================================
// IMPORTANT NOTE ON ASYNC
// ============================================================
// localStorage was synchronous  → result = _load()
// Firestore is  asynchronous    → result = await collection.get()
//
// Every function below is now async and returns a Promise.
// Callers must use:   const user = await DB.users.findById(id);
//
// In your HTML pages, wrap calls in async functions:
//   async function init() {
//     const user = await DB.users.findByEmail(email);
//   }
// ============================================================

const DB = {

  // ==========================================================
  // USERS
  // Firestore collection: /users/{userId}
  // ==========================================================
  users: {

    // ── CREATE USER
    // OLD: db.users[id] = user;  _save(db);
    // NEW: _fs().collection('users').doc(id).set(user)
    async create(email, name, password, avatarColor) {
      const existing = await this.findByEmail(email);
      if (existing) return null; // email already taken

      const id = _id();
      const user = {
        id,
        email,
        name,
        password,                              // ⚠️ store hashed in production!
        avatarColor: avatarColor || _randomColor(),
        createdAt: Date.now(),
        groups: []
      };
      // OLD: db.users[id] = user;  _save(db);
      await _fs().collection('users').doc(id).set(user);
      return user;
    },

    // ── FIND BY EMAIL
    // OLD: Object.values(db.users).find(u => u.email === email)
    // NEW: query Firestore where email == email
    async findByEmail(email) {
      const snap = await _fs().collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();
      if (snap.empty) return null;
      return snap.docs[0].data();
    },

    // ── FIND BY ID
    // OLD: return db.users[id] || null;
    // NEW: _fs().collection('users').doc(id).get()
    async findById(id) {
      if (!id) return null;
      const doc = await _fs().collection('users').doc(id).get();
      return doc.exists ? doc.data() : null;
    },

    // ── UPDATE USER
    // OLD: db.users[id] = { ...db.users[id], ...data };  _save(db);
    // NEW: _fs().collection('users').doc(id).update(data)
    async update(id, data) {
      await _fs().collection('users').doc(id).update(data);
      return this.findById(id);
    },

    // ── AUTHENTICATE (email + password login)
    // Logic unchanged — just calls async findByEmail now
    async authenticate(email, password) {
      const user = await this.findByEmail(email);
      if (!user) return null;
      if (user.password !== password) return null;
      return user;
    }
  },

  // ==========================================================
  // GROUPS
  // Firestore collection: /groups/{groupId}
  // ==========================================================
  groups: {

    // ── CREATE GROUP
    // OLD: db.groups[id] = group;  _save(db);
    // NEW: _fs().collection('groups').doc(id).set(group)
    async create(name, description, category, createdBy) {
      const id = _id();
      const group = {
        id, name, description, category,
        createdBy,
        members: [createdBy],
        createdAt: Date.now(),
        currency: '₹',
        isActive: true
      };
      // OLD: db.groups[id] = group;  _save(db);
      await _fs().collection('groups').doc(id).set(group);

      // Also update the user's groups array
      // OLD: db.users[createdBy].groups = [...groups, id];  _save(db);
      await _fs().collection('users').doc(createdBy).update({
        groups: firebase.firestore.FieldValue.arrayUnion(id)
      });

      return group;
    },

    // ── FIND BY ID
    // OLD: return db.groups[id] || null;
    // NEW: _fs().collection('groups').doc(id).get()
    async findById(id) {
      if (!id) return null;
      const doc = await _fs().collection('groups').doc(id).get();
      return doc.exists ? doc.data() : null;
    },

    // ── GET ALL GROUPS FOR A USER
    // OLD: Object.values(db.groups).filter(g => g.members.includes(userId))
    // NEW: query where members array contains userId
    async forUser(userId) {
      const snap = await _fs().collection('groups')
        .where('members', 'array-contains', userId)
        .get();
      return snap.docs.map(d => d.data());
    },

    // ── ADD MEMBER TO GROUP
    // OLD: db.groups[groupId].members.push(userId);  _save(db);
    // NEW: FieldValue.arrayUnion adds to array atomically (no duplicates)
    async addMember(groupId, userId) {
      // Add userId to group.members array
      // OLD: db.groups[groupId].members.push(userId);
      await _fs().collection('groups').doc(groupId).update({
        members: firebase.firestore.FieldValue.arrayUnion(userId)
      });
      // Add groupId to user.groups array
      // OLD: db.users[userId].groups = [...groups, groupId];
      await _fs().collection('users').doc(userId).update({
        groups: firebase.firestore.FieldValue.arrayUnion(groupId)
      });
      return true;
    },

    // ── UPDATE GROUP
    // OLD: db.groups[id] = { ...db.groups[id], ...data };  _save(db);
    // NEW: _fs().collection('groups').doc(id).update(data)
    async update(id, data) {
      await _fs().collection('groups').doc(id).update(data);
      return this.findById(id);
    },

    // ── DELETE GROUP
    // OLD: delete db.groups[id];  _save(db);
    // NEW: doc.delete() + batch remove from all members' user.groups arrays
    async delete(id) {
      const group = await this.findById(id);
      if (!group) return false;

      // Remove group from every member's user.groups array
      // OLD: group.members.forEach(uid => { db.users[uid].groups = ...filter... })
      const batch = _fs().batch();
      group.members.forEach(uid => {
        const userRef = _fs().collection('users').doc(uid);
        batch.update(userRef, {
          groups: firebase.firestore.FieldValue.arrayRemove(id)
        });
      });
      // Delete the group document
      batch.delete(_fs().collection('groups').doc(id));
      await batch.commit();
      return true;
    }
  },

  // ==========================================================
  // EXPENSES
  // Firestore collection: /expenses/{expenseId}
  // ==========================================================
  expenses: {

    // ── CREATE EXPENSE
    // OLD: db.expenses[id] = expense;  _save(db);
    // NEW: _fs().collection('expenses').doc(id).set(expense)
    async create({ groupId, description, amount, category, paidBy, splits, date, notes }) {
      const id = _id();
      const expense = {
        id, groupId, description,
        amount: parseFloat(amount),
        category: category || 'general',
        paidBy, splits,
        date: date || Date.now(),
        notes: notes || '',
        createdAt: Date.now(),
        isSettlement: false
      };
      // OLD: db.expenses[id] = expense;  _save(db);
      await _fs().collection('expenses').doc(id).set(expense);
      return expense;
    },

    // ── GET ALL EXPENSES FOR A GROUP
    // OLD: Object.values(db.expenses).filter(e => e.groupId === groupId)
    // NEW: query where groupId == groupId, ordered by date desc
    async forGroup(groupId) {
      const snap = await _fs().collection('expenses')
        .where('groupId', '==', groupId)
        .orderBy('date', 'desc')
        .get();
      return snap.docs.map(d => d.data());
    },

    // ── GET ALL EXPENSES INVOLVING A USER
    // OLD: Object.values(db.expenses).filter(e => e.paidBy === userId || splits...)
    // NEW: two queries (Firestore can't OR across different fields in one query)
    async forUser(userId) {
      // Query 1: expenses where user is the payer
      const paidSnap = await _fs().collection('expenses')
        .where('paidBy', '==', userId)
        .get();
      const paid = paidSnap.docs.map(d => d.data());

      // Query 2: expenses where user appears in splits
      // Firestore can't query inside arrays of objects, so we use a helper field
      // We store a 'splitUserIds' array on each expense (see create() above)
      // For now we fetch all expenses in user's groups and filter client-side
      const user = await DB.users.findById(userId);
      if (!user || !user.groups || !user.groups.length) return paid;

      const allGroupExp = [];
      for (const gid of user.groups) {
        const exps = await this.forGroup(gid);
        allGroupExp.push(...exps);
      }

      // Merge, deduplicate, and filter
      const seen = new Set(paid.map(e => e.id));
      allGroupExp.forEach(e => {
        if (!seen.has(e.id) && e.splits && e.splits.some(s => s.userId === userId)) {
          paid.push(e);
          seen.add(e.id);
        }
      });

      return paid.sort((a, b) => b.date - a.date);
    },

    // ── FIND BY ID
    // OLD: return db.expenses[id] || null;
    // NEW: _fs().collection('expenses').doc(id).get()
    async findById(id) {
      const doc = await _fs().collection('expenses').doc(id).get();
      return doc.exists ? doc.data() : null;
    },

    // ── DELETE EXPENSE
    // OLD: delete db.expenses[id];  _save(db);
    // NEW: _fs().collection('expenses').doc(id).delete()
    async delete(id) {
      await _fs().collection('expenses').doc(id).delete();
      return true;
    },

    // ── UPDATE EXPENSE
    // OLD: db.expenses[id] = { ...db.expenses[id], ...data };  _save(db);
    // NEW: _fs().collection('expenses').doc(id).update(data)
    async update(id, data) {
      await _fs().collection('expenses').doc(id).update(data);
      return this.findById(id);
    }
  },

  // ==========================================================
  // SETTLEMENTS
  // Firestore collection: /settlements/{id}
  // ==========================================================
  settlements: {

    // ── CREATE SETTLEMENT
    // OLD: db.settlements[id] = s;  db.expenses[id] = {...};  _save(db);
    // NEW: write to both /settlements and /expenses collections
    async create({ groupId, from, to, amount }) {
      const id = _id();
      const s = {
        id, groupId, from, to,
        amount: parseFloat(amount),
        date: Date.now(),
        isSettlement: true
      };
      // Write settlement record
      // OLD: db.settlements[id] = s;
      await _fs().collection('settlements').doc(id).set(s);

      // Also write to expenses so it shows in history
      // OLD: db.expenses[id] = { description: 'Settlement payment', ... }
      await _fs().collection('expenses').doc(id).set({
        id, groupId,
        description: 'Settlement payment',
        amount: parseFloat(amount),
        category: 'settlement',
        paidBy: from,
        splits: [{ userId: to, amount: parseFloat(amount) }],
        date: Date.now(),
        isSettlement: true
      });

      return s;
    },

    // ── GET SETTLEMENTS FOR GROUP
    // OLD: Object.values(db.settlements).filter(s => s.groupId === groupId)
    // NEW: query where groupId == groupId
    async forGroup(groupId) {
      const snap = await _fs().collection('settlements')
        .where('groupId', '==', groupId)
        .get();
      return snap.docs.map(d => d.data());
    }
  },

  // ==========================================================
  // INVITATIONS
  // Firestore collection: /invitations/{token}
  // ==========================================================
  invitations: {

    // ── CREATE INVITATION
    // OLD: db.invitations[token] = inv;  _save(db);
    // NEW: _fs().collection('invitations').doc(token).set(inv)
    async create(groupId, invitedBy, email) {
      const token = _id() + _id();
      const inv = {
        token, groupId, invitedBy,
        email: email || '',
        status: 'pending',
        createdAt: Date.now()
      };
      // OLD: db.invitations[token] = inv;  _save(db);
      await _fs().collection('invitations').doc(token).set(inv);
      return inv;
    },

    // ── FIND BY TOKEN
    // OLD: return db.invitations[token] || null;
    // NEW: _fs().collection('invitations').doc(token).get()
    async findByToken(token) {
      const doc = await _fs().collection('invitations').doc(token).get();
      return doc.exists ? doc.data() : null;
    },

    // ── ACCEPT INVITATION
    // OLD: inv.status = 'accepted';  _save(db);  groups.addMember(...)
    // NEW: update doc + call groups.addMember
    async accept(token, userId) {
      const inv = await this.findByToken(token);
      if (!inv || inv.status !== 'pending') return null;

      // OLD: inv.status = 'accepted';  db.invitations[token] = inv;  _save(db);
      await _fs().collection('invitations').doc(token).update({
        status: 'accepted',
        acceptedBy: userId,
        acceptedAt: Date.now()
      });

      // Add user to group (calls groups.addMember above)
      await DB.groups.addMember(inv.groupId, userId);
      return { ...inv, status: 'accepted', acceptedBy: userId };
    },

    // ── GET INVITATIONS FOR GROUP
    // OLD: Object.values(db.invitations).filter(i => i.groupId === groupId)
    // NEW: query where groupId == groupId
    async forGroup(groupId) {
      const snap = await _fs().collection('invitations')
        .where('groupId', '==', groupId)
        .get();
      return snap.docs.map(d => d.data());
    }
  },

  // ==========================================================
  // CALCULATIONS — Splitwise Algorithm
  // These functions do math only — no storage calls changed.
  // They now call async expense/group functions, so they are async too.
  // ==========================================================
  calc: {

    // ── GET BALANCES PER USER IN A GROUP
    // Logic unchanged. Just needs await for expenses.forGroup()
    async getBalances(groupId) {
      const allExpenses = await DB.expenses.forGroup(groupId);
      const balances = {};

      allExpenses.forEach(exp => {
        if (!balances[exp.paidBy]) balances[exp.paidBy] = 0;
        balances[exp.paidBy] += exp.amount;
        if (exp.splits) {
          exp.splits.forEach(s => {
            if (!balances[s.userId]) balances[s.userId] = 0;
            balances[s.userId] -= s.amount;
          });
        }
      });

      return balances;
    },

    // ── GREEDY DEBT SIMPLIFICATION (same as Splitwise)
    // Logic completely unchanged — just needs await
    async simplifyDebts(groupId) {
      const balances = await this.getBalances(groupId);
      const creditors = [];
      const debtors = [];

      Object.entries(balances).forEach(([uid, amt]) => {
        const rounded = Math.round(amt * 100) / 100;
        if (rounded > 0.01) creditors.push({ uid, amount: rounded });
        else if (rounded < -0.01) debtors.push({ uid, amount: Math.abs(rounded) });
      });

      creditors.sort((a, b) => b.amount - a.amount);
      debtors.sort((a, b) => b.amount - a.amount);

      const transactions = [];
      let i = 0, j = 0;
      while (i < creditors.length && j < debtors.length) {
        const pay = Math.min(creditors[i].amount, debtors[j].amount);
        transactions.push({
          from: debtors[j].uid,
          to: creditors[i].uid,
          amount: Math.round(pay * 100) / 100
        });
        creditors[i].amount -= pay;
        debtors[j].amount -= pay;
        if (creditors[i].amount < 0.01) i++;
        if (debtors[j].amount < 0.01) j++;
      }

      return transactions;
    },

    // ── USER NET BALANCE IN A GROUP
    async userBalanceInGroup(groupId, userId) {
      const balances = await this.getBalances(groupId);
      return balances[userId] || 0;
    },

    // ── TOTAL SPENT BY USER
    async totalSpentByUser(userId) {
      const user = await DB.users.findById(userId);
      if (!user || !user.groups) return 0;
      let total = 0;
      for (const gid of user.groups) {
        const exps = await DB.expenses.forGroup(gid);
        exps.filter(e => e.paidBy === userId && !e.isSettlement)
            .forEach(e => { total += e.amount; });
      }
      return total;
    },

    // ── SPLIT EVENLY — pure math, no storage. UNCHANGED.
    splitEvenly(amount, userIds) {
      const share = Math.round((amount / userIds.length) * 100) / 100;
      const splits = userIds.map(uid => ({ userId: uid, amount: share }));
      const total = splits.reduce((s, x) => s + x.amount, 0);
      const diff = Math.round((amount - total) * 100) / 100;
      if (diff !== 0) splits[splits.length - 1].amount += diff;
      return splits;
    },

    // ── SPLIT BY PERCENT — pure math, no storage. UNCHANGED.
    splitByPercent(amount, userPercents) {
      return userPercents.map(({ userId, percent }) => ({
        userId,
        amount: Math.round(amount * (percent / 100) * 100) / 100
      }));
    },

    // ── GROUP STATS
    async groupStats(groupId) {
      const allExpenses = (await DB.expenses.forGroup(groupId)).filter(e => !e.isSettlement);
      const total = allExpenses.reduce((s, e) => s + e.amount, 0);
      const byCategory = {};
      allExpenses.forEach(e => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      });
      return { total, count: allExpenses.length, byCategory };
    }
  }
};


// ============================================================
// CATEGORY METADATA — completely unchanged
// ============================================================
const CATEGORIES = {
  food:          { label: 'Food & Drinks',   icon: '🍽️', color: '#f97316' },
  transport:     { label: 'Transport',        icon: '🚗', color: '#3b82f6' },
  accommodation: { label: 'Accommodation',    icon: '🏨', color: '#a855f7' },
  entertainment: { label: 'Entertainment',    icon: '🎬', color: '#ec4899' },
  shopping:      { label: 'Shopping',         icon: '🛍️', color: '#14b8a6' },
  groceries:     { label: 'Groceries',        icon: '🛒', color: '#22c55e' },
  utilities:     { label: 'Utilities',        icon: '💡', color: '#eab308' },
  medical:       { label: 'Medical',          icon: '🏥', color: '#ef4444' },
  settlement:    { label: 'Settlement',       icon: '✅', color: '#22c55e' },
  general:       { label: 'General',          icon: '📌', color: '#6c63ff' },
};

const GROUP_CATEGORIES = {
  trip:   { label: 'Trip',    icon: '✈️' },
  home:   { label: 'Home',    icon: '🏠' },
  couple: { label: 'Couple',  icon: '💑' },
  friends:{ label: 'Friends', icon: '👫' },
  work:   { label: 'Work',    icon: '💼' },
  other:  { label: 'Other',   icon: '📦' },
};


// ============================================================
// HOW TO UPDATE YOUR HTML PAGES FOR ASYNC
// ============================================================
// Every page that calls DB.* must now use await inside an async function.
//
// BEFORE (localStorage — synchronous):
//   function init() {
//     const groups = DB.groups.forUser(user.id);
//     renderGroups(groups);
//   }
//
// AFTER (Firestore — asynchronous):
//   async function init() {
//     const groups = await DB.groups.forUser(user.id);
//     renderGroups(groups);
//   }
//
// PAGES TO UPDATE:
//   dashboard.html  → renderStats(), renderGroups(), renderActivity()
//   group.html      → renderHero(), renderExpenses(), renderBalances(), renderSettle(), renderMembers()
//   add-expense.html→ populateGroupSelect(), onGroupChange(), saveExpense()
//   expenses.html   → loadExpenses(), renderStats(), renderCharts()
//   profile.html    → renderHero(), renderStats(), renderGroups()
//   invite.html     → render(), joinGroup(), loginAndJoin(), etc.
//   auth.js         → login(), register() calls DB.users.authenticate / findByEmail
// ============================================================
