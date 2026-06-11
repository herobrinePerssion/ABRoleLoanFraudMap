interface Env {
  DB: D1Database
  REPORT_FILES?: R2Bucket
  ADMIN_USERNAME?: string
  ADMIN_PASSWORD?: string
}

interface ReportFormData {
  name?: string
  location?: string[]
  address?: string
  description?: string
  companyAddress?: string
  detailAddress?: string
  floorRoom?: string
  mapPoint?: {
    lng: number
    lat: number
  } | null
  mapAddress?: string
  legalPersonName?: string
  legalPersonId?: string
  legalPersonPhone?: string
  contactPhone?: string
  businessClues?: string
  photoNames?: string[]
}

interface ReportAttachment {
  id: string
  key: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

interface ReportRow {
  id: string
  name: string
  location: string
  address: string
  description: string
  company_address: string | null
  detail_address: string | null
  floor_room: string | null
  map_lng: number | null
  map_lat: number | null
  map_address: string | null
  legal_person_name: string | null
  legal_person_id: string | null
  legal_person_phone: string | null
  contact_phone: string | null
  business_clues: string | null
  photo_names_json: string | null
  attachments_json: string | null
  status: string
  created_at: string
  updates_json: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_FILES_PER_REPORT = 6
const ALLOWED_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
])
const REPORT_STATUS = {
  reviewing: '\u5ba1\u6838\u4e2d',
  rejected: '\u9a73\u56de',
  approved: '\u5ba1\u6838\u901a\u8fc7',
} as const
const PUBLIC_STATUSES = new Set([REPORT_STATUS.approved])
const REVIEW_STATUSES = new Set(Object.values(REPORT_STATUS))

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function normalizeReportId(id: string) {
  return id.trim().toUpperCase()
}

function generateReportId(date = new Date()) {
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.floor(1000 + Math.random() * 9000)
  return `AB-${stamp}-${random}`
}

function safeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function safeFileName(name: string) {
  return name
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 120) || 'file'
}

function getAdminCredentials(env: Env) {
  return {
    username: env.ADMIN_USERNAME || 'abRoleAdmin',
    password: env.ADMIN_PASSWORD || '',
  }
}

function isAdminRequest(request: Request, env: Env) {
  const { username, password } = getAdminCredentials(env)
  if (!username || !password) {
    return false
  }

  const requestUsername = request.headers.get('x-admin-username') || ''
  const requestPassword = request.headers.get('x-admin-password') || ''
  return requestUsername === username && requestPassword === password
}

function requireAdmin(request: Request, env: Env) {
  const { password } = getAdminCredentials(env)
  if (!password) {
    return json({ message: 'ADMIN_PASSWORD is not configured' }, 500)
  }

  if (!isAdminRequest(request, env)) {
    return json({ message: 'unauthorized' }, 401)
  }

  return null
}

function parseJsonArray<T>(value: string | null, fallback: T[]) {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed as T[] : fallback
  } catch {
    return fallback
  }
}

function toReport(row: ReportRow) {
  const attachments = parseJsonArray<ReportAttachment>(row.attachments_json, [])
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    address: row.address,
    description: row.description,
    companyAddress: row.company_address || undefined,
    detailAddress: row.detail_address || undefined,
    floorRoom: row.floor_room || undefined,
    mapPoint: row.map_lng !== null && row.map_lat !== null
      ? { lng: row.map_lng, lat: row.map_lat }
      : undefined,
    mapAddress: row.map_address || undefined,
    legalPersonName: row.legal_person_name || undefined,
    legalPersonId: row.legal_person_id || undefined,
    legalPersonPhone: row.legal_person_phone || undefined,
    contactPhone: row.contact_phone || undefined,
    businessClues: row.business_clues || undefined,
    photoNames: attachments.length
      ? attachments.map(item => item.name)
      : parseJsonArray<string>(row.photo_names_json, []),
    attachments: attachments.map(({ key, ...publicAttachment }) => publicAttachment),
    status: row.status,
    createdAt: row.created_at,
    updates: parseJsonArray(row.updates_json, []),
  }
}

function toPublicReport(row: ReportRow) {
  const report = toReport(row)
  return {
    ...report,
    legalPersonId: undefined,
    legalPersonPhone: undefined,
    contactPhone: undefined,
    attachments: undefined,
    photoNames: undefined,
  }
}

async function getReportRow(env: Env, id: string) {
  return env.DB.prepare(
    `SELECT * FROM reports WHERE id = ?`
  ).bind(normalizeReportId(id)).first<ReportRow>()
}

