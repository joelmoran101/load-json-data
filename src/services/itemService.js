import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const itemService = {
  getAll: () => axios.get(`${API_BASE}/items`),
  getById: (id) => axios.get(`${API_BASE}/items/${id}`),
  create: (item) => axios.post(`${API_BASE}/items`, item),
  update: (id, item) => axios.put(`${API_BASE}/items/${id}`, item),
  patch: (id, partialItem) => axios.patch(`${API_BASE}/items/${id}`, partialItem),
  delete: (id) => axios.delete(`${API_BASE}/items/${id}`)
};

export default itemService;
