import { API_BASE_URL } from './api';
import { auth } from './firebase';

export const storageService = {
  async uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const headers: Record<string, string> = {};
    if (import.meta.env.VITE_LOCAL_USER_ID) headers['X-User-Id'] = import.meta.env.VITE_LOCAL_USER_ID;
    if (auth?.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
    const response = await fetch(`${API_BASE_URL}/api/uploads`, { method: 'POST', body: form, headers });
    if (!response.ok) throw new Error((await response.text()) || 'Upload failed');
    const result = await response.json() as { url: string };
    return `${API_BASE_URL}${result.url}`;
  },

  async deleteImage(_url: string): Promise<void> {
    // Local files are retained until an authenticated delete endpoint is added.
  },
};