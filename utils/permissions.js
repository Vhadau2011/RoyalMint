const OWNER_ID = process.env.OWNER_ID;
const GUARD_IDS = process.env.GUARD_IDS?.split(",") || [];
const TESTER_ROLE_NAME = "Tester";

function isOwner(userId) {
  return userId === OWNER_ID;
}

function isGuard(userId) {
  return GUARD_IDS.includes(userId);
}

function isTester(member) {
  return member.roles.cache.some(r => r.name === TESTER_ROLE_NAME);
}

function getUserRank(member) {
  if (isOwner(member.id)) return "👑 OWNER";
  if (isGuard(member.id)) return "🛡️ MOD";
  if (isTester(member)) return "🧪 TESTER";
  return "👤 USER";
}

module.exports = {
  isOwner,
  isGuard,
  isTester,
  getUserRank
};
