import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Heart, Sparkles, Timer } from 'lucide-react';
import './styles.css';

import standScene from './assets/stand-scene.png';
import basesSheet from './assets/bases-sheet.png';
import flavorsSheet from './assets/flavors-toppings-sheet.png';
import treatsSheet from './assets/finished-treats-sheet.png';
import containerSelectSound from './assets/sounds/container-select.mp3';
import iceSelectSound from './assets/sounds/ice-select.mp3';
import toppingSelectSound from './assets/sounds/topping-select.mp3';
import buildCompleteSound from './assets/sounds/build-complete.mp3';
import victoryVoice1 from './assets/sounds/voices/voice-1.mp3';
import victoryVoice2 from './assets/sounds/voices/voice-2.mp3';
import victoryVoice3 from './assets/sounds/voices/voice-3.mp3';
import victoryVoice4 from './assets/sounds/voices/voice-4.mp3';
import victoryVoice5 from './assets/sounds/voices/voice-5.mp3';
import victoryVoice6 from './assets/sounds/voices/voice-6.mp3';
import victoryVoice7 from './assets/sounds/voices/voice-7.mp3';

const bases = [
  { id: 'purple-shell', name: 'Purple Shell', grid: [0, 0] },
  { id: 'yellow-shell', name: 'Yellow Shell', grid: [1, 0] },
  { id: 'waffle', name: 'Waffle Cone', grid: [2, 0] },
  { id: 'pink-cup', name: 'Pink Cup', grid: [0, 1] },
  { id: 'teal-cup', name: 'Teal Cup', grid: [1, 1] },
  { id: 'coconut', name: 'Coconut Bowl', grid: [2, 1] }
];

const flavors = [
  { id: 'strawberry', name: 'Strawberry', grid: [0, 0], color: '#ec5a74' },
  { id: 'mango', name: 'Mango', grid: [1, 0], color: '#f79a3f' },
  { id: 'pineapple', name: 'Pineapple', grid: [2, 0], color: '#f8d84a' },
  { id: 'blue', name: 'Blue Ocean', grid: [3, 0], color: '#42a9e8' },
  { id: 'lime', name: 'Lime', grid: [0, 1], color: '#77c969' },
  { id: 'grape', name: 'Grape', grid: [1, 1], color: '#8964d8' }
];

const toppings = [
  { id: 'sprinkles', name: 'Sprinkles', grid: [2, 1] },
  { id: 'mochi', name: 'Mochi', grid: [3, 1] },
  { id: 'cherry', name: 'Cherry', grid: [0, 2] },
  { id: 'fish', name: 'Gummy Fish', grid: [1, 2] },
  { id: 'umbrella', name: 'Umbrella', grid: [2, 2] },
  { id: 'flower', name: 'Flower Candy', grid: [3, 2] }
];

const customers = [
  { name: 'Kiki', face: '🌺' },
  { name: 'Lani', face: '🐢' },
  { name: 'Malia', face: '⭐' },
  { name: 'Nalu', face: '🌈' },
  { name: 'Pua', face: '🌸' },
  { name: 'Kai', face: '🍍' }
];

const emptySelection = {
  base: null,
  flavor: null,
  topping: null
};

const pickSounds = {
  base: containerSelectSound,
  flavor: iceSelectSound,
  topping: toppingSelectSound
};

const victoryVoiceSounds = [victoryVoice1, victoryVoice2, victoryVoice3, victoryVoice4, victoryVoice5, victoryVoice6, victoryVoice7];

function playSound(src) {
  const audio = new Audio(src);
  audio.volume = 0.75;
  audio.play().catch(() => {
    // Some browsers block audio until a user gesture; picks happen from taps/clicks.
  });
}

