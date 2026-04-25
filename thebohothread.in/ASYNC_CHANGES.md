# ============================================================
# ASYNC CHANGES NEEDED IN HTML PAGES
# After switching to db.firestore.js, every DB.* call needs
# to be inside an  async function  and have  await  in front.
# ============================================================
# This file shows EXACT find-and-replace for every page.
# ============================================================


# ════════════════════════════════════════════════════════════
# FILE: dashboard.html
# ════════════════════════════════════════════════════════════

# ── Change 1: init() must be async
FIND:
  function init() {

REPLACE:
  async function init() {

# ── Change 2: renderStats
FIND:
  function renderStats() {
    const groups = DB.groups.forUser(user.id);

REPLACE:
  async function renderStats() {
    const groups = await DB.groups.forUser(user.id);

# ── Change 3: inside renderStats — userBalanceInGroup and groupStats
FIND:
    groups.forEach(g => {
      const bal = DB.calc.userBalanceInGroup(g.id, user.id);

# This one is inside a loop — use Promise.all instead:
REPLACE:
    const results = await Promise.all(groups.map(async g => ({
      bal: await DB.calc.userBalanceInGroup(g.id, user.id),
      stats: await DB.calc.groupStats(g.id)
    })));
    results.forEach(({ bal, stats }) => {

# ── Change 4: renderGroups
FIND:
  function renderGroups() {
    const groups = DB.groups.forUser(user.id);

REPLACE:
  async function renderGroups() {
    const groups = await DB.groups.forUser(user.id);

# Inside renderGroups loop — wrap per-group calls:
FIND:
    groups.forEach(g => {
      const bal = DB.calc.userBalanceInGroup(g.id, user.id);
      const stats = DB.calc.groupStats(g.id);

REPLACE:
    const groupData = await Promise.all(groups.map(async g => ({
      group: g,
      bal: await DB.calc.userBalanceInGroup(g.id, user.id),
      stats: await DB.calc.groupStats(g.id)
    })));
    groupData.forEach(({ group: g, bal, stats }) => {

# ── Change 5: renderActivity
FIND:
  function renderActivity() {

REPLACE:
  async function renderActivity() {

# ── Change 6: createGroup
FIND:
  function createGroup() {
    ...
    DB.groups.create(name, desc, cat, user.id);

REPLACE:
  async function createGroup() {
    ...
    await DB.groups.create(name, desc, cat, user.id);


# ════════════════════════════════════════════════════════════
# FILE: group.html
# ════════════════════════════════════════════════════════════

# ── Change 1: init
FIND:
  function init() {
    ...
    group = DB.groups.findById(groupId);

REPLACE:
  async function init() {
    ...
    group = await DB.groups.findById(groupId);

# ── Change 2: renderHero
FIND:
  function renderHero() {
    const stats = DB.calc.groupStats(groupId);
    const myBal = DB.calc.userBalanceInGroup(groupId, user.id);

REPLACE:
  async function renderHero() {
    const stats = await DB.calc.groupStats(groupId);
    const myBal = await DB.calc.userBalanceInGroup(groupId, user.id);

# ── Change 3: renderExpenses
FIND:
  function renderExpenses() {
    const expenses = DB.expenses.forGroup(groupId);

REPLACE:
  async function renderExpenses() {
    const expenses = await DB.expenses.forGroup(groupId);

# Inside renderExpenses, payer lookup:
FIND:
      const payer = DB.users.findById(e.paidBy);

REPLACE:
      const payer = await DB.users.findById(e.paidBy);

# ── Change 4: deleteExpense
FIND:
  function deleteExpense(id, event) {
    ...
    DB.expenses.delete(id);

REPLACE:
  async function deleteExpense(id, event) {
    ...
    await DB.expenses.delete(id);

# ── Change 5: renderBalances
FIND:
  function renderBalances() {
    const balances = DB.calc.getBalances(groupId);

REPLACE:
  async function renderBalances() {
    const balances = await DB.calc.getBalances(groupId);

# ── Change 6: renderSettle
FIND:
  function renderSettle() {
    const txns = DB.calc.simplifyDebts(groupId);

REPLACE:
  async function renderSettle() {
    const txns = await DB.calc.simplifyDebts(groupId);

# Inside confirmSettle button onclick:
FIND:
      DB.settlements.create({ groupId, from: t.from, to: t.to, amount: t.amount });

REPLACE:
      await DB.settlements.create({ groupId, from: t.from, to: t.to, amount: t.amount });

# ── Change 7: renderMembers
FIND:
  function renderMembers() {

REPLACE:
  async function renderMembers() {

# Inside renderMembers, member lookups:
FIND:
    const memberRows = group.members.map(uid => {
      const m = DB.users.findById(uid);

REPLACE:
    const memberRows = await Promise.all(group.members.map(async uid => {
      const m = await DB.users.findById(uid);

# ── Change 8: generateInviteLink
FIND:
  function generateInviteLink() {
    const inv = DB.invitations.create(groupId, user.id, '');

REPLACE:
  async function generateInviteLink() {
    const inv = await DB.invitations.create(groupId, user.id, '');

# ── Change 9: sendEmailInvite
FIND:
  function sendEmailInvite() {
    ...
    const inv = DB.invitations.create(groupId, user.id, email);

REPLACE:
  async function sendEmailInvite() {
    ...
    const inv = await DB.invitations.create(groupId, user.id, email);

# ── Change 10: saveGroupEdit
FIND:
  function saveGroupEdit() {
    ...
    DB.groups.update(groupId, { name, ... });
    group = DB.groups.findById(groupId);

REPLACE:
  async function saveGroupEdit() {
    ...
    await DB.groups.update(groupId, { name, ... });
    group = await DB.groups.findById(groupId);

# ── Change 11: deleteGroup
FIND:
  function deleteGroup() {
    ...
    DB.groups.delete(groupId);

REPLACE:
  async function deleteGroup() {
    ...
    await DB.groups.delete(groupId);


# ════════════════════════════════════════════════════════════
# FILE: add-expense.html
# ════════════════════════════════════════════════════════════

# ── Change 1: populateGroupSelect
FIND:
  function populateGroupSelect() {
    const groups = DB.groups.forUser(user.id);

REPLACE:
  async function populateGroupSelect() {
    const groups = await DB.groups.forUser(user.id);

# ── Change 2: onGroupChange
FIND:
  function onGroupChange() {
    const groupId = document.getElementById('exp-group').value;
    const group = DB.groups.findById(groupId);

REPLACE:
  async function onGroupChange() {
    const groupId = document.getElementById('exp-group').value;
    const group = await DB.groups.findById(groupId);

# ── Change 3: saveExpense
FIND:
  function saveExpense() {
    ...
    if (editId) {
      DB.expenses.update(editId, { ... });
    } else {
      DB.expenses.create({ ... });
    }

REPLACE:
  async function saveExpense() {
    ...
    if (editId) {
      await DB.expenses.update(editId, { ... });
    } else {
      await DB.expenses.create({ ... });
    }

# ── Change 4: loadEdit
FIND:
  function loadEdit() {
    editExpense = DB.expenses.findById(editId);

REPLACE:
  async function loadEdit() {
    editExpense = await DB.expenses.findById(editId);


# ════════════════════════════════════════════════════════════
# FILE: expenses.html
# ════════════════════════════════════════════════════════════

# ── Change 1: init
FIND:
  function init() {
    ...
    groups = DB.groups.forUser(user.id);

REPLACE:
  async function init() {
    ...
    groups = await DB.groups.forUser(user.id);

# ── Change 2: loadExpenses
FIND:
  function loadExpenses() {
    allExpenses = [];
    groups.forEach(g => {
      DB.expenses.forGroup(g.id).forEach(e => ...

REPLACE:
  async function loadExpenses() {
    allExpenses = [];
    for (const g of groups) {
      const exps = await DB.expenses.forGroup(g.id);
      exps.forEach(e => allExpenses.push({ ...e, groupName: g.name }));
    }
    allExpenses.sort((a,b) => b.date - a.date);

# ── Change 3: renderStats
FIND:
  function renderStats() {

REPLACE:
  async function renderStats() {

# Inside renderStats, balance loop:
FIND:
    groups.forEach(g => { netBal += DB.calc.userBalanceInGroup(g.id, user.id); });

REPLACE:
    for (const g of groups) {
      netBal += await DB.calc.userBalanceInGroup(g.id, user.id);
    }


# ════════════════════════════════════════════════════════════
# FILE: profile.html
# ════════════════════════════════════════════════════════════

# ── Change 1: init
FIND:
  function init() {

REPLACE:
  async function init() {

# ── Change 2: saveProfile
FIND:
  function saveProfile() {
    ...
    DB.users.update(user.id, { name, avatarColor: selectedColor });
    Auth.setSession(DB.users.findById(user.id));

REPLACE:
  async function saveProfile() {
    ...
    await DB.users.update(user.id, { name, avatarColor: selectedColor });
    Auth.setSession(await DB.users.findById(user.id));

# ── Change 3: changePassword
FIND:
  function changePassword() {
    ...
    const freshUser = DB.users.findById(user.id);
    ...
    DB.users.update(user.id, { password: newPw });

REPLACE:
  async function changePassword() {
    ...
    const freshUser = await DB.users.findById(user.id);
    ...
    await DB.users.update(user.id, { password: newPw });

# ── Change 4: renderStats
FIND:
  function renderStats() {
    const groups = DB.groups.forUser(user.id);

REPLACE:
  async function renderStats() {
    const groups = await DB.groups.forUser(user.id);

# ── Change 5: renderGroups
FIND:
  function renderGroups() {
    const groups = DB.groups.forUser(user.id);

REPLACE:
  async function renderGroups() {
    const groups = await DB.groups.forUser(user.id);

# Inside renderGroups, balance per group:
FIND:
    document.getElementById('my-groups-list').innerHTML = groups.map(g => {
      const bal = DB.calc.userBalanceInGroup(g.id, user.id);

REPLACE:
    const groupData = await Promise.all(groups.map(async g => ({
      g, bal: await DB.calc.userBalanceInGroup(g.id, user.id)
    })));
    document.getElementById('my-groups-list').innerHTML = groupData.map(({ g, bal }) => {


# ════════════════════════════════════════════════════════════
# FILE: invite.html
# ════════════════════════════════════════════════════════════

# ── Change 1: render() must be async
FIND:
  function render() {
    const inv = DB.invitations.findByToken(token);
    const group = DB.groups.findById(inv.groupId);

REPLACE:
  async function render() {
    const inv = await DB.invitations.findByToken(token);
    const group = await DB.groups.findById(inv.groupId);

# ── Change 2: joinGroup
FIND:
  function joinGroup() {
    const inv = DB.invitations.findByToken(token);
    ...
    DB.invitations.accept(token, user.id);

REPLACE:
  async function joinGroup() {
    const inv = await DB.invitations.findByToken(token);
    ...
    await DB.invitations.accept(token, user.id);

# ── Change 3: acceptInvite
FIND:
  function acceptInvite() {
    const inv = DB.invitations.findByToken(token);
    ...
    DB.invitations.accept(token, user.id);

REPLACE:
  async function acceptInvite() {
    const inv = await DB.invitations.findByToken(token);
    ...
    await DB.invitations.accept(token, user.id);


# ════════════════════════════════════════════════════════════
# FILE: auth.js
# ════════════════════════════════════════════════════════════

# ── Change 1: login()
FIND:
  function login(email, password) {
    const user = DB.users.authenticate(email, password);

REPLACE:
  async function login(email, password) {
    const user = await DB.users.authenticate(email, password);

# ── Change 2: register()
FIND:
  function register(email, name, password) {
    const existing = DB.users.findByEmail(email);
    ...
    const user = DB.users.create(email, name, password);

REPLACE:
  async function register(email, name, password) {
    const existing = await DB.users.findByEmail(email);
    ...
    const user = await DB.users.create(email, name, password);

# ── Change 3: currentUser()
FIND:
  function currentUser() {
    const s = getSession();
    if (!s) return null;
    return DB.users.findById(s.id);
  }

REPLACE:
  async function currentUser() {
    const s = getSession();
    if (!s) return null;
    return await DB.users.findById(s.id);
  }


# ════════════════════════════════════════════════════════════
# FINAL STEP — swap db.js for db.firestore.js in every page
# ════════════════════════════════════════════════════════════
# In ALL html files, find:
#   <script src="db.js"></script>
# Replace with:
#   <script src="db.firestore.js"></script>
#
# Files to update:
#   index.html
#   dashboard.html
#   group.html
#   add-expense.html
#   expenses.html
#   profile.html
#   invite.html
# ════════════════════════════════════════════════════════════
