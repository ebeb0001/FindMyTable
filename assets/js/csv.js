const REQUIRED_COLUMNS = ["nom_affiche", "groupe"];

export function parseGuestCsv(content) {
  const parsed = parseCsvRows(content);

  if (!parsed.ok) {
    return parsed;
  }

  const rows = parsed.rows.filter((row) => !isEmptyRow(row));

  if (rows.length === 0) {
    return fail("The CSV file is empty.");
  }

  const headers = rows[0].map(normalizeHeader);
  const columnIndexes = getRequiredColumnIndexes(headers);

  if (!columnIndexes.ok) {
    return fail(columnIndexes.error);
  }

  const guests = [];
  const errors = [];

  rows.slice(1).forEach((row, index) => {
    const lineNumber = index + 2;

    if (row.length !== headers.length) {
      errors.push(
        `Line ${lineNumber}: ${row.length} column(s) instead of ${headers.length}.`,
      );
      return;
    }

    const fields = createFieldMap(headers, row);
    const displayName = fields.nom_affiche ?? "";
    const group = fields.groupe ?? "";

    if (!displayName || !group) {
      errors.push(`Line ${lineNumber}: nom_affiche and groupe are required.`);
      return;
    }

    guests.push({
      id: `guest-${lineNumber}-${guests.length + 1}`,
      displayName,
      fields,
      group,
    });
  });

  if (errors.length > 0) {
    return fail(formatCsvErrors(errors));
  }

  if (guests.length === 0) {
    return fail("The file does not contain any valid guest row.");
  }

  return { ok: true, guests };
}

function parseCsvRows(content) {
  const text = stripBom(content ?? "");
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  let quoteClosed = false;
  let line = 1;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (inQuotes) {
      if (char === "\"") {
        if (nextChar === "\"") {
          cell += "\"";
          index += 1;
        } else {
          inQuotes = false;
          quoteClosed = true;
        }
      } else {
        cell += char;
        if (char === "\n") {
          line += 1;
        }
      }
      continue;
    }

    if (quoteClosed) {
      if (char === ",") {
        row.push(cell);
        cell = "";
        quoteClosed = false;
      } else if (isLineBreak(char)) {
        const consumedNextChar = finishLine(char, nextChar, row, cell, rows);
        cell = "";
        row = [];
        quoteClosed = false;
        line += 1;
        index += consumedNextChar;
      } else if (!isWhitespace(char)) {
        return fail(
          `Invalid CSV line ${line}: unexpected character after a quote.`,
        );
      }
      continue;
    }

    if (char === "\"") {
      if (cell.trim().length > 0) {
        return fail(`Invalid CSV line ${line}: misplaced quote.`);
      }
      cell = "";
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (isLineBreak(char)) {
      const consumedNextChar = finishLine(char, nextChar, row, cell, rows);
      cell = "";
      row = [];
      line += 1;
      index += consumedNextChar;
    } else {
      cell += char;
    }
  }

  if (inQuotes) {
    return fail(`Invalid CSV line ${line}: missing closing quote.`);
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return { ok: true, rows };
}

function finishLine(char, nextChar, row, cell, rows) {
  row.push(cell);
  rows.push(row);

  if (char === "\r" && nextChar === "\n") {
    return 1;
  }

  return 0;
}

function getRequiredColumnIndexes(headers) {
  const values = {};
  const missingColumns = [];

  REQUIRED_COLUMNS.forEach((column) => {
    const index = headers.indexOf(column);

    if (index === -1) {
      missingColumns.push(column);
    } else {
      values[column] = index;
    }
  });

  if (missingColumns.length > 0) {
    return fail(`Missing column(s): ${missingColumns.join(", ")}.`);
  }

  return { ok: true, values };
}

function normalizeHeader(value) {
  return value.trim().toLowerCase();
}

function createFieldMap(headers, row) {
  return headers.reduce((fields, header, index) => {
    fields[header] = row[index]?.trim() ?? "";
    return fields;
  }, {});
}

function isEmptyRow(row) {
  return row.every((cell) => cell.trim() === "");
}

function stripBom(value) {
  return value.replace(/^\uFEFF/, "");
}

function isLineBreak(char) {
  return char === "\n" || char === "\r";
}

function isWhitespace(char) {
  return char === " " || char === "\t";
}

function formatCsvErrors(errors) {
  const visibleErrors = errors.slice(0, 3).join(" ");
  const remainingCount = errors.length - 3;

  if (remainingCount <= 0) {
    return visibleErrors;
  }

  return `${visibleErrors} ${remainingCount} other error(s).`;
}

function fail(error) {
  return { ok: false, error };
}
