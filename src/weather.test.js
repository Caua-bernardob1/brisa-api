import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { fetchWeather, searchCities, temperature, initialCities } from './weather.js';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
test('converte Celsius para Fahrenheit e trata temperatura ausente', () => {
  assert.equal(temperature(0, 'F'), 32);
  assert.equal(temperature(25, 'F'), 77);
  assert.equal(temperature(null), '—');
});
test('consulta coordenadas e previsão de sete dias', async () => {
  globalThis.fetch = async url => {
    const query = new URL(url).searchParams;
    assert.equal(query.get('latitude'), '-23.55');
    assert.equal(query.get('forecast_days'), '7');
    return { ok: true, json: async () => ({ current: { temperature_2m: 25 }, daily: { time: ['2026-11-11'] } }) };
  };
  assert.equal((await fetchWeather(initialCities[0])).current.temperature_2m, 25);
});
test('informa falha HTTP sem aceitar a resposta como clima válido', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(fetchWeather(initialCities[0]), /HTTP 503/);
});
test('rejeita resposta incompleta da API', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ current: {} }) });
  await assert.rejects(fetchWeather(initialCities[0]), /incompletos/);
});
test('busca sem resultados retorna lista vazia', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({}) });
  assert.deepEqual(await searchCities('zzzzzzzzzz'), []);
});
test('propaga falha de conexão para exibir o estado de erro', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(fetchWeather(initialCities[0]), /Failed to fetch/);
});
