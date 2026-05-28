import api from './client';

export const getProducts = (page = 1, limit = 20) =>
  api.get('/products', { params: { page, limit } }).then((r) => r.data);

export const getProduct = (id: string) =>
  api.get(`/products/${id}`).then((r) => r.data);

export const getPriceHistory = (id: string, from?: string, limit = 200) =>
  api.get(`/products/${id}/history`, { params: { from, limit } }).then((r) => r.data);

export const addProduct = (data: { asin: string; url: string; title?: string }) =>
  api.post('/products', data).then((r) => r.data);

export const previewScrape = (url: string) =>
  api.post('/scraper/preview', { url }).then((r) => r.data);
