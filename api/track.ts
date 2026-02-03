import { updateColumnsByKey } from '../lib/googleSheets'

export default async function handler(req, res) {
  const { key, updates } = req.body
  await updateColumnsByKey(key, updates)
  res.status(200).json({ ok: true })
}
