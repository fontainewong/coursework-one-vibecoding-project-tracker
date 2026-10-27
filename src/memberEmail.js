// Prototype display data; keep any email already supplied with the member.
export function getMemberEmail(member) {
  return member.email || `${member.name.trim().toLocaleLowerCase().replace(/\s+/g, '.')}@gmail.com`;
}