async function listReports(env: Env) {
  const result = await env.DB.prepare(
    `SELECT * FROM reports WHERE status = ? ORDER BY created_at DESC LIMIT 200`
  ).bind(REPORT_STATUS.approved).all<ReportRow>()

  return json({
    items: (result.results || [])
      .filter(row => PUBLIC_STATUSES.has(row.status))
      .map(toPublicReport),
  })
}

async function getReport(env: Env, id: string) {
  const row = await getReportRow(env, id)
  if (!row) {
    return json({ message: 'report not found' }, 404)
  }

  return json(toReport(row))
}

async function listAdminReports(request: Request, env: Env) {
  const authError = requireAdmin(request, env)
  if (authError) return authError

  const url = new URL(request.url)
  const status = safeText(url.searchParams.get('status'))
  const keyword = safeText(url.searchParams.get('keyword'))
  const binds: unknown[] = []
  const conditions: string[] = []

  if (status) {
    conditions.push('status = ?')
    binds.push(status)
  }

  if (keyword) {
    conditions.push('(id LIKE ? OR name LIKE ? OR location LIKE ? OR address LIKE ?)')
    const like = `%${keyword}%`
    binds.push(like, like, like, like)
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const result = await env.DB.prepare(
    `SELECT * FROM reports ${whereSql} ORDER BY created_at DESC LIMIT 500`
  ).bind(...binds).all<ReportRow>()

  return json({
    items: (result.results || []).map(toReport),
  })
}

async function reviewReport(request: Request, env: Env, id: string) {
  const authError = requireAdmin(request, env)
  if (authError) return authError

  const reportId = normalizeReportId(id)
  const row = await getReportRow(env, reportId)
  if (!row) {
    return json({ message: 'report not found' }, 404)
  }

  if (row.status === REPORT_STATUS.approved) {
    return json({ message: 'approved reports can only be deleted' }, 400)
  }

  const payload = await request.json().catch(() => null) as {
    status?: string
    feedback?: string
  } | null
  const nextStatus = safeText(payload?.status)
  const feedback = safeText(payload?.feedback)

  if (!REVIEW_STATUSES.has(nextStatus)) {
    return json({ message: 'invalid status' }, 400)
  }

  const updates = parseJsonArray(row.updates_json, [])
  updates.push({
    time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    content: feedback || `管理员审核状态更新为：${nextStatus}`,
    operator: 'admin',
  })

  await env.DB.prepare(`
    UPDATE reports
    SET status = ?, updates_json = ?
    WHERE id = ?
  `).bind(nextStatus, JSON.stringify(updates), reportId).run()

  return getReport(env, reportId)
}

async function deleteReport(request: Request, env: Env, id: string) {
  const authError = requireAdmin(request, env)
  if (authError) return authError

  const reportId = normalizeReportId(id)
  const row = await getReportRow(env, reportId)
  if (!row) {
    return json({ message: 'report not found' }, 404)
  }

  await env.DB.prepare(
    `DELETE FROM reports WHERE id = ?`
  ).bind(reportId).run()

  return json({ ok: true, id: reportId })
}

async function createReport(request: Request, env: Env) {
  const payload = await request.json().catch(() => null) as ReportFormData | null
  if (!payload) {
    return json({ message: 'invalid request body' }, 400)
  }

  const name = safeText(payload.name)
  const description = safeText(payload.description)
  const detailAddress = safeText(payload.detailAddress)
  const location = Array.isArray(payload.location)
    ? payload.location.map(safeText).filter(Boolean).join(' / ')
    : ''
  const address = safeText(payload.address)

  if (!name || !location || !detailAddress || !description || !address) {
    return json({ message: 'missing required fields' }, 400)
  }

  const now = new Date()
  const id = generateReportId(now)
  const status = REPORT_STATUS.reviewing
  const createdAt = now.toISOString()
  const updates = [
    {
      time: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      content: '线索已提交，等待管理员审核。请保留证据材料原件。',
    },
  ]

  await env.DB.prepare(`
    INSERT INTO reports (
      id, name, location, address, description,
      company_address, detail_address, floor_room,
      map_lng, map_lat, map_address,
      legal_person_name, legal_person_id, legal_person_phone, contact_phone,
      business_clues, photo_names_json, attachments_json, status, created_at, updates_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    name,
    location,
    address,
    description,
    safeText(payload.companyAddress) || null,
    detailAddress,
    safeText(payload.floorRoom) || null,
    payload.mapPoint?.lng ?? null,
    payload.mapPoint?.lat ?? null,
    safeText(payload.mapAddress) || null,
    safeText(payload.legalPersonName) || null,
    safeText(payload.legalPersonId) || null,
    safeText(payload.legalPersonPhone) || null,
    safeText(payload.contactPhone) || null,
    safeText(payload.businessClues) || null,
    JSON.stringify(payload.photoNames || []),
    JSON.stringify([]),
    status,
    createdAt,
    JSON.stringify(updates),
  ).run()

  return getReport(env, id)
}

async function uploadReportFiles(request: Request, env: Env, reportId: string) {
  if (!env.REPORT_FILES) {
    return json({ message: 'R2 binding REPORT_FILES is not configured' }, 500)
  }

  const row = await getReportRow(env, reportId)
  if (!row) {
    return json({ message: 'report not found' }, 404)
  }

  const formData = await request.formData()
  const files = formData.getAll('files').filter((item): item is File => item instanceof File)
  if (!files.length) {
    return json({ message: 'no files uploaded' }, 400)
  }

  const existingAttachments = parseJsonArray<ReportAttachment>(row.attachments_json, [])
  if (existingAttachments.length + files.length > MAX_FILES_PER_REPORT) {
    return json({ message: `too many files, max ${MAX_FILES_PER_REPORT}` }, 400)
  }

  const uploaded: ReportAttachment[] = []
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return json({ message: `${file.name} is larger than 10MB` }, 400)
    }

    if (file.type && !ALLOWED_FILE_TYPES.has(file.type)) {
      return json({ message: `${file.name} file type is not allowed` }, 400)
    }

    const attachmentId = crypto.randomUUID()
    const key = `reports/${normalizeReportId(reportId)}/${attachmentId}-${safeFileName(file.name)}`
    await env.REPORT_FILES.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
      customMetadata: {
        reportId: normalizeReportId(reportId),
        fileName: file.name,
      },
    })

    uploaded.push({
      id: attachmentId,
      key,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      url: `/api/reports/${encodeURIComponent(normalizeReportId(reportId))}/files/${attachmentId}`,
      uploadedAt: new Date().toISOString(),
    })
  }

  const nextAttachments = [...existingAttachments, ...uploaded]
  await env.DB.prepare(`
    UPDATE reports
    SET attachments_json = ?, photo_names_json = ?
    WHERE id = ?
  `).bind(
    JSON.stringify(nextAttachments),
    JSON.stringify(nextAttachments.map(item => item.name)),
    normalizeReportId(reportId),
  ).run()

  return getReport(env, reportId)
}

async function downloadReportFile(env: Env, reportId: string, attachmentId: string) {
  if (!env.REPORT_FILES) {
    return json({ message: 'R2 binding REPORT_FILES is not configured' }, 500)
  }

  const row = await getReportRow(env, reportId)
  if (!row) {
    return json({ message: 'report not found' }, 404)
  }

  const attachments = parseJsonArray<ReportAttachment>(row.attachments_json, [])
  const attachment = attachments.find(item => item.id === attachmentId)
  if (!attachment) {
    return json({ message: 'file not found' }, 404)
  }

  const object = await env.REPORT_FILES.get(attachment.key)
  if (!object) {
    return json({ message: 'file not found' }, 404)
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'private, max-age=300')
  headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.name)}"`)

  return new Response(object.body, { headers })
}

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) {
    return json({ message: 'D1 binding DB is not configured' }, 500)
  }

  const pathParam = params.path
  const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam || ''
  const segments = path.split('/').filter(Boolean)

  if (request.method === 'GET' && segments.length === 1 && segments[0] === 'admin') {
    return listAdminReports(request, env)
  }

  if (
    (request.method === 'PATCH' || request.method === 'PUT') &&
    segments.length === 2 &&
    segments[0] === 'admin'
  ) {
    return reviewReport(request, env, segments[1])
  }

  if (request.method === 'DELETE' && segments.length === 2 && segments[0] === 'admin') {
    return deleteReport(request, env, segments[1])
  }

  if (request.method === 'GET' && segments.length === 0) {
    return listReports(env)
  }

  if (request.method === 'GET' && segments.length === 1) {
    return getReport(env, segments[0])
  }

  if (request.method === 'POST' && segments.length === 0) {
    return createReport(request, env)
  }

  if (request.method === 'POST' && segments.length === 2 && segments[1] === 'files') {
    return uploadReportFiles(request, env, segments[0])
  }

  if (request.method === 'GET' && segments.length === 3 && segments[1] === 'files') {
    return downloadReportFile(env, segments[0], segments[2])
  }

  return json({ message: 'method not allowed' }, 405)
}
