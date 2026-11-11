export const initialCities = [
  { id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', latitude: -23.55, longitude: -46.63 },
  { id: 3451190, name: 'Rio de Janeiro', admin1: 'Rio de Janeiro', country: 'Brasil', latitude: -22.91, longitude: -43.17 },
  { id: 3463237, name: 'Florianópolis', admin1: 'Santa Catarina', country: 'Brasil', latitude: -27.59, longitude: -48.55 },
  { id: 3464975, name: 'Curitiba', admin1: 'Paraná', country: 'Brasil', latitude: -25.43, longitude: -49.27 },
  { id: 2267057, name: 'Lisboa', country: 'Portugal', latitude: 38.72, longitude: -9.14 },
  { id: 3435910, name: 'Buenos Aires', country: 'Argentina', latitude: -34.61, longitude: -58.38 },
];
export function condition(code) {
  if (code === 0) return { text: 'Céu limpo', icon: 'sun', tone: 'sunny' };
  if ([1, 2].includes(code)) return { text: 'Parcialmente nublado', icon: 'partly', tone: 'sunny' };
  if (code === 3) return { text: 'Nublado', icon: 'cloud', tone: 'cloudy' };
  if ([45, 48].includes(code)) return { text: 'Nevoeiro', icon: 'fog', tone: 'cloudy' };
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return { text: 'Neve', icon: 'snow', tone: 'cloudy' };
  if (code >= 95) return { text: 'Trovoadas', icon: 'storm', tone: 'rainy' };
  if (code >= 51) return { text: 'Chuva', icon: 'rain', tone: 'rainy' };
  return { text: 'Condição indisponível', icon: 'cloud', tone: 'cloudy' };
}
export async function fetchJSON(url, signal) {
  const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Não foi possível consultar o clima (HTTP ${response.status}).`);
  const data = await response.json();
  if (data.error) throw new Error('A API não conseguiu concluir a consulta.');
  return data;
}
export async function fetchWeather(city, signal) {
  const query = new URLSearchParams({ latitude: city.latitude, longitude: city.longitude, current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max', timezone: 'auto', forecast_days: 7 });
  const data = await fetchJSON(`https://api.open-meteo.com/v1/forecast?${query}`, signal);
  if (!data.current || !data.daily || !Number.isFinite(data.current.temperature_2m)) throw new Error('A API retornou dados incompletos.');
  return data;
}
export async function searchCities(term, signal) {
  const query = new URLSearchParams({ name: term, count: 5, language: 'pt', format: 'json' });
  const data = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?${query}`, signal);
  return data.results ?? [];
}
export function temperature(value, unit = 'C') {
  return Number.isFinite(value) ? Math.round(unit === 'F' ? value * 9 / 5 + 32 : value) : '—';
}
