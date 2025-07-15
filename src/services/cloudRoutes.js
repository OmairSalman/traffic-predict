import { api } from './api';

export async function uploadRoute(route)
{
    const response = await api.post('/route', route);
  return response.data;
}

export async function fetchCloudRoutes() {
  const response = await api.get('/routes');
  return response.data;
}

export async function deleteCloudRoute(id) {
  const response = await api.delete(`/routes/${id}`);
  return response.data;
}