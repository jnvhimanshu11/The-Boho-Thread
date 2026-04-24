// ============================================================
// db.js — LocalStorage-based data layer (simulates a backend)
// In production, replace these with real API calls
// ============================================================

const DB = (() => {
  const KEY = 'splitmate_db';

  function _load() {
    try { return db.collection('users').doc(userId).get() || _defaultState(); }
    catch { return _defaultState(); }
  }

  function _save(state) {
    db.collection('users').doc(userId).set(userData);
  }

  function _defaultState() {
    return { users: {}, groups: {}, expenses: {}, invitations: {}, settlements: {} };
  }

  function _id() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  // ---- USERS ----
  const users = {
    create(email, name, password, avatarColor) {
      const db = firebase.firestore();
      if (Object.values(db.users).find(u => u.email === email)) return null;
      const id = _id();
      const user = { id, email, name, password, avatarColor: avatarColor || _randomColor(), createdAt: Date.now(), groups: [] };
      db.users[id] = user;
      _save(db);
      return user;
    },
    findByEmail(email) {
      const db = firebase.firestore();
      return Object.values(db.users).find(u => u.email === email) || null;
    },
    findById(id) {
      const db = firebase.firestore();
      return db.users[id] || null;
    },
    update(id, data) {
      const db = firebase.firestore();
      if (!db.users[id]) return null;
      db.users[id] = { ...db.users[id], ...data };
      _save(db);
      return db.users[id];
    },
    authenticate(email, password) {
      const user = this.findByEmail(email);
      if (!user) return null;
      if (user.password !== password) return null;
      return user;
    }
  };

  // ---- GROUPS ----
  const groups = {
    create(name, description, category, createdBy) {
      const db = firebase.firestore();
      const id = _id();
      const group = {
        id, name, description, category,
        createdBy, members: [createdBy],
        createdAt: Date.now(), currency: '₹', isActive: true
      };
      db.groups[id] = group;
      // add group to user's list
      if (db.users[createdBy]) {
        db.users[createdBy].groups = [...(db.users[createdBy].groups || []), id];
      }
      _save(db);
      return group;
    },
    findById(id) {
      const db = firebase.firestore();
      return db.groups[id] || null;
    },
    forUser(userId) {
      const db = firebase.firestore();
      return Object.values(db.groups).filter(g => g.members.includes(userId));
    },
    addMember(groupId, userId) {
      const db = firebase.firestore();
      if (!db.groups[groupId]) return false;
      if (db.groups[groupId].members.includes(userId)) return true;
      db.groups[groupId].members.push(userId);
      if (db.users[userId]) {
        db.users[userId].groups = [...(db.users[userId].groups || []), groupId];
      }
      _save(db);
      return true;
    },
    update(id, data) {
      const db = firebase.firestore();
      if (!db.groups[id]) return null;
      db.groups[id] = { ...db.groups[id], ...data };
      _save(db);
      return db.groups[id];
    },
    delete(id) {
      const db = firebase.firestore();
      if (!db.groups[id]) return false;
      const group = db.groups[id];
      group.members.forEach(uid => {
        if (db.users[uid]) {
          db.users[uid].groups = (db.users[uid].groups || []).filter(g => g !== id);
        }
      });
      delete db.groups[id];
      _save(db);
      return true;
    }
  };

  // ---- EXPENSES ----
  const expenses = {
    create({ groupId, description, amount, category, paidBy, splits, date, notes }) {
      const db = firebase.firestore();
      const id = _id();
      const expense = {
        id, groupId, description, amount: parseFloat(amount),
        category: category || 'general', paidBy, splits, date: date || Date.now(),
        notes: notes || '', createdAt: Date.now(), isSettlement: false
      };
      db.expenses[id] = expense;
      _save(db);
      return expense;
    },
    forGroup(groupId) {
      const db = firebase.firestore();
      return Object.values(db.expenses).filter(e => e.groupId === groupId).sort((a, b) => b.date - a.date);
    },
    forUser(userId) {
      const db = firebase.firestore();
      return Object.values(db.expenses).filter(e =>
        e.paidBy === userId || (e.splits && e.splits.some(s => s.userId === userId))
      ).sort((a, b) => b.date - a.date);
    },
    findById(id) {
      const db = firebase.firestore();
      return db.expenses[id] || null;
    },
    delete(id) {
      const db = firebase.firestore();
      if (!db.expenses[id]) return false;
      delete db.expenses[id];
      _save(db);
      return true;
    },
    update(id, data) {
      const db = firebase.firestore();
      if (!db.expenses[id]) return null;
      db.expenses[id] = { ...db.expenses[id], ...data };
      _save(db);
      return db.expenses[id];
    }
  };

  // ---- SETTLEMENTS ----
  const settlements = {
    create({ groupId, from, to, amount }) {
      const db = firebase.firestore();
      const id = _id();
      const s = { id, groupId, from, to, amount: parseFloat(amount), date: Date.now(), isSettlement: true };
      db.settlements[id] = s;
      // also log as an expense for history
      db.expenses[id] = {
        id, groupId, description: 'Settlement payment',
        amount: parseFloat(amount), category: 'settlement',
        paidBy: from, splits: [{ userId: to, amount: parseFloat(amount) }],
        date: Date.now(), isSettlement: true
      };
      _save(db);
      return s;
    },
    forGroup(groupId) {
      const db = firebase.firestore();
      return Object.values(db.settlements).filter(s => s.groupId === groupId);
    }
  };

  // ---- INVITATIONS ----
  const invitations = {
    create(groupId, invitedBy, email) {
      const db = firebase.firestore();
      const token = _id() + _id();
      const inv = { token, groupId, invitedBy, email, status: 'pending', createdAt: Date.now() };
      db.invitations[token] = inv;
      _save(db);
      return inv;
    },
    findByToken(token) {
      const db = firebase.firestore();
      return db.invitations[token] || null;
    },
    accept(token, userId) {
      const db = firebase.firestore();
      const inv = db.invitations[token];
      if (!inv || inv.status !== 'pending') return null;
      inv.status = 'accepted';
      inv.acceptedBy = userId;
      inv.acceptedAt = Date.now();
      db.invitations[token] = inv;
      _save(db);
      // add to group
      groups.addMember(inv.groupId, userId);
      return inv;
    },
    forGroup(groupId) {
      const db = firebase.firestore();
      return Object.values(db.invitations).filter(i => i.groupId === groupId);
    }
  };

  // ---- CALCULATIONS (Splitwise Algorithm) ----
  const calc = {
    // Returns net balance per user in a group { userId: amount }
    // Positive = owed to you, Negative = you owe others
    getBalances(groupId) {
      const allExpenses = expenses.forGroup(groupId);
      const balances = {};

      allExpenses.forEach(exp => {
        // Person who paid gets credited
        if (!balances[exp.paidBy]) balances[exp.paidBy] = 0;
        balances[exp.paidBy] += exp.amount;
        // Each person in the split gets debited their share
        if (exp.splits) {
          exp.splits.forEach(s => {
            if (!balances[s.userId]) balances[s.userId] = 0;
            balances[s.userId] -= s.amount;
          });
        }
      });

      return balances;
    },

    // Simplify debts: returns minimal transactions to settle up
    // Uses the "greedy debt simplification" algorithm (same as Splitwise)
    simplifyDebts(groupId) {
      const balances = this.getBalances(groupId);
      const creditors = []; // owe money TO them (positive)
      const debtors = [];   // owe money (negative)

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
        transactions.push({ from: debtors[j].uid, to: creditors[i].uid, amount: Math.round(pay * 100) / 100 });
        creditors[i].amount -= pay;
        debtors[j].amount -= pay;
        if (creditors[i].amount < 0.01) i++;
        if (debtors[j].amount < 0.01) j++;
      }

      return transactions;
    },

    // Get what currentUser owes or is owed in a group
    userBalanceInGroup(groupId, userId) {
      const balances = this.getBalances(groupId);
      return balances[userId] || 0;
    },

    // Total spent by user across all groups
    totalSpentByUser(userId) {
      const db = firebase.firestore();
      return Object.values(db.expenses)
        .filter(e => e.paidBy === userId && !e.isSettlement)
        .reduce((sum, e) => sum + e.amount, 0);
    },

    // Calculate split evenly
    splitEvenly(amount, userIds) {
      const share = Math.round((amount / userIds.length) * 100) / 100;
      const splits = userIds.map((uid, i) => ({ userId: uid, amount: share }));
      // handle rounding: adjust last person
      const total = splits.reduce((s, x) => s + x.amount, 0);
      const diff = Math.round((amount - total) * 100) / 100;
      if (diff !== 0) splits[splits.length - 1].amount += diff;
      return splits;
    },

    // Calculate split by percentage
    splitByPercent(amount, userPercents) {
      return userPercents.map(({ userId, percent }) => ({
        userId, amount: Math.round(amount * (percent / 100) * 100) / 100
      }));
    },

    // Group summary stats
    groupStats(groupId) {
      const allExpenses = expenses.forGroup(groupId).filter(e => !e.isSettlement);
      const total = allExpenses.reduce((s, e) => s + e.amount, 0);
      const byCategory = {};
      allExpenses.forEach(e => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      });
      return { total, count: allExpenses.length, byCategory };
    }
  };

  function _randomColor() {
    const colors = ['#6c63ff','#22c55e','#f97316','#ef4444','#3b82f6','#a855f7','#14b8a6','#f59e0b','#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return { users, groups, expenses, settlements, invitations, calc };
})();

