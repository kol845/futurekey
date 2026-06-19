import { useRef, useState } from 'react';

// Geometry (SVG user units). The face is drawn in a 240x240 viewBox.
const SIZE = 240;
const C = SIZE / 2; // center x/y
const RING_R = 88; // radius the numbers/ticks sit on
const HAND_R = 78; // how far the hand reaches

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // index 0 sits at top
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// Angle (degrees, 0 = top, clockwise) -> x/y on a circle of radius r.
function pointOnRing(angleDeg, r) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) };
}

/**
 * A Material-style clock. Pick the hour first, then minutes (snapped to 5).
 *
 * @param {object} props
 * @param {number} props.hour    0-23
 * @param {number} props.minute  0,5,10,...,55
 * @param {(t: { hour: number, minute: number }) => void} props.onChange
 */
export default function ClockPicker({ hour, minute, onChange }) {
  const [mode, setMode] = useState('hours'); // 'hours' | 'minutes'
  const svgRef = useRef(null);

  const isPM = hour >= 12;
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  function setHour12(h12) {
    const base = h12 % 12; // 12 -> 0
    onChange({ hour: isPM ? base + 12 : base, minute });
  }

  function setMeridiem(pm) {
    const base = hour % 12;
    onChange({ hour: pm ? base + 12 : base, minute });
  }

  // Map a pointer event to the nearest hour or minute on the ring.
  function valueFromEvent(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * SIZE;
    const py = ((e.clientY - rect.top) / rect.height) * SIZE;
    let angle = (Math.atan2(px - C, C - py) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    const slot = Math.round(angle / 30) % 12; // 12 positions, 30deg apart
    return slot;
  }

  function applySlot(slot) {
    if (mode === 'hours') {
      setHour12(HOURS[slot]);
    } else {
      onChange({ hour, minute: MINUTES[slot] });
    }
  }

  const dragging = useRef(false);

  function onPointerDown(e) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    applySlot(valueFromEvent(e));
  }
  function onPointerMove(e) {
    if (!dragging.current) return;
    applySlot(valueFromEvent(e));
  }
  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    // After choosing an hour, advance to minutes (Material behaviour).
    if (mode === 'hours') setMode('minutes');
  }

  const labels = mode === 'hours' ? HOURS : MINUTES;
  const selectedSlot =
    mode === 'hours' ? HOURS.indexOf(hour12) : MINUTES.indexOf(minute);
  const handAngle = selectedSlot * 30;
  const handEnd = pointOnRing(handAngle, HAND_R);

  return (
    <div className="clock">
      <div className="clock__readout">
        <button
          type="button"
          className={`clock__time ${mode === 'hours' ? 'is-active' : ''}`}
          onClick={() => setMode('hours')}
        >
          {String(hour12).padStart(2, '0')}
        </button>
        <span className="clock__colon">:</span>
        <button
          type="button"
          className={`clock__time ${mode === 'minutes' ? 'is-active' : ''}`}
          onClick={() => setMode('minutes')}
        >
          {String(minute).padStart(2, '0')}
        </button>
        <div className="clock__meridiem">
          <button
            type="button"
            className={!isPM ? 'is-active' : ''}
            onClick={() => setMeridiem(false)}
          >
            AM
          </button>
          <button
            type="button"
            className={isPM ? 'is-active' : ''}
            onClick={() => setMeridiem(true)}
          >
            PM
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="clock__face"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="slider"
        aria-label={mode === 'hours' ? 'Select hour' : 'Select minutes'}
      >
        <circle cx={C} cy={C} r={C - 2} className="clock__bg" />

        {/* selection hand */}
        <line x1={C} y1={C} x2={handEnd.x} y2={handEnd.y} className="clock__hand" />
        <circle cx={C} cy={C} r="4" className="clock__hub" />
        <circle cx={handEnd.x} cy={handEnd.y} r="16" className="clock__knob" />

        {/* numbers / minute ticks */}
        {labels.map((label, i) => {
          const p = pointOnRing(i * 30, RING_R);
          const selected = i === selectedSlot;
          return (
            <text
              key={label}
              x={p.x}
              y={p.y}
              className={`clock__label ${selected ? 'is-selected' : ''}`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {mode === 'minutes' ? String(label).padStart(2, '0') : label}
            </text>
          );
        })}
      </svg>

      <p className="clock__hint">
        {mode === 'hours'
          ? 'Tap an hour, then set the minutes (5-min steps).'
          : 'Drag the hand — it snaps to 5 minutes.'}
      </p>
    </div>
  );
}
