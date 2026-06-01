const ALLOWED_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'application/pdf',
];

export function isAllowedUpload(file) {
  const name = file.name.toLowerCase();
  return (
    ALLOWED_TYPES.includes(file.type) ||
    name.endsWith('.md') ||
    name.endsWith('.pdf')
  );
}
