"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Suit = "♠" | "♥" | "♦" | "♣"
type Card = { rank: string; suit: Suit; red: boolean }
type Phase = "idle" | "dealing" | "playing" | "dealer" | "done"

const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"]
const BET_STEPS = [5000, 10000, 25000, 50000]

function shuffledDeck(): Card[] {
  const d: Card[] = []
  for (const suit of SUITS) for (const rank of RANKS) d.push({ rank, suit, red: suit === "♥" || suit === "♦" })
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

function handValue(hand: Card[]) {
  let total = 0, aces = 0
  for (const c of hand) {
    if (c.rank === "A") { total += 11; aces++ }
    else if (["K", "Q", "J"].includes(c.rank)) total += 10
    else total += parseInt(c.rank, 10)
  }
  while (total > 21 && aces) { total -= 10; aces-- }
  return total
}

function isBlackjack(hand: Card[]) {
  return hand.length === 2 && handValue(hand) === 21
}

export function Blackjack() {
  const [open, setOpen] = useState(false)
  const [deck, setDeck] = useState<Card[]>([])
  const [player, setPlayer] = useState<Card[]>([])
  const [dealer, setDealer] = useState<Card[]>([])
  const [phase, setPhase] = useState<Phase>("idle")
  const [message, setMessage] = useState("")
  const [balance, setBalance] = useState(100000)
  const [bet, setBet] = useState(10000)
  const stepBet = (dir: 1 | -1) => {
    const i = BET_STEPS.reduce((best, v, idx) => Math.abs(v - bet) < Math.abs(BET_STEPS[best] - bet) ? idx : best, 0)
    const next = BET_STEPS[Math.min(BET_STEPS.length - 1, Math.max(0, i + dir))]
    setBet(Math.min(next, balance))
  }
  const [history, setHistory] = useState<number[]>([100000])
  const [handsPlayed, setHandsPlayed] = useState(0)
  const [ended, setEnded] = useState(false)
  const [stats, setStats] = useState({ wins: 0, losses: 0, pushes: 0, wagered: 0, won: 0, lost: 0, biggestWin: 0, biggestLoss: 0 })
  const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN")
  const [displayBalance, setDisplayBalance] = useState(100000)
  const prevBalance = useRef(100000)
  useEffect(() => {
    const from = prevBalance.current, to = balance
    if (from === to) { setDisplayBalance(to); return }
    const start = performance.now(), dur = 650
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - k, 3)
      setDisplayBalance(Math.round(from + (to - from) * eased))
      if (k < 1) raf = requestAnimationFrame(tick)
      else prevBalance.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [balance])

  const settle = useCallback((delta: number) => {
    setBalance(b => { const next = b + delta; setHistory(h => [...h, next]); return next })
    setStats(s => ({
      ...s,
      wagered: s.wagered + Math.abs(delta) + (delta === 0 ? bet : 0),
      won: s.won + (delta > 0 ? delta : 0),
      lost: s.lost + (delta < 0 ? -delta : 0),
      biggestWin: Math.max(s.biggestWin, delta),
      biggestLoss: Math.min(s.biggestLoss, delta),
    }))
  }, [bet])

  useEffect(() => {
    const onOpen = () => { setOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }) }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("open-blackjack", onOpen)
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("open-blackjack", onOpen); window.removeEventListener("keydown", onKey) }
  }, [])

  const timers = useRef<number[]>([])
  useEffect(() => () => { timers.current.forEach(clearTimeout) }, [])

  const deal = useCallback(() => {
    if (balance < bet) { setMessage("Out of chips. Use retry to play again."); return }
    let d = deck.length < 15 ? shuffledDeck() : [...deck]
    const order: Array<"p" | "d"> = ["p", "d", "p", "d"]
    const p: Card[] = [], dlr: Card[] = []
    setPhase("dealing"); setPlayer([]); setDealer([]); setMessage("Dealing")
    timers.current.forEach(clearTimeout); timers.current = []
    order.forEach((who, i) => {
      const id = window.setTimeout(() => {
        const c = d.pop()!
        if (who === "p") { p.push(c); setPlayer([...p]) } else { dlr.push(c); setDealer([...dlr]) }
        if (i === order.length - 1) {
          setDeck([...d])
          const pBJ = isBlackjack(p), dBJ = isBlackjack(dlr)
          if (pBJ || dBJ) {
            setPhase("done"); setHandsPlayed(h => h + 1)
            if (pBJ && dBJ) { setMessage("Push, both blackjack."); settle(0); setStats(s => ({ ...s, pushes: s.pushes + 1 })) }
            else if (pBJ) { setMessage("Blackjack, you win."); settle(Math.floor(bet * 1.5)); setStats(s => ({ ...s, wins: s.wins + 1 })) }
            else { setMessage("Dealer blackjack, you lose."); settle(-bet); setStats(s => ({ ...s, losses: s.losses + 1 })) }
          } else { setPhase("playing"); setMessage("Hit or stand?") }
        }
      }, 380 * (i + 1))
      timers.current.push(id)
    })
  }, [deck, balance, bet, settle])

  const finishDealer = useCallback((dHand: Card[], dDeck: Card[]) => {
    let hand = [...dHand], rest = [...dDeck]
    while (handValue(hand) < 17) { const c = rest.pop(); if (!c) break; hand.push(c) }
    setDealer(hand); setDeck(rest); setPhase("done"); setHandsPlayed(h => h + 1)
    const pV = handValue(player), dV = handValue(hand)
    if (dV > 21) { setMessage("Dealer busts, you win."); settle(bet); setStats(s => ({ ...s, wins: s.wins + 1 })) }
    else if (pV > dV) { setMessage("You win."); settle(bet); setStats(s => ({ ...s, wins: s.wins + 1 })) }
    else if (pV < dV) { setMessage("Dealer wins."); settle(-bet); setStats(s => ({ ...s, losses: s.losses + 1 })) }
    else { setMessage("Push."); settle(0); setStats(s => ({ ...s, pushes: s.pushes + 1 })) }
  }, [player, bet, settle])

  const hit = () => {
    if (phase !== "playing") return
    const d = [...deck]; const c = d.pop(); if (!c) return
    const p = [...player, c]; setDeck(d); setPlayer(p)
    const v = handValue(p)
    if (v > 21) { setPhase("done"); setHandsPlayed(h => h + 1); setMessage("Bust, dealer wins."); settle(-bet); setStats(s => ({ ...s, losses: s.losses + 1 })) }
    else if (v === 21) { setPhase("dealer"); setMessage("21, dealer plays"); window.setTimeout(() => finishDealer(dealer, d), 650) }
    else setMessage("Hit or stand?")
  }

  const stand = () => {
    if (phase !== "playing") return
    setPhase("dealer"); setMessage("Dealer plays")
    window.setTimeout(() => finishDealer(dealer, deck), 750)
  }

  const double = () => {
    if (phase !== "playing" || player.length !== 2 || balance < bet * 2) return
    const d = [...deck]; const c = d.pop(); if (!c) return
    const p = [...player, c]; setDeck(d); setPlayer(p)
    if (handValue(p) > 21) { setPhase("done"); setHandsPlayed(h => h + 1); setMessage("Bust on double, dealer wins."); settle(-bet * 2); setStats(s => ({ ...s, losses: s.losses + 1 })) }
    else { setPhase("dealer"); window.setTimeout(() => finishDealer(dealer, d), 750) }
  }

  const newGame = () => { setEnded(false); setBalance(100000); setHandsPlayed(0); setHistory([100000]); setStats({ wins: 0, losses: 0, pushes: 0, wagered: 0, won: 0, lost: 0, biggestWin: 0, biggestLoss: 0 }); setPlayer([]); setDealer([]); setPhase("idle"); setMessage(""); setDeck(shuffledDeck()) }

  useEffect(() => {
    if (open && !deck.length) setDeck(shuffledDeck())
  }, [open, deck.length])

  const reveal = phase !== "playing" && phase !== "dealing"
  const pVal = handValue(player), dVal = reveal ? handValue(dealer) : (dealer[0] ? handValue([dealer[0]]) : 0)
  const broke = balance < bet
  // Out of money (below the minimum bet): go straight to the end page.
  useEffect(() => {
    if (phase === "done" && balance < 5000 && handsPlayed > 0 && !ended) {
      const id = window.setTimeout(() => setEnded(true), 700)
      return () => clearTimeout(id)
    }
  }, [phase, balance, handsPlayed, ended])
  const liveBet = Math.min(bet, balance)

  const renderHand = (hand: Card[], hidden = false) => (
    <div className="bj-hand">
      {hand.map((c, i) => hideHole(hidden, i) ? (
        <div key={i} className="bj-card bj-card--back" style={{ animationDelay: `${i * 90}ms` }}><span>♠</span></div>
      ) : (
        <div key={i} className="bj-card" style={{ animationDelay: `${i * 90}ms` }}>
          <span className="bj-corner">{c.rank}<i>{c.suit}</i></span><span className="bj-pip">{c.suit}</span><span className="bj-corner bj-corner--br">{c.rank}<i>{c.suit}</i></span>
        </div>
      ))}
      {!hand.length && <div className="bj-empty">no cards yet</div>}
    </div>
  )
  function hideHole(hidden: boolean, i: number) { return hidden && i === 1 }

  return (
    <>
      {open && (
        <div className="bj-backdrop" onClick={() => setOpen(false)} role="presentation">
          <section className="bj-panel" aria-label="Blackjack" onClick={e => e.stopPropagation()}>
            <header className="bj-head">
              <div><small>21 · blackjack</small><h2>Feeling <em>lucky?</em></h2></div>
              <div className="bj-meta">
                <span>chips <b>{fmt(displayBalance)}</b></span>
                <span>W {stats.wins} · L {stats.losses} · P {stats.pushes}</span>
              </div>
              <button className="bj-close" onClick={() => setOpen(false)} aria-label="Close blackjack">×</button>
            </header>

            {!ended && (<>
            <div className="bj-betrow">
              <span className="bj-label">your bet</span>
              <div className="bj-stepper" role="group" aria-label="Bet amount">
                <button onClick={() => stepBet(-1)} disabled={phase === "playing" || phase === "dealing"} aria-label="Decrease bet">−</button>
                <b>{fmt(liveBet)}</b>
                <button onClick={() => stepBet(1)} disabled={phase === "playing" || phase === "dealing" || bet >= balance} aria-label="Increase bet">+</button>
                <button className="bj-max" onClick={() => setBet(balance)} disabled={phase === "playing" || phase === "dealing" || bet >= balance} aria-label="Bet everything">Max</button>
              </div>
              <span className="bj-bet-hint">per hand</span>
            </div>

            {handsPlayed > 0 || phase === "dealing" || phase === "playing" || phase === "dealer" ? (
            <div className="bj-table">
              <div className="bj-row">
                <div className="bj-score" aria-label="dealer score"><span>dealer</span><b>{dealer.length ? (reveal ? dVal : handValue(dealer.slice(0, 1))) : "·"}</b></div>
                {renderHand(dealer, phase === "playing" || phase === "dealing")}
              </div>
              <div className="bj-row bj-row--player">
                <div className="bj-score" aria-label={`your ${pVal}`}><span>you</span><b>{player.length ? pVal : "·"}</b></div>
                {renderHand(player)}
              </div>
            </div>
            ) : null}

            <p className="bj-msg" role="status">{handsPlayed === 0 && phase === "idle" && !ended ? "" : message}</p>

            {ended ? (
              <div className="bj-actions"><button className="bj-btn bj-btn--primary" onClick={newGame}>Retry</button></div>
            ) : phase === "idle" && handsPlayed === 0 ? (
              <div className="bj-actions bj-actions--solo"><button className="bj-btn bj-btn--primary" onClick={deal}>Play</button></div>
            ) : phase === "playing" ? (
              <div className="bj-actions"><button className="bj-btn" onClick={hit}>Hit</button><button className="bj-btn" onClick={stand}>Stand</button><button className="bj-btn" onClick={double} disabled={player.length !== 2 || balance < bet * 2}>Double</button><button className="bj-btn" onClick={() => { setEnded(true); setMessage("Game ended") }}>End game</button></div>
            ) : phase === "dealing" || phase === "dealer" ? (
              <div className="bj-actions bj-actions--solo"><button className="bj-btn bj-btn--primary" disabled>Dealing</button></div>
            ) : broke ? (
              <div className="bj-actions"><button className="bj-btn bj-btn--primary" onClick={newGame}>Retry</button><button className="bj-btn" onClick={() => setEnded(true)}>End game</button></div>
            ) : (
              <div className="bj-actions bj-actions--solo"><button className="bj-btn bj-btn--primary" onClick={deal}>Deal</button></div>
            )}

            </>)}

            {ended && (
              <div className="bj-end">
                <h3>Game ended</h3>
                <p className="bj-end-net">net {fmt(balance - 100000)}</p>
                <div className="bj-stats">
                  <span>won <b>{fmt(stats.won)}</b></span>
                  <span>lost <b>{fmt(stats.lost)}</b></span>
                  <span>wagered <b>{fmt(stats.wagered)}</b></span>
                  <span>biggest win <b>{fmt(stats.biggestWin)}</b></span>
                  <span>biggest loss <b>{fmt(Math.abs(stats.biggestLoss))}</b></span>
                </div>
                <BalanceGraph history={history} fmt={fmt} />
                <button className="bj-btn bj-btn--primary bj-retry" onClick={newGame}>Retry with ₹1,00,000</button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}

function BalanceGraph({ history, fmt }: { history: number[]; fmt: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null)
  const w = 560, h = 140, pad = 14
  const min = Math.min(...history), max = Math.max(...history)
  const span = Math.max(1, max - min)
  const pts = history.map((v, i) => {
    const x = pad + (i / Math.max(1, history.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (v - min) / span) * (h - pad * 2 - 14) + 6
    return { x, y, v, i }
  })
  const path = pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ")
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * w
    let best = 0, bestD = Infinity
    for (const p of pts) { const d = Math.abs(p.x - x); if (d < bestD) { bestD = d; best = p.i } }
    setHover(best)
  }
  const active = hover !== null ? pts[hover] : pts[pts.length - 1]
  return (
    <div>
      <div className="bj-graph-tip" aria-live="polite">hand {active.i + 1} · {fmt(active.v)}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="bj-graph-svg" role="img" aria-label={`Balance from ${fmt(history[0])} to ${fmt(history[history.length - 1])}`} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(p => <circle key={p.i} cx={p.x} cy={p.y} r={p.i === active.i ? 5 : 3} fill="var(--bg)" stroke="var(--accent)" strokeWidth="2" />)}
        <text x={pad} y={h - 2} className="bj-graph-t">{fmt(min)}</text>
        <text x={w - pad} y={pad + 8} textAnchor="end" className="bj-graph-t">{fmt(max)}</text>
      </svg>
    </div>
  )
}
