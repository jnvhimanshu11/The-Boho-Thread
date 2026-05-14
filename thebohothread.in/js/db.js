/**
 * db.js — Data Layer
 * All CRUD operations for groups, expenses, and invitations.
 * Uses localStorage as the data store.
 * Replace with a real backend (Firebase, Supabase, etc.) in production.
 */

const DB = (() => {

  // ── Storage Keys ─────────────────────────────────────────────────────────
  const GROUPS_KEY   = 'splitease_groups';
  const EXPENSES_KEY = 'splitease_expenses';
  const INVITES_KEY  = 'splitease_invites';
  const SETTLES_KEY  = 'splitease_settlements';

  // ── Generic helpers ───────────────────────────────────────────────────────
  const read = (key) => JSON.parse(localStorage.getItem(key) || '{}');
  const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  const uid = () => '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

  // ═══════════════════════════════════════════════════════════════════
  //  GROUPS
  // ═══════════════════════════════════════════════════════════════════

  function createGroup({ name, description = '', currency = 'INR', category = 'trip', createdBy }) {
    const groups = read(GROUPS_KEY);
    const id = uid();
    groups[id] = {
      id,
      name,
      description,
      currency,
      category,
      createdBy,
      members: [createdBy],   // array of user emails
      createdAt: Date.now(),
    };
    write(GROUPS_KEY, groups);
    return groups[id];
  }

  function getGroup(id) {
    return read(GROUPS_KEY)[id] || null;
  }

  /** Returns all groups where userEmail is a member */
  function getGroupsForUser(userEmail) {
    const groups = read(GROUPS_KEY);
    return Object.values(groups).filter(g => g.members.includes(userEmail));
  }

  function updateGroup(id, updates) {
    const groups = read(GROUPS_KEY);
    if (!groups[id]) return null;
    groups[id] = { ...groups[id], ...updates, updatedAt: Date.now() };
    write(GROUPS_KEY, groups);
    return groups[id];
  }

  function deleteGroup(id) {
    const groups = read(GROUPS_KEY);
    delete groups[id];
    write(GROUPS_KEY, groups);
    // Cascade: delete expenses & settlements
    const expenses = read(EXPENSES_KEY);
    Object.keys(expenses).forEach(eid => {
      if (expenses[eid].groupId === id) delete expenses[eid];
    });
    write(EXPENSES_KEY, expenses);
  }

  function addMemberToGroup(groupId, userEmail) {
    const groups = read(GROUPS_KEY);
    if (!groups[groupId]) return null;
    if (!groups[groupId].members.includes(userEmail)) {
      groups[groupId].members.push(userEmail);
    }
    write(GROUPS_KEY, groups);
    return groups[groupId];
  }

  // ═══════════════════════════════════════════════════════════════════
  //  EXPENSES
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Creates an expense.
   * @param {Object} expense
   * @param {string} expense.groupId
   * @param {string} expense.description
   * @param {number} expense.amount
   * @param {string} expense.paidBy       - email of payer
   * @param {string} expense.category     - food | transport | accommodation | shopping | other
   * @param {'equal'|'percentage'|'custom'} expense.splitType
   * @param {Object} expense.splits       - { email: amount, ... }
   * @param {string} expense.date         - ISO string
   * @param {string} expense.createdBy    - email
   */
  function addExpense({ groupId, description, amount, paidBy, category, splitType, splits, date, createdBy, notes = '' }) {
    const expenses = read(EXPENSES_KEY);
    const id = uid();
    expenses[id] = {
      id, groupId, description, amount, paidBy, category, splitType, splits, notes,
      date: date || new Date().toISOString(),
      createdBy,
      createdAt: Date.now(),
    };
    write(EXPENSES_KEY, expenses);
    return expenses[id];
  }

  function getExpense(id) {
    return read(EXPENSES_KEY)[id] || null;
  }

  /** Returns all expenses for a group, sorted newest first */
  function getExpensesForGroup(groupId) {
    const expenses = read(EXPENSES_KEY);
    return Object.values(expenses)
      .filter(e => e.groupId === groupId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  function updateExpense(id, updates) {
    const expenses = read(EXPENSES_KEY);
    if (!expenses[id]) return null;
    expenses[id] = { ...expenses[id], ...updates, updatedAt: Date.now() };
    write(EXPENSES_KEY, expenses);
    return expenses[id];
  }

  function deleteExpense(id) {
    const expenses = read(EXPENSES_KEY);
    delete expenses[id];
    write(EXPENSES_KEY, expenses);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  SETTLEMENTS
  // ═══════════════════════════════════════════════════════════════════

  function addSettlement({ groupId, paidBy, paidTo, amount, note = '', createdBy }) {
    const settlements = read(SETTLES_KEY);
    const id = uid();
    settlements[id] = {
      id, groupId, paidBy, paidTo, amount, note, createdBy,
      date: new Date().toISOString(),
      createdAt: Date.now(),
    };
    write(SETTLES_KEY, settlements);
    return settlements[id];
  }

  function getSettlementsForGroup(groupId) {
    const settlements = read(SETTLES_KEY);
    return Object.values(settlements)
      .filter(s => s.groupId === groupId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  INVITATIONS
  // ═══════════════════════════════════════════════════════════════════

  function createInvitation({ groupId, invitedEmail, invitedBy, type = 'email' }) {
    const invites = read(INVITES_KEY);
    const id = uid();
    invites[id] = {
      id, groupId, invitedEmail, invitedBy,
      type,                // 'email' | 'inapp'
      status: 'pending',   // pending | accepted | declined
      createdAt: Date.now(),
    };
    write(INVITES_KEY, invites);
    return invites[id];
  }

  function getPendingInvitesForUser(userEmail) {
    const invites = read(INVITES_KEY);
    return Object.values(invites).filter(
      i => i.invitedEmail === userEmail && i.status === 'pending'
    );
  }

  function acceptInvite(inviteId, userEmail) {
    const invites = read(INVITES_KEY);
    const invite = invites[inviteId];
    if (!invite || invite.invitedEmail !== userEmail) return null;
    invite.status = 'accepted';
    invite.acceptedAt = Date.now();
    write(INVITES_KEY, invites);
    addMemberToGroup(invite.groupId, userEmail);
    return invite;
  }

  function declineInvite(inviteId, userEmail) {
    const invites = read(INVITES_KEY);
    const invite = invites[inviteId];
    if (!invite || invite.invitedEmail !== userEmail) return null;
    invite.status = 'declined';
    write(INVITES_KEY, invites);
    return invite;
  }

  function hasInvite(groupId, email) {
    const invites = read(INVITES_KEY);
    return Object.values(invites).some(
      i => i.groupId === groupId && i.invitedEmail === email
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  //  BALANCE CALCULATIONS  (Splitwise Algorithm)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Calculates net balances for all members in a group.
   * Returns: { email: netAmount }
   * Positive = owed money, Negative = owes money
   */
  function calcBalances(groupId) {
    const expenses  = getExpensesForGroup(groupId);
    const settlements = getSettlementsForGroup(groupId);
    const group     = getGroup(groupId);
    if (!group) return {};

    const balances = {};
    group.members.forEach(m => (balances[m] = 0));

    // Process expenses
    expenses.forEach(exp => {
      // Payer gets credit
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;

      // Each share is a debit
      Object.entries(exp.splits || {}).forEach(([email, share]) => {
        balances[email] = (balances[email] || 0) - share;
      });
    });

    // Process settlements
    settlements.forEach(s => {
      balances[s.paidBy]  = (balances[s.paidBy]  || 0) + s.amount;
      balances[s.paidTo]  = (balances[s.paidTo]  || 0) - s.amount;
    });

    return balances;
  }

  /**
   * Splitwise "minimum transactions" algorithm.
   * Returns array of { from, to, amount } — transactions needed to settle up.
   */
  function calcSettlements(groupId) {
    const balances = calcBalances(groupId);
    const creditors = [];
    const debtors   = [];

    Object.entries(balances).forEach(([email, amount]) => {
      const rounded = Math.round(amount * 100) / 100;
      if (rounded > 0)  creditors.push({ email, amount: rounded });
      else if (rounded < 0) debtors.push({ email, amount: -rounded });
    });

    // Greedy matching
    const txns = [];
    let ci = 0, di = 0;
    while (ci < creditors.length && di < debtors.length) {
      const credit = creditors[ci];
      const debt   = debtors[di];
      const pay    = Math.min(credit.amount, debt.amount);

      txns.push({
        from:   debt.email,
        to:     credit.email,
        amount: Math.round(pay * 100) / 100,
      });

      credit.amount -= pay;
      debt.amount   -= pay;

      if (credit.amount < 0.01) ci++;
      if (debt.amount   < 0.01) di++;
    }

    return txns;
  }

  /**
   * Per-member spending summary
   */
  function calcMemberStats(groupId, userEmail) {
    const expenses = getExpensesForGroup(groupId);
    let totalPaid = 0;
    let totalOwed = 0;

    expenses.forEach(exp => {
      if (exp.paidBy === userEmail) totalPaid += exp.amount;
      totalOwed += exp.splits?.[userEmail] || 0;
    });

    return { totalPaid, totalOwed, net: totalPaid - totalOwed };
  }

  /**
   * Category breakdown for a group
   */
  function calcCategoryBreakdown(groupId) {
    const expenses = getExpensesForGroup(groupId);
    const cats = {};
    expenses.forEach(exp => {
      cats[exp.category] = (cats[exp.category] || 0) + exp.amount;
    });
    return cats;
  }

  /**
   * Total group spend
   */
  function calcGroupTotal(groupId) {
    return getExpensesForGroup(groupId).reduce((s, e) => s + e.amount, 0);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    // Groups
    createGroup, getGroup, getGroupsForUser, updateGroup, deleteGroup, addMemberToGroup,
    // Expenses
    addExpense, getExpense, getExpensesForGroup, updateExpense, deleteExpense,
    // Settlements
    addSettlement, getSettlementsForGroup,
    // Invites
    createInvitation, getPendingInvitesForUser, acceptInvite, declineInvite, hasInvite,
    // Calculations
    calcBalances, calcSettlements, calcMemberStats, calcCategoryBreakdown, calcGroupTotal,
    // Helpers
    uid,
  };
})();

window.DB = DB;
