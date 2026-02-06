export function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  const pushField = () => {
    current.push(field);
    field = "";
  };

  while (i < raw.length) {
    const char = raw[i];
    if (char === '"') {
      if (inQuotes && raw[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      pushField();
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && raw[i + 1] === '\n') {
        i += 1;
      }
      pushField();
      if (current.length > 1 || current[0] !== "") {
        rows.push(current);
      }
      current = [];
    } else {
      field += char;
    }
    i += 1;
  }

  if (field.length > 0 || current.length > 0) {
    pushField();
    rows.push(current);
  }

  return rows;
}
