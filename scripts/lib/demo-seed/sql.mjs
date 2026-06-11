export function sqlString(value) {
  if (value === null || value === undefined) {
    return "null";
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function sqlJson(value) {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

export function sqlArray(values) {
  if (!values || values.length === 0) {
    return "array[]::text[]";
  }
  return `array[${values.map((value) => sqlString(value)).join(", ")}]`;
}

export function sqlUuid(value) {
  return `'${value}'::uuid`;
}
