import axios from 'axios'

// Each Spring Boot microservice is reached through a Vite dev-proxy prefix
// (see vite.config.js). This keeps the browser same-origin => no CORS issues.
const make = (prefix) => axios.create({ baseURL: prefix, timeout: 20000 })

const productApi = make('/svc/product')       // -> :8081  (/products, /suppliers)
const inventoryApi = make('/svc/inventory')   // -> :8082  (/inventory)
const orderApi = make('/svc/order')           // -> :8083  (/orders)
const recoApi = make('/svc/recommendation')   // -> :8084  (/recommendations)
const userApi = make('/svc/user')             // -> :8085  (/api/auth, /addUsers, ...)

// Some endpoints return a plain string, others { message }. Normalise both.
export const msgOf = (data) => {
  if (data == null) return ''
  if (typeof data === 'string') return data
  if (typeof data === 'object' && data.message) return data.message
  return JSON.stringify(data)
}

// A Spring Page ({content,totalElements,...}) or a bare array -> always an array.
const asList = (data) => (Array.isArray(data) ? data : data?.content ?? [])
const pageMeta = (data) =>
  Array.isArray(data)
    ? { totalElements: data.length, totalPages: 1, number: 0 }
    : { totalElements: data?.totalElements ?? 0, totalPages: data?.totalPages ?? 1, number: data?.number ?? 0 }

/* ----------------------------- Products ----------------------------- */
export const Products = {
  async list(pageNo = 0, pageSize = 200) {
    const { data } = await productApi.get('/products', { params: { pageNo, pageSize } })
    return { items: asList(data), meta: pageMeta(data) }
  },
  async get(id) { return (await productApi.get(`/products/${id}`)).data },
  async create(body) { return (await productApi.post('/products', body)).data },
  async update(id, body) { return (await productApi.put(`/products/${id}`, body)).data },
  async remove(id) { return (await productApi.delete(`/products/${id}`)).data },
  async search(keyword) { return (await productApi.get('/products/search', { params: { keyword } })).data },
  async byCategory(category) { return (await productApi.get(`/products/category/${encodeURIComponent(category)}`)).data },
}

/* ----------------------------- Suppliers ---------------------------- */
export const Suppliers = {
  async list(pageNo = 0, pageSize = 200) { return (await productApi.get('/suppliers', { params: { pageNo, pageSize } })).data },
  async get(id) { return (await productApi.get(`/suppliers/${encodeURIComponent(id)}`)).data },
  async create(body) { return (await productApi.post('/suppliers', body)).data },
  async update(id, body) { return (await productApi.put(`/suppliers/${encodeURIComponent(id)}`, body)).data },
  async remove(id) { return (await productApi.delete(`/suppliers/${encodeURIComponent(id)}`)).data },
  async updateRating(id, rating) { return (await productApi.put(`/suppliers/${encodeURIComponent(id)}/rating`, { rating })).data },
  async topRated(minRating = 4.0) { return (await productApi.get('/suppliers/top-rated', { params: { minRating } })).data },
}

/* ----------------------------- Inventory ---------------------------- */
export const Inventory = {
  async list(pageNo = 0, pageSize = 500) { return (await inventoryApi.get('/inventory', { params: { pageNo, pageSize } })).data },
  async get(productId) { return (await inventoryApi.get(`/inventory/${productId}`)).data },
  async lowStock() { return (await inventoryApi.get('/inventory/low-stock')).data },
  async restock(productId, quantity, performedBy = 'admin') { return (await inventoryApi.put(`/inventory/restock/${productId}`, { quantity, performedBy })).data },
  async reduce(productId, quantity, performedBy = 'admin') { return (await inventoryApi.put(`/inventory/reduce/${productId}`, { quantity, performedBy })).data },
  async setReorder(productId, reorderLevel) { return (await inventoryApi.put(`/inventory/reorder-level/${productId}`, { reorderLevel })).data },
  async setConsumption(productId, averageDailyConsumption) { return (await inventoryApi.put(`/inventory/consumption/${productId}`, { averageDailyConsumption })).data },
  async createManual(body) { return (await inventoryApi.post('/inventory', body)).data },
}

/* ------------------------------ Orders ------------------------------ */
export const Orders = {
  async list(pageNo = 0, pageSize = 200) {
    const { data } = await orderApi.get('/orders', { params: { pageNo, pageSize } })
    return { items: asList(data), meta: pageMeta(data) }
  },
  async get(id) { return (await orderApi.get(`/orders/${id}`)).data },
  async byStatus(status) { return (await orderApi.get(`/orders/status/${encodeURIComponent(status)}`)).data },
  async place(body) { return (await orderApi.post('/orders', body)).data },
  async accept(id) { return (await orderApi.put(`/orders/${id}/accept`)).data },
  async deliver(id) { return (await orderApi.put(`/orders/${id}/deliver`)).data },
  async transfer(id, deliveryBoyId) { return (await orderApi.put(`/orders/${id}/transfer/${encodeURIComponent(deliveryBoyId)}`)).data },
  async remove(id) { return (await orderApi.delete(`/orders/${id}`)).data },
}

/* -------------------------- Recommendations ------------------------- */
export const Recommendations = {
  async all() { return (await recoApi.get('/recommendations')).data },
  async alerts() { return (await recoApi.get('/recommendations/alerts')).data },
  async threshold(percent) { return (await recoApi.get(`/recommendations/threshold/${percent}`)).data },
  async forProduct(productId) { return (await recoApi.get(`/recommendations/${productId}`)).data },
}

/* ------------------------------ Users ------------------------------- */
export const Users = {
  async list(pageNo = 0, pageSize = 100) { return (await userApi.get(`/getAllUsers/${pageNo}/${pageSize}`)).data },
  async get(id) { return (await userApi.get(`/getUserById/${encodeURIComponent(id)}`)).data },
  async byType(type, pageNo = 0, pageSize = 100) { return (await userApi.get(`/getUsersByType/${encodeURIComponent(type)}/${pageNo}/${pageSize}`)).data },
  async add(body) { return (await userApi.post('/addUsers', body)).data },
  async remove(id) { return (await userApi.delete(`/deleteUsers/${encodeURIComponent(id)}`)).data },
  async updatePassword(id, oldpassword, newpassword) { return (await userApi.put(`/updatePassword/${encodeURIComponent(id)}`, { oldpassword, newpassword })).data },
}

/* ------------------------------- Auth ------------------------------- */
export const Auth = {
  async login(email, password) { return (await userApi.post('/api/auth/login', { email, password })).data },
  async signup(body) { return (await userApi.post('/api/auth/signup', body)).data },
  async logout() { return (await userApi.post('/api/auth/logout')).data },
}

// Turn any axios error into a readable message.
export const errMsg = (e) => {
  const d = e?.response?.data
  if (d) { const m = msgOf(d); if (m) return m }
  if (e?.code === 'ECONNABORTED') return 'Request timed out'
  return e?.message || 'Something went wrong'
}