function formatElapsed(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomItemExcept(items, excluded) {
  const choices = items.filter((item) => item !== excluded);
  return randomItem(choices.length ? choices : items);
}

function makeRound(previousRound = null) {
  const character = randomItemExcept(customers, customers.find((customer) => customer.name === previousRound?.name));
  let wants = [];

  for (let attempt = 0; attempt < 8; attempt += 1) {
    wants = [randomItem(bases).id, randomItem(flavors).id, randomItem(toppings).id];
    if (wants.join('|') !== previousRound?.wants.join('|')) break;
  }

  return {
    ...character,
    wants,
    treat: Math.floor(Math.random() * 6)
  };
}

function Sprite({ src, cols, rows, grid, className = '', label }) {
  const [x, y] = grid;
  const style = {
    backgroundImage: `url(${src})`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${cols === 1 ? 0 : (x / (cols - 1)) * 100}% ${rows === 1 ? 0 : (y / (rows - 1)) * 100}%`
  };

  return <span className={`sprite ${className}`} role="img" aria-label={label} style={style} />;
}

function TreatSprite({ index, className = '' }) {
  const x = index % 3;
  const y = Math.floor(index / 3);
  return <Sprite src={treatsSheet} cols={3} rows={2} grid={[x, y]} className={className} label="finished shaved ice" />;
}

function OptionButton({ item, selected, onPick, sheet, cols, rows }) {
  return (
    <button className={`option ${selected ? 'selected' : ''}`} onClick={() => onPick(item.id)} aria-pressed={selected}>
      <Sprite src={sheet} cols={cols} rows={rows} grid={item.grid} label={item.name} />
      <span>{item.name}</span>
    </button>
  );
}

function ChoiceRail({ title, items, value, onPick, sheet, cols, rows }) {
  return (
    <section className="choice-rail" aria-label={title}>
      <h2>{title}</h2>
      <div className="choice-scroll">
        {items.map((item) => (
          <OptionButton key={item.id} item={item} selected={value === item.id} onPick={onPick} sheet={sheet} cols={cols} rows={rows} />
        ))}
      </div>
    </section>
  );
}

function MiniNeed({ id }) {
  const base = bases.find((item) => item.id === id);
  const flavor = flavors.find((item) => item.id === id);
  const topping = toppings.find((item) => item.id === id);
  if (base) return <Sprite src={basesSheet} cols={3} rows={2} grid={base.grid} className="need-sprite" label={base.name} />;
  if (flavor) return <Sprite src={flavorsSheet} cols={4} rows={3} grid={flavor.grid} className="need-sprite" label={flavor.name} />;
  return <Sprite src={flavorsSheet} cols={4} rows={3} grid={topping.grid} className="need-sprite" label={topping.name} />;
}

function OrderCard({ customer, status }) {
  return (
    <aside className={`order-card ${status}`}>
      <div>
        <p className="order-line">{customer.name} wants</p>
        <div className="needs">
          {customer.wants.map((want) => (
            <MiniNeed key={want} id={want} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function PreviewPickSlot({ item, sheet, cols, rows }) {
  return (
    <div className={`preview-pick-slot ${item ? 'filled' : ''}`}>
      {item ? <Sprite src={sheet} cols={cols} rows={rows} grid={item.grid} label={item.name} /> : <Sparkles size={30} strokeWidth={2.2} />}
    </div>
  );
}

function BuildPreview({ selection, matchedTreat }) {
  const base = bases.find((item) => item.id === selection.base);
  const flavor = flavors.find((item) => item.id === selection.flavor);
  const topping = toppings.find((item) => item.id === selection.topping);
  return (
    <div className="build-preview" aria-label="Your shaved ice">
      {matchedTreat == null ? (
        <div className="preview-picks">
          <PreviewPickSlot item={base} sheet={basesSheet} cols={3} rows={2} />
          <PreviewPickSlot item={flavor} sheet={flavorsSheet} cols={4} rows={3} />
          <PreviewPickSlot item={topping} sheet={flavorsSheet} cols={4} rows={3} />
        </div>
      ) : (
        <div className="preview-stack">
          <TreatSprite index={matchedTreat} className="finished-preview" />
        </div>
      )}
    </div>
  );
}

function Celebration({ treat }) {
  return (
    <div className="celebration" aria-label="Happy celebration">
      <div className="confetti-field" aria-hidden="true">
        <span>✦</span>
        <span>●</span>
        <span>♥</span>
        <span>✿</span>
        <span>★</span>
        <span>●</span>
        <span>♥</span>
        <span>✦</span>
      </div>
      <div className="celebration-card">
        <Sparkles className="celebration-sparkle left" size={54} />
        <TreatSprite index={treat} className="celebration-treat" />
        <Sparkles className="celebration-sparkle right" size={54} />
        <div className="celebration-hearts" aria-hidden="true">
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [selection, setSelection] = useState(emptySelection);
  const [customer, setCustomer] = useState(() => makeRound());
  const [score, setScore] = useState(0);
  const [matchedTreat, setMatchedTreat] = useState(null);
  const [roundStartedAt, setRoundStartedAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const hasAllChoices = Boolean(selection.base && selection.flavor && selection.topping);
  const isMatch = useMemo(() => {
    const [wantedBase, wantedFlavor, wantedTopping] = customer.wants;
    return selection.base === wantedBase && selection.flavor === wantedFlavor && selection.topping === wantedTopping;
  }, [customer, selection]);

  useEffect(() => {
    if (roundStartedAt == null || matchedTreat != null) return undefined;

    const tick = () => setElapsedMs(Date.now() - roundStartedAt);
    tick();
    const timer = window.setInterval(tick, 100);
    return () => window.clearInterval(timer);
  }, [matchedTreat, roundStartedAt]);

  function pick(kind, id) {
    setRoundStartedAt((current) => current ?? Date.now());
    setSelection((current) => ({ ...current, [kind]: id }));
    setMatchedTreat(null);
    playSound(pickSounds[kind]);
  }

  function makeIce() {
    if (!hasAllChoices) {
      setMatchedTreat(null);
      return;
    }

    if (isMatch) {
      setElapsedMs(roundStartedAt == null ? 0 : Date.now() - roundStartedAt);
      setRoundStartedAt(null);
      setMatchedTreat(customer.treat);
      playSound(randomItem(victoryVoiceSounds));
      window.setTimeout(() => {
        playSound(buildCompleteSound);
      }, 2000);
      window.setTimeout(() => {
        setScore((current) => current + 1);
      }, 1200);
      window.setTimeout(() => {
        setCustomer((current) => makeRound(current));
        setSelection(emptySelection);
        setMatchedTreat(null);
        setElapsedMs(0);
      }, 3200);
    } else {
      setMatchedTreat(null);
    }
  }

  return (
    <main className="app-shell">
      <section className="game-board">
        <img className="scene-art" src={standScene} alt="Hawaiian mermaid shaved ice stand" />
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-shell" aria-hidden="true">✦</span>
            <h1>Naomi's Shave Ice Stand</h1>
          </div>
          <div className={`score ${matchedTreat != null ? 'score-pop' : ''}`} aria-label={`${score} happy hearts`}>
            <Heart fill="currentColor" size={32} />
            <span>{score}</span>
          </div>
        </header>

        <OrderCard customer={customer} status={hasAllChoices && isMatch ? 'ready' : ''} />
        <div className={`timer-badge ${roundStartedAt != null ? 'running' : ''} ${matchedTreat != null ? 'finished' : ''}`} aria-label={`Time ${formatElapsed(elapsedMs)}`}>
          <Timer size={24} />
          <span>{formatElapsed(elapsedMs)}</span>
        </div>
        {matchedTreat != null ? (
          <>
            <Celebration treat={matchedTreat} />
            <div className="flying-heart" aria-hidden="true">♥</div>
          </>
        ) : null}

        {matchedTreat == null ? (
          <div className="lower-ui">
            <BuildPreview selection={selection} matchedTreat={matchedTreat} />
            <div className="action-row">
              <button className="make-button" onClick={makeIce}>
                <Sparkles size={30} />
                Make It!
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <nav className="controls" aria-label="Shave ice choices">
        <ChoiceRail title="1. Pick a Cup" items={bases} value={selection.base} onPick={(id) => pick('base', id)} sheet={basesSheet} cols={3} rows={2} />
        <ChoiceRail title="2. Pick Ice" items={flavors} value={selection.flavor} onPick={(id) => pick('flavor', id)} sheet={flavorsSheet} cols={4} rows={3} />
        <ChoiceRail title="3. Add Fun" items={toppings} value={selection.topping} onPick={(id) => pick('topping', id)} sheet={flavorsSheet} cols={4} rows={3} />
      </nav>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