// ---- CATEGORY METADATA ----
const CATEGORIES = {
  food: { label: 'Food & Drinks', icon: '🍽️', color: '#f97316' },
  transport: { label: 'Transport', icon: '🚗', color: '#3b82f6' },
  accommodation: { label: 'Accommodation', icon: '🏨', color: '#a855f7' },
  entertainment: { label: 'Entertainment', icon: '🎬', color: '#ec4899' },
  shopping: { label: 'Shopping', icon: '🛍️', color: '#14b8a6' },
  groceries: { label: 'Groceries', icon: '🛒', color: '#22c55e' },
  utilities: { label: 'Utilities', icon: '💡', color: '#eab308' },
  medical: { label: 'Medical', icon: '🏥', color: '#ef4444' },
  settlement: { label: 'Settlement', icon: '✅', color: '#22c55e' },
  general: { label: 'General', icon: '📌', color: '#6c63ff' },
};

const GROUP_CATEGORIES = {
  trip: { label: 'Trip', icon: '✈️' },
  home: { label: 'Home', icon: '🏠' },
  couple: { label: 'Couple', icon: '💑' },
  friends: { label: 'Friends', icon: '👫' },
  work: { label: 'Work', icon: '💼' },
  other: { label: 'Other', icon: '📦' },
};
