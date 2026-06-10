const Groq                = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Flight        = require('../models/Flight');
const AirportService = require('../models/AirportService');

// ─── Groq Client (PRIMARY AI — 14,400 free req/day, no per-minute quota) ──────
let groqClient = null;
const getGroqClient = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') return null;
  if (!groqClient) {
    groqClient = new Groq({ apiKey: key });
    console.log('🚀 Groq AI client initialised — NLP mode ACTIVE (llama-3.3-70b)');
  }
  return groqClient;
};

// ─── Gemini Client (SECONDARY fallback) ───────────────────────────────────────
let geminiClient = null;
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(key);
    console.log('✨ Gemini AI client initialised (secondary fallback)');
  }
  return geminiClient;
};

// ─── Airport Context Cache (rebuilt every 60 s) ───────────────────────────────
let contextCache     = null;
let contextCacheTime = 0;

const buildAirportContext = async () => {
  const now = Date.now();
  if (contextCache && now - contextCacheTime < 60_000) return contextCache;

  try {
    const [flights, services] = await Promise.all([
      Flight.find({}).sort({ departureTime: 1 }).limit(15).lean(),
      AirportService.find({ isActive: true }).lean(),
    ]);

    const flightLines = flights.map((f) => {
      const dep = new Date(f.departureTime).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
      });
      return `${f.flightNumber}|${f.airlineName}|${f.sourceAirport}→${f.destinationAirport}|Dep:${dep}|T:${f.terminal}|Gate:${f.gate}|${f.flightStatus}`;
    }).join('\n');

    const serviceLines = services.map((s) =>
      `[${s.category}]${s.icon}${s.serviceName}|${s.location}|${s.openingHours}|${s.description.slice(0, 60)}`
    ).join('\n');

    contextCache     = { flightLines, serviceLines };
    contextCacheTime = now;
    return contextCache;
  } catch {
    return { flightLines: 'Unavailable', serviceLines: 'Unavailable' };
  }
};

// ─── System Prompt ────────────────────────────────────────────────────────────
const buildSystemPrompt = (flightLines, serviceLines, userName) => `
You are AirAssist AI, a friendly and knowledgeable Smart Airport Assistant.
${userName ? `The passenger's name is ${userName}.` : ''}
Help passengers with ANY airport or travel question.

LIVE FLIGHTS:
${flightLines}

AIRPORT SERVICES:
${serviceLines}

GENERAL KNOWLEDGE:
- Check-in: Level 1, opens 24h before departure (online), 3h before (counter)
- Security: Level 2, remove laptops/liquids(100ml max)/shoes
- Free WiFi: "AirportFreeWiFi", no password, 50 Mbps
- Boarding: gates open 45 min before departure
- Shuttle between terminals: free, every 15 minutes
- Lost & Found: Level 1, near carousel B
- Prayer room: Terminal B, Level 2, Gate B14, 24/7
- Emergency: 1800-XXX-XXXX

