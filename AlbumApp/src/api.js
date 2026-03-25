const getApiUrl = () => {
  if (__DEV__) {
    return 'http://172.21.223.21:5000';
  }
  return 'http://172.21.223.21:5000';
};

export const API_URL = getApiUrl();

export async function getAlbum() {
  const res = await fetch(`${API_URL}/api/album`);
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_URL}/api/estatisticas`);
  return res.json();
}

export async function increment(cod) {
  const res = await fetch(`${API_URL}/api/album/${cod}/increment`, { method: 'POST' });
  return res.json();
}

export async function decrement(cod) {
  const res = await fetch(`${API_URL}/api/album/${cod}/decrement`, { method: 'POST' });
  return res.json();
}
