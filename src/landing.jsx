import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowRight, Wind } from 'lucide-react';
import './styles.css';
import './palette.css';
import './landing.css';

function Landing() {
  return <div className="landing">
    <img className="landing-image" src="/patio-sereno.webp" alt="Pátio sereno com um caminho de pedras, folhagem verde-líquen e um portal circular ao fundo" fetchPriority="high"/>
    <div className="landing-wash" aria-hidden="true"/>
    <header className="landing-header">
      <a className="brand landing-brand" href="/" aria-label="Brisa, início"><span className="brand-icon"><Wind size={25}/></span>brisa<span className="brand-dot">.</span></a>
      <span className="landing-header-note"><span/> SEU TEMPO. SEU LUGAR.</span>
    </header>
    <main className="landing-content">
      <div className="landing-eyebrow"><span/> UM RESPIRO NO SEU DIA</div>
      <h1>Olhe o céu.<br/>Sinta o dia.<br/><span>Vá lá fora.</span></h1>
      <p>Descubra o clima dos seus lugares favoritos.<br className="landing-desktop-break"/> E encontre o seu momento de aproveitar lá fora.</p>
      <a className="landing-cta" href="/app.html">Vamos começar <span><ArrowRight size={21}/></span></a>
      <span className="landing-caption">Um novo olhar para o clima. Uma brisa para os seus planos.</span>
    </main>
    <footer className="landing-footer"><span>O próximo destino pode ser logo ali.</span><span>O MUNDO TE ESPERA <ArrowUpRight size={15}/></span></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<Landing/>);