RESPONSE RULES:
- Be warm, helpful, concise (under 150 words unless detail is requested)
- Use **bold** for key info and bullet points for lists
- Use emojis sparingly (✈️ 🍽️ 🚌 🏥 💳)
- For specific flight numbers, look them up in LIVE FLIGHTS above
- Format prices in ₹
- If something is outside your airport knowledge, be honest and suggest the Info Desk
`.trim();

// ─── Rule-Based Fallback ──────────────────────────────────────────────────────
const FALLBACK_RULES = [
  { p: ['check-in','checkin','check in'],      r: '✈️ **Check-in** counters are on **Level 1**. Online check-in opens 24h before departure. Counter closes 2h before international flights.' },
  { p: ['baggage','luggage','lost bag'],        r: '🧳 **Baggage Claim** is on **Level 1** (Arrivals Hall). Lost bag? Visit the Lost & Found desk near carousel B.' },
  { p: ['security','screening','x-ray'],        r: '🔒 **Security** is on **Level 2**. Remove laptops, liquids (100ml max), and shoes before the scanner.' },
  { p: ['lounge','vip','executive lounge'],     r: '🛋️ **Lounges**: Sky Lounge (Terminal B, Level 3) and Pearl Executive Lounge (Terminal A, Level 2). Both offer food, drinks & Wi-Fi.' },
  { p: ['wifi','wi-fi','internet','wireless'],  r: '📶 **Free Wi-Fi**: Network "AirportFreeWiFi", no password, throughout the airport.' },
  { p: ['food','restaurant','eat','dining','hungry','cafe','coffee'], r: '🍽️ **Dining**: Spice Garden (Terminal A, 24/7), Café Aroma (all terminals, 5AM–11PM), The Grill Room (Terminal B, Level 3). Fast food at Terminal C.' },
  { p: ['parking','car park','park my car'],   r: '🚗 **Parking**: Short-term ₹60/hr, Long-term ₹800/day (Lot P3, free shuttle). Valet at Terminal A & B.' },
  { p: ['terminal','gate','map','where is'],    r: '🗺️ **Terminals**: A=Domestic, B=International, C=Low-cost. Free shuttle every 15 min.' },
  { p: ['taxi','cab','metro','bus','transport','ola','uber'], r: '🚌 **Transport**: Metro at Terminal B basement (5AM–midnight). Prepaid taxis at exits. Ola/Uber pickup zones outside each terminal.' },
  { p: ['medical','clinic','doctor','pharmacy','first aid'], r: '🏥 **Medical Clinic**: Terminal B, Level 1, 24/7. Pharmacy at Terminal A & B (6AM–10PM).' },
  { p: ['atm','money','currency','forex','exchange'], r: '💳 **ATMs** at every terminal. Currency exchange: Thomas Cook, Terminal B Level 1 (6AM–10PM).' },
  { p: ['hotel','stay','overnight','layover room'],   r: '🏨 **Transit Hotel AirInn**: Terminal B, Level 3. Book from 3 hours to overnight.' },
  { p: ['prayer','mosque','temple','chapel','worship'], r: '🙏 **Prayer Room**: Terminal B, Level 2, near Gate B14. Open 24/7 for all faiths.' },
  { p: ['luggage storage','store bag','left luggage'], r: '🧳 **Luggage Storage**: Terminal A & B, Level 1. ₹100/bag/hour. Open 24/7.' },
  { p: ['hi','hello','hey','help','helo','start'],  r: '👋 Hi! I\'m **AirAssist**. I can help with flights, check-in, lounges, dining, transport, and more. What do you need?' },
];

const getFallbackResponse = (input) => {
  const lower = input.toLowerCase();
  for (const { p, r } of FALLBACK_RULES) {
    if (p.some((kw) => lower.includes(kw))) return r;
  }
  // Generic helpful response instead of dead-end
  return `I can help you with:\n✈️ **Flights** — search, status, check-in\n🏢 **Terminals** — navigation, gates, maps\n🍽️ **Dining** — restaurants, cafes, lounges\n🚌 **Transport** — taxi, metro, parking\n🏥 **Services** — medical, ATM, hotel, Wi-Fi\n\nTry asking something like "where can I eat?" or "how do I get to Terminal B?"`;
};

// ─── Flight Number Lookup ─────────────────────────────────────────────────────
const FLIGHT_REGEX = /\b([A-Z]{1,3}\d{1,4})\b/i;

const lookupFlight = async (message) => {
  const match = message.match(FLIGHT_REGEX);
  if (!match) return null;
  const flight = await Flight.findOne({ flightNumber: match[1].toUpperCase() }).lean();
  if (!flight) return null;

  const fmt = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
  const emoji = { 'On Time':'🟢','Delayed':'🟡','Cancelled':'🔴','Boarding':'🔵','Departed':'✅','Arrived':'🏁' };
  return `${emoji[flight.flightStatus]||'⚪'} **Flight ${flight.flightNumber}** (${flight.airlineName})\n`
    + `📍 ${flight.sourceAirport} → ${flight.destinationAirport}\n`
    + `🕐 Dep: **${fmt(flight.departureTime)}** | Arr: ${fmt(flight.arrivalTime)}\n`
    + `🏢 Terminal: **${flight.terminal}** | Gate: **${flight.gate}**\n`
    + `📊 Status: **${flight.flightStatus}**`;
};

// ─── Send via Groq ────────────────────────────────────────────────────────────
const askGroq = async (client, systemPrompt, history, message) => {
  // Build OpenAI-style messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-16) // last 8 turns
      .map((m) => ({ role: m.role, content: m.text })),
    { role: 'user', content: message },
  ];

  const completion = await client.chat.completions.create({
    model:       'llama-3.3-70b-versatile',  // Best free Groq model
    messages,
    max_tokens:  400,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || '';
};

// ─── Send via Gemini ──────────────────────────────────────────────────────────
const askGemini = async (client, systemPrompt, history, message) => {
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
  });

  const geminiHistory = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-16)
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }));

  const chat   = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
};

// ─── Main Controller ──────────────────────────────────────────────────────────
/**
 * POST /api/chat
 * Priority:  1. Flight DB lookup  →  2. Groq LLM  →  3. Gemini LLM  →  4. Rule-based
 */
const chatController = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }
    const text = message.trim();

    // ── 1. Live flight lookup ────────────────────────────────────────────────
    const flightReply = await lookupFlight(text);
    if (flightReply) {
      return res.json({ success: true, reply: flightReply, mode: 'flight-lookup' });
    }

    // ── Build shared context ─────────────────────────────────────────────────
    const { flightLines, serviceLines } = await buildAirportContext();
    const systemPrompt = buildSystemPrompt(flightLines, serviceLines, req.user?.name);

    // ── 2. Try Groq (primary) ────────────────────────────────────────────────
    const groq = getGroqClient();
    if (groq) {
      try {
        const reply = await askGroq(groq, systemPrompt, history, text);
        console.log(`[Groq ✓] "${text.slice(0, 50)}"`);
        return res.json({ success: true, reply, mode: 'groq' });
      } catch (groqErr) {
        console.error('[Groq Error]', groqErr.message?.slice(0, 120));
        // Fall through to Gemini
      }
    }

    // ── 3. Try Gemini (secondary) ────────────────────────────────────────────
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const reply = await askGemini(gemini, systemPrompt, history, text);
        console.log(`[Gemini ✓] "${text.slice(0, 50)}"`);
        return res.json({ success: true, reply, mode: 'gemini' });
      } catch (geminiErr) {
        console.error('[Gemini Error]', geminiErr.message?.slice(0, 120));
        // Fall through to rule-based
      }
    }

    // ── 4. Rule-based fallback ───────────────────────────────────────────────
    const reply = getFallbackResponse(text);
    return res.json({ success: true, reply, mode: 'rule-based' });

  } catch (error) {
    next(error);
  }
};

module.exports = { chatController };
