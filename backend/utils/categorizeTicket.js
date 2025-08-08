function categorizeTicket(title, description) {
  const content = `${title} ${description}`.toLowerCase();

  if (content.includes("password") || content.includes("login") || content.includes("access")) {
    return "Account";
  }

  if (content.includes("invoice") || content.includes("payment") || content.includes("bill")) {
    return "Billing";
  }

  if (content.includes("bug") || content.includes("error") || content.includes("not working") || content.includes("crash")) {
    return "Technical";
  }

  if (content.includes("feature") || content.includes("suggestion") || content.includes("feedback")) {
    return "General";
  }

  return "General"; // default fallback
}

module.exports = categorizeTicket;