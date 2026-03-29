const getApiUrl = () => {
  if (__DEV__) {
    return 'http://192.168.0.216:5000';
  }
  return 'http://192.168.0.216:5000';
};

export const API_URL = getApiUrl();

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getAlbum() {
  return request(`${API_URL}/api/album`);
}

export function getStats() {
  return request(`${API_URL}/api/estatisticas`);
}

export function increment(cod) {
  return request(`${API_URL}/api/album/${cod}/increment`, { method: 'POST' });
}

export function decrement(cod) {
  return request(`${API_URL}/api/album/${cod}/decrement`, { method: 'POST' });
}
