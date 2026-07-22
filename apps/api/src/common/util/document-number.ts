type SequenceDelegate = {
  count: (args: { where: { companyId: string } }) => Promise<number>;
};

/**
 * Generates a human-readable, per-company sequential document/party code with a
 * given prefix, e.g. `MUS-000042`. Uses the current row count as the sequence
 * seed and pads to six digits. Uniqueness is ultimately guaranteed by the
 * `@@unique([companyId, code])` database constraint.
 */
export async function nextDocumentNumber(
  delegate: SequenceDelegate,
  companyId: string,
  prefix: string,
): Promise<string> {
  const count = await delegate.count({ where: { companyId } });
  const sequence = (count + 1).toString().padStart(6, '0');
  return `${prefix}-${sequence}`;
}
