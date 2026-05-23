import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Check, Heart, PartyPopper, RefreshCcw, Sparkles } from 'lucide-react';
import './styles.css';

import standScene from './assets/stand-scene.png';
import basesSheet from './assets/bases-sheet.png';
import flavorsSheet from './assets/flavors-toppings-sheet.png';
import treatsSheet from './assets/finished-treats-sheet.png';

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

const toppingSymbols = {
  sprinkles: '✿',
  mochi: '□',
  cherry: '●',
  fish: '◖',
  umbrella: '☂',
  flower: '✽'
};

const customers = [
  { name: 'Kiki', face: '🌺', wants: ['yellow-shell', 'mango', 'umbrella'], treat: 2 },
  { name: 'Lani', face: '🐢', wants: ['teal-cup', 'blue', 'fish'], treat: 3 },
  { name: 'Malia', face: '⭐', wants: ['pink-cup', 'strawberry', 'cherry'], treat: 1 },
  { name: 'Nalu', face: '🌈', wants: ['purple-shell', 'grape', 'mochi'], treat: 5 },
  { name: 'Pua', face: '🌸', wants: ['coconut', 'lime', 'flower'], treat: 4 },
  { name: 'Kai', face: '🍍', wants: ['waffle', 'pineapple', 'sprinkles'], treat: 0 }
];

const emptySelection = {
  base: null,
  flavor: null,
  topping: null
};

function nextCustomer(current) {
  return (current + 1) % customers.length;
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

function PreviewBase({ base }) {
  return (
    <div className={`preview-base-drawing base-${base.id}`} aria-label={base.name} role="img">
      <span />
    </div>
  );
}

function PreviewTopping({ topping }) {
  return (
    <div className={`preview-topping-drawing topping-${topping.id}`} aria-label={topping.name} role="img">
      {toppingSymbols[topping.id]}
    </div>
  );
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
      <div className="customer-face" aria-hidden="true">{customer.face}</div>
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

function BuildPreview({ selection, matchedTreat }) {
  const base = bases.find((item) => item.id === selection.base);
  const flavor = flavors.find((item) => item.id === selection.flavor);
  const topping = toppings.find((item) => item.id === selection.topping);
  const hasStarted = base || flavor || topping;
  return (
    <div className="build-preview" aria-label="Your shaved ice">
      <div className="preview-stack">
        {matchedTreat == null ? (
          <>
            {topping ? <PreviewTopping topping={topping} /> : null}
            {flavor ? (
              <div className="ice-dome" style={{ '--ice-color': flavor.color }}>
                <Sparkles size={30} strokeWidth={2.6} />
              </div>
            ) : (
              <div className="empty-ice">
                <Sparkles size={26} strokeWidth={2.4} />
              </div>
            )}
            {base ? <PreviewBase base={base} /> : <div className="empty-base" />}
          </>
        ) : (
          <TreatSprite index={matchedTreat} className="finished-preview" />
        )}
      </div>
      <p>{matchedTreat == null ? (hasStarted ? 'Your icee' : 'Pick pictures') : 'So pretty!'}</p>
    </div>
  );
}

function App() {
  const [selection, setSelection] = useState(emptySelection);
  const [customerIndex, setCustomerIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Pick three pictures, then make the icee.');
  const [matchedTreat, setMatchedTreat] = useState(null);
  const customer = customers[customerIndex];

  const hasAllChoices = Boolean(selection.base && selection.flavor && selection.topping);
  const isMatch = useMemo(() => {
    const [wantedBase, wantedFlavor, wantedTopping] = customer.wants;
    return selection.base === wantedBase && selection.flavor === wantedFlavor && selection.topping === wantedTopping;
  }, [customer, selection]);

  function pick(kind, id) {
    setSelection((current) => ({ ...current, [kind]: id }));
    setMatchedTreat(null);
    setMessage('Good pick. Add the other pictures.');
  }

  function makeIce() {
    if (!hasAllChoices) {
      setMessage('Pick one cup, one ice, and one fun topping.');
      setMatchedTreat(null);
      return;
    }

    if (isMatch) {
      setScore((current) => current + 1);
      setMatchedTreat(customer.treat);
      setMessage('You made a happy icee!');
      window.setTimeout(() => {
        const next = nextCustomer(customerIndex);
        setCustomerIndex(next);
        setSelection(emptySelection);
        setMatchedTreat(null);
        setMessage('New friend is ready.');
      }, 1400);
    } else {
      setMessage('Almost. Match the three pictures.');
      setMatchedTreat(null);
    }
  }

  function resetGame() {
    setSelection(emptySelection);
    setCustomerIndex(0);
    setScore(0);
    setMatchedTreat(null);
    setMessage('Pick three pictures, then make the icee.');
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
          <div className="score" aria-label={`${score} happy hearts`}>
            <Heart fill="currentColor" size={23} />
            <span>{score}</span>
          </div>
        </header>

        <OrderCard customer={customer} status={hasAllChoices && isMatch ? 'ready' : ''} />

        <div className="counter-zone">
          <BuildPreview selection={selection} matchedTreat={matchedTreat} />
          <div className={`message-bubble ${hasAllChoices && isMatch ? 'ready' : ''}`}>
            {hasAllChoices && isMatch ? <Check size={23} /> : <PartyPopper size={23} />}
            <span>{message}</span>
          </div>
        </div>

        <div className="action-row">
          <button className="make-button" onClick={makeIce}>
            <Sparkles size={30} />
            Make It!
          </button>
          <button className="icon-button" onClick={resetGame} aria-label="Start over">
            <RefreshCcw size={26} />
          </button>
        </div>
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
