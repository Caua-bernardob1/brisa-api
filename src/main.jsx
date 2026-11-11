import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Wind, Search, Plus, ArrowUpRight, ArrowRight, Star, MapPin, LayoutGrid, Sun, CloudSun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog, Droplets, RefreshCw, X, Compass, Check, AlertCircle, Menu } from 'lucide-react';
import { initialCities, condition, fetchWeather, searchCities, temperature } from './weather';
import './styles.css';
import './palette.css';

const weatherIcons = { sun: Sun, partly: CloudSun, cloud: Cloud, rain: CloudRain, storm: CloudLightning, snow: CloudSnow, fog: CloudFog };
function WeatherIcon({ code, ...props }) { const Icon = weatherIcons[condition(code).icon]; return <Icon {...props} />; }
function storedFavorites() { try { const v = JSON.parse(localStorage.getItem('brisa-favorites')); return Array.isArray(v) ? v : [3448439, 3463237]; } catch { return [3448439, 3463237]; } }

function App() {
  const [cities, setCities] = useState(initialCities);
  const [records, setRecords] = useState({});
  const [selected, setSelected] = useState(initialCities[0].id);
  const [favorites, setFavorites] = useState(storedFavorites);
  const [view, setView] = useState('all');
  const [unit, setUnit] = useState('C');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState({ status: 'idle', results: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [updated, setUpdated] = useState(null);
  const inputRef = useRef(null);
  const searchArea = useRef(null);
  useEffect(() => { try { localStorage.setItem('brisa-favorites', JSON.stringify(favorites)); } catch {} }, [favorites]);
  useEffect(() => {
    const controller = new AbortController();
    setRecords(Object.fromEntries(cities.map(c => [c.id, { status: 'loading' }])));
    cities.forEach(async city => {
      try {
        const data = await fetchWeather(city, controller.signal);
        if (!controller.signal.aborted) { setRecords(old => ({ ...old, [city.id]: { status: 'success', data } })); setUpdated(new Date()); }
      } catch (error) {
        if (!controller.signal.aborted) setRecords(old => ({ ...old, [city.id]: { status: 'error', message: error.name === 'TimeoutError' ? 'A consulta demorou mais que o esperado.' : 'Não conseguimos carregar o clima.' } }));
      }
    });
    return () => controller.abort();
  }, [cities, refresh]);
  useEffect(() => {
    if (query.trim().length < 2) { setSearch({ status: 'idle', results: [] }); return; }
    const controller = new AbortController();
    setSearch({ status: 'loading', results: [] });
    const timer = setTimeout(async () => {
      try { const results = await searchCities(query.trim(), controller.signal); if (!controller.signal.aborted) setSearch({ status: 'success', results }); }
      catch { if (!controller.signal.aborted) setSearch({ status: 'error', results: [] }); }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);
  useEffect(() => {
    function outside(e) { if (searchArea.current && !searchArea.current.contains(e.target)) setSearchOpen(false); }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  function addCity(city) { if (!cities.some(c => c.id === city.id)) setCities(old => [...old, city]); setSelected(city.id); setQuery(''); setSearchOpen(false); setView('all'); }
  function toggleFavorite(id) { setFavorites(old => old.includes(id) ? old.filter(v => v !== id) : [...old, id]); }
  const city = cities.find(c => c.id === selected);
  const record = records[selected];
  const data = record?.data;
  const visibleCities = cities.filter(c => view === 'all' || favorites.includes(c.id));
  const loading = cities.some(c => !records[c.id] || records[c.id].status === 'loading');
  const temp = value => temperature(value, unit);
  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
      <a href="/" className="brand" aria-label="Brisa, voltar ao início"><span className="brand-icon"><Wind size={25}/></span>brisa<span className="brand-dot">.</span></a>
      <div className="nav-label">SEU DIA, MAIS LEVE</div>
      <nav aria-label="Navegação principal">
        <button className={view === 'all' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('all'); setMenuOpen(false); }}><LayoutGrid size={18}/> Visão geral <span>{cities.length}</span></button>
        <button className={view === 'favorites' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('favorites'); setMenuOpen(false); }}><Star size={18}/> Favoritas <span>{cities.filter(c => favorites.includes(c.id)).length}</span></button>
      </nav>
      <div className="sidebar-note"><span className="note-icon"><CloudSun size={31} strokeWidth={1.4}/></span><h3>O céu muda.<br/>Seus planos também.</h3><p>Uma olhada no clima para aproveitar melhor lá fora.</p><span className="note-line"/></div>
      <div className="sidebar-bottom"><span className="live-dot"/> Conectado ao mundo <ArrowUpRight size={14}/></div>
    </aside>

    <div className="main-shell">
      <header className="topbar"><div className="topbar-heading"><button className="mobile-menu icon-button" aria-label="Abrir menu" onClick={() => setMenuOpen(v => !v)}><Menu size={21}/></button><span>Seu tempo. Seu lugar.</span></div><div className="topbar-right"><span className="date-label">{today}</span><div className="unit-switch" aria-label="Unidade de temperatura">{['C', 'F'].map(u => <button key={u} aria-pressed={unit === u} className={unit === u ? 'selected' : ''} onClick={() => setUnit(u)}>°{u}</button>)}</div></div></header>
      <main>
        <section className="page-heading"><div><div className="eyebrow"><span/> UM OLHAR LÁ FORA</div><h1>Como está o céu?</h1><p>Acompanhe o clima dos lugares que fazem parte do seu mundo.</p></div><button className="add-button" onClick={() => { setSearchOpen(true); inputRef.current?.focus(); }}><Plus size={18}/> Adicionar cidade</button></section>

        <div className="search-row"><div className="search-wrap" ref={searchArea}><Search size={19} className="search-icon"/><input ref={inputRef} aria-label="Buscar cidade" placeholder="Para onde vamos? Busque uma cidade" value={query} onChange={e => { setQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onKeyDown={e => { if (e.key === 'Escape') setSearchOpen(false); }}/>{query && <button className="clear-search icon-button" aria-label="Limpar busca" onClick={() => { setQuery(''); inputRef.current?.focus(); }}><X size={16}/></button>}
          {searchOpen && <div className="search-results" role="region" aria-label="Resultados da busca" aria-live="polite">
            {search.status === 'idle' && <p>Digite pelo menos 2 letras para encontrar uma cidade.</p>}
            {search.status === 'loading' && <p><RefreshCw className="spin" size={16}/> Buscando cidades…</p>}
            {search.status === 'error' && <p className="search-error"><AlertCircle size={17}/> A busca falhou. Edite o nome para tentar novamente.</p>}
            {search.status === 'success' && !search.results.length && <p>Nenhuma cidade encontrada. Tente outro nome.</p>}
            {search.results.map(result => <button key={result.id} onClick={() => addCity(result)}><MapPin size={17}/><span><strong>{result.name}</strong><small>{[result.admin1, result.country].filter(Boolean).join(', ')}</small></span>{cities.some(c => c.id === result.id) ? <Check size={17}/> : <Plus size={17}/>}</button>)}
          </div>}
        </div><span className="live-label"><span className="live-dot"/> Dados atualizados em tempo real</span></div>

        <div className="weather-layout">
          <div className="cities-section"><div className="section-title"><h2>{view === 'favorites' ? 'Cidades favoritas' : 'Suas cidades'} <span>{visibleCities.length}</span></h2><button className="refresh-button" onClick={() => setRefresh(v => v + 1)} disabled={loading} aria-label="Atualizar clima"><RefreshCw size={14} className={loading ? 'spin' : ''}/><span>Atualizar</span></button></div>
            <div className="city-grid" aria-live="polite" aria-busy={loading}>
              {!visibleCities.length && <div className="empty-state"><Star size={29}/><h3>Um lugar especial?</h3><p>Toque na estrela de uma cidade para guardá-la aqui.</p><button onClick={() => setView('all')}>Ver cidades <ArrowRight size={16}/></button></div>}
              {visibleCities.map(c => { const r = records[c.id]; const w = r?.data; const status = w ? condition(w.current.weather_code) : null; return <article key={c.id} className={`city-card ${selected === c.id ? 'city-selected' : ''} ${status?.tone || ''}`}>
                <button className="city-select" aria-label={`Ver previsão de ${c.name}`} aria-pressed={selected === c.id} onClick={() => setSelected(c.id)}><span className="city-name">{c.name}</span><span className="city-country">{c.country}</span>
                  {(!r || r.status === 'loading') ? <div className="card-loading" role="status"><div className="skeleton skeleton-temp"/><div className="skeleton skeleton-description"/><span>Buscando o clima…</span></div> : r.status === 'error' ? <div className="card-error"><Cloud size={30}/><span>Clima indisponível</span><small>{r.message}</small></div> : <><div className="card-weather"><span className="card-temperature">{temp(w.current.temperature_2m)}<sup>°</sup></span><WeatherIcon code={w.current.weather_code} className="weather-symbol" size={61} strokeWidth={1.3}/></div><div className="condition">{status.text}</div><div className="card-bottom"><span>↑ {temp(w.daily.temperature_2m_max[0])}° <span className="low">↓ {temp(w.daily.temperature_2m_min[0])}°</span></span><span className="humidity"><Droplets size={12}/>{w.current.relative_humidity_2m}%</span></div></>}
                </button><button className={`favorite-button ${favorites.includes(c.id) ? 'is-favorite' : ''}`} aria-label={`${favorites.includes(c.id) ? 'Remover' : 'Adicionar'} ${c.name} ${favorites.includes(c.id) ? 'das' : 'às'} favoritas`} aria-pressed={favorites.includes(c.id)} onClick={() => toggleFavorite(c.id)}><Star size={17} fill={favorites.includes(c.id) ? 'currentColor' : 'none'}/></button>
                {r?.status === 'error' && <button className="card-retry" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={12}/> Tentar novamente</button>}
              </article>; })}
              <button className="add-city-card" onClick={() => { setSearchOpen(true); inputRef.current?.focus(); }}><span><Plus size={24}/></span><strong>Um novo lugar</strong><small>Adicione uma cidade à sua lista</small></button>
            </div>
            <div className="explore-note"><span className="explore-icon"><Compass size={22}/></span><div><strong>O mundo é grande. Explore o clima.</strong><p>Da sua cidade ao próximo destino, tudo começa por aqui.</p></div><ArrowUpRight size={20}/></div>
          </div>

          <aside className="details-panel" aria-label={`Detalhes de ${city.name}`}><div className="detail-topline"><span>EM DESTAQUE</span><MapPin size={15}/></div><h2>{city.name}</h2><p className="detail-country">{city.country} <span>·</span> Agora</p>
            {(!record || record.status === 'loading') ? <div className="detail-placeholder" role="status"><CloudSun size={66} strokeWidth={1}/><p>Uma olhada no céu…</p><div className="skeleton skeleton-temp"/></div> : record.status === 'error' ? <div className="detail-placeholder" role="alert"><Cloud size={55}/><h3>O clima não chegou por aqui.</h3><p>Verifique sua conexão e tente novamente.</p><button className="add-button" onClick={() => setRefresh(v => v + 1)}>Tentar novamente</button></div> : <>
              <div className={`weather-scene ${condition(data.current.weather_code).tone}`} aria-hidden="true"><div className="scene-orbit orbit-one"/><div className="scene-orbit orbit-two"/><div className="scene-sun"/>{condition(data.current.weather_code).icon !== 'sun' && <div className="scene-cloud"><Cloud size={132} strokeWidth={0.6} fill="currentColor"/></div>}<span className="scene-spark">✦</span><span className="scene-spark small">✧</span></div>
              <div className="detail-weather"><div>{temp(data.current.temperature_2m)}<sup>°{unit}</sup></div><p>{condition(data.current.weather_code).text}</p><span>Sensação de {temp(data.current.apparent_temperature)}°</span></div>
              <div className="detail-metrics"><div><Droplets size={17}/><span>Umidade<strong>{data.current.relative_humidity_2m}<small>%</small></strong></span></div><div><Wind size={18}/><span>Vento<strong>{Math.round(data.current.wind_speed_10m)}<small> km/h</small></strong></span></div></div>
              <div className="forecast-heading"><h3>Próximos 7 dias</h3><span>Máx. / Mín.</span></div><ol className="forecast-list">{data.daily.time.map((date, i) => <li key={date}><span className="forecast-day">{i === 0 ? 'Hoje' : new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)).replace('.', '')}</span><span className="rain-chance"><Droplets size={11}/>{data.daily.precipitation_probability_max[i] ?? '—'}%</span><WeatherIcon code={data.daily.weather_code[i]} size={20} className={`forecast-icon ${condition(data.daily.weather_code[i]).tone}`}/><span className="forecast-temp">{temp(data.daily.temperature_2m_max[i])}° <span>{temp(data.daily.temperature_2m_min[i])}°</span></span></li>)}</ol>
            </>}
            <div className="details-bottom"><span className="live-dot"/> Um momento para olhar para o céu.</div>
          </aside>
        </div>
        <footer><span>Feito para acompanhar o seu dia.</span><span>Dados por <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo <ArrowUpRight size={11}/></a><span className="footer-dot">·</span>{updated ? `Atualizado às ${updated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Aguardando atualização'}</span></footer>
      </main>
    </div>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
