// ============================================================
// App.jsx — Jack-it-UP! v2.0
// Stephen F. Austin State University · Student Success Platform
//
// SETUP:
//   1. npm install (React 18+)
//   2. Copy IMG_5591.png → src/assets/shaniqua.png
//   3. Copy IMG_5589.png → src/assets/hero.png
//   4. Set GAS_URL constant after deploying GoogleAppsScript_Backend.gs
//   5. npm start
//
// FILE STRUCTURE:
//   src/
//   ├── App.jsx              ← This file
//   ├── ShaniquaChat.jsx     ← AI Mentor Chat (copy separately)
//   └── assets/
//       ├── shaniqua.png     ← Copy from IMG_5591.png
//       └── hero.png         ← Copy from IMG_5589.png
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import ShaniquaChat from "./ShaniquaChat";
import shaniquaAvatar from "./assets/shaniqua.png";
import heroBanner from "./assets/hero.png";

// ── Replace with your deployed GAS Web App URL ─────────────
const GAS_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

// ── SFA Brand ───────────────────────────────────────────────
const C = {
  purple:    "#4B1869",
  dark:      "#2D0E40",
  light:     "#7B3FA0",
  gold:      "#C8A951",
  goldLight: "#E2C97A",
  lavender:  "#F0E8FA",
  ink:       "#1A0A2E",
  green:     "#16a34a",
  red:       "#dc2626",
  bg:        "#F5F0FA",
};

// ── Purple Promise Rules ────────────────────────────────────
const PP = {
  minGPA: 2.5, minCredits: 15, minCreditsYear: 30,
  fullTimeMin: 12, ncaaMinGPA: 2.5, studyHallHrs: 8,
};

// ── XP Table ────────────────────────────────────────────────
const XP_TABLE = {
  study_session: 50, gym_visit: 30, dorm_hack: 20,
  academic_ack: 10, week_streak: 100, register_sim: 25,
  club_check: 15, safe_ride_used: 5,
};

// ── Badges ──────────────────────────────────────────────────
const ALL_BADGES = [
  { id:"first_jack",  icon:"🪓", name:"First Lumberjack",      desc:"Logged in for the first time",          xpReq:0,    notifyParent:false },
  { id:"scholar",     icon:"📚", name:"Scholar Mode",           desc:"Maintained 3.5+ GPA this semester",     xpReq:200,  notifyParent:true  },
  { id:"grind_queen", icon:"⚡", name:"Grind Queen",            desc:"5 study sessions in one week",          xpReq:300,  notifyParent:true  },
  { id:"iron_jack",   icon:"💪", name:"Iron Lumberjack",        desc:"Logged 5 gym visits",                   xpReq:200,  notifyParent:false },
  { id:"pp_guardian", icon:"💜", name:"Purple Promise Guardian",desc:"All scholarship rules met — 100%",      xpReq:250,  notifyParent:true  },
  { id:"social_fly",  icon:"🦋", name:"Social Butterfly",       desc:"Checked into 3 clubs or events",        xpReq:150,  notifyParent:false },
  { id:"dorm_boss",   icon:"🏠", name:"Dorm Life Boss",         desc:"Completed all 5 Dorm Life Hacks",       xpReq:100,  notifyParent:true  },
  { id:"tea_queen",   icon:"☕", name:"Tea Queen",              desc:"Acknowledged all academic alerts 10×",  xpReq:100,  notifyParent:false },
  { id:"ncaa_safe",   icon:"🏆", name:"NCAA Safe",              desc:"All NCAA compliance boxes checked",     xpReq:300,  notifyParent:true  },
  { id:"centurion",   icon:"💎", name:"Centurion",              desc:"Earned 1000 total Lumberjack XP",       xpReq:1000, notifyParent:true  },
];

// ── Dorm Life Hacks ─────────────────────────────────────────
const INITIAL_DORM_HACKS = [
  { id:"laundry", icon:"👚", title:"Laundry Day",         desc:"Sort whites/darks, cold water, don't over-stuff. Pro tip: go at 7 AM — zero wait for machines.", done:false },
  { id:"maint",   icon:"🔧", title:"Maintenance Request", desc:"Broken AC? Clogged drain? Submit at sfasu.edu/housing — usually fixed in 24–48 hrs.",            done:false },
  { id:"cooking", icon:"🍳", title:"Microwave Cooking",   desc:"Scrambled eggs in 90 sec: 2 eggs + splash of milk in a mug. Microwave 1 min, stir, 30 more sec.",done:false },
  { id:"budget",  icon:"💰", title:"$20 Grocery Run",     desc:"Walmart on North St: eggs, oats, peanut butter, bananas. Full week of fuel for $20.",             done:false },
  { id:"sleep",   icon:"😴", title:"Sleep Ritual",        desc:"Phone DND at 10:30 PM. Blackout curtains + fan noise = exam memory boost. Non-negotiable.",        done:false },
];

// ── Professor Pre-Reg Data ──────────────────────────────────
const PROFESSORS = [
  { id:1, name:"Dr. Elena Martinez",   course:"MATH 1314", dept:"MATH", rating:4.8, diff:2.1, gpaD:"+0.3", safe:true,  tags:["Clear grader","Extra credit","Flexible"]        },
  { id:2, name:"Dr. Kevin Johnson",    course:"BIOL 1301", dept:"BIOL", rating:3.2, diff:4.5, gpaD:"-0.4", safe:false, tags:["Hard exams","Rare curves","Heavy load"]          },
  { id:3, name:"Prof. Aisha Williams", course:"ENG 1301",  dept:"ENG",  rating:4.6, diff:2.8, gpaD:"+0.2", safe:true,  tags:["Great feedback","Flexible","Discussion"]         },
  { id:4, name:"Dr. James Chen",       course:"HIST 1301", dept:"HIST", rating:4.9, diff:2.0, gpaD:"+0.4", safe:true,  tags:["Best prof","Engaging","Fair tests"]              },
  { id:5, name:"Dr. Beth Thompson",    course:"PSYC 2301", dept:"PSYC", rating:2.8, diff:4.8, gpaD:"-0.6", safe:false, tags:["Very hard","Pop quizzes","No curves"]            },
  { id:6, name:"Prof. Marcus Davis",   course:"KINE 1100", dept:"KINE", rating:4.7, diff:1.5, gpaD:"+0.5", safe:true,  tags:["Easy A","Fun","Attendance-based"]                },
  { id:7, name:"Dr. Sofia Garcia",     course:"COMM 1315", dept:"COMM", rating:4.3, diff:3.0, gpaD:"+0.1", safe:true,  tags:["Group projects","Good feedback","Presentations"] },
  { id:8, name:"Dr. Ravi Patel",       course:"CHEM 1305", dept:"CHEM", rating:2.5, diff:5.0, gpaD:"-0.8", safe:false, tags:["Hardest class","No partial credit","Heavy math"] },
];

// ── Clubs ───────────────────────────────────────────────────
const CLUBS = [
  { id:1, name:"Lumberjack Pep Squad",  cat:"Spirit",        day:"Tue", time:"6:00 PM",  desc:"Free spirit gear. Loud and proud."           },
  { id:2, name:"Women in STEM",         cat:"Academic",      day:"Wed", time:"5:00 PM",  desc:"Research ops, mentorship, networking."        },
  { id:3, name:"SFA Step Team",         cat:"Cultural",      day:"Mon", time:"7:00 PM",  desc:"High-energy. All levels welcome."             },
  { id:4, name:"Yoga & Mindfulness",    cat:"Wellness",      day:"Thu", time:"8:00 AM",  desc:"Morning sessions at Reflection Pond."         },
  { id:5, name:"Black Student Union",   cat:"Cultural",      day:"Wed", time:"6:30 PM",  desc:"Community, empowerment, campus events."       },
  { id:6, name:"Pre-Law Society",       cat:"Academic",      day:"Fri", time:"12:00 PM", desc:"LSAT prep, internships, guest speakers."      },
  { id:7, name:"Intramural Volleyball", cat:"Sports",        day:"Tue", time:"8:00 PM",  desc:"Co-ed leagues at the SFA Rec Center."        },
  { id:8, name:"Esports & Gaming",      cat:"Entertainment", day:"Sat", time:"2:00 PM",  desc:"Ranked and casual. Solo or team sign-up."    },
];

// ── Workout Split ───────────────────────────────────────────
const WORKOUTS = [
  { icon:"🍑", day:"Day 1", title:"Lower Body A",    sub:"Glutes & Hamstrings",
    moves:["Back Squats 3×8–10","Hip Thrusts 4×12","Romanian Deadlifts 3×10","Glute Bridges 3×15","Isometric Hold 30 sec"],
    tip:"Visualize the glute contracting on every rep. Don't just move the weight — FEEL it." },
  { icon:"💪", day:"Day 2", title:"Upper Body",       sub:"Shoulders, Back & Arms",
    moves:["Military Press 3×10","Lateral Raises 4×15","Lat Pulldowns 3×12","Bicep Curls 3×12","Tricep Pushdowns 3×15"],
    tip:"Build the V-taper. Wide shoulders make the waist look smaller — Arnold's secret." },
  { icon:"🧘‍♀️",day:"Day 3", title:"Active Recovery", sub:"Rest & Rebuild",
    moves:["Yoga Flow 30 min","Walk Reflection Pond","Intramural Volleyball","Foam Roll Full Body","Stretch & Mobility"],
    tip:"Muscle grows while you sleep, not while you're in the gym. Rest is training." },
  { icon:"🦵", day:"Day 4", title:"Lower Body B",    sub:"Quads & Calves",
    moves:["Leg Extensions 4×15–20","Goblet Squats 3×12","Walking Lunges 3×20 steps","Calf Raises 4×20","Wall Sit 60 sec"],
    tip:"High volume etches the muscle. Control the negative rep — slow it DOWN." },
  { icon:"⚡", day:"Day 5", title:"Full Body Shock",  sub:"Circuit + Core",
    moves:["Burpees 3×10","Kettlebell Swings 3×15","Plank 3×60 sec","Mountain Climbers 3×20","Dead Bug 3×10 each side"],
    tip:"Shock the muscle monthly — change the order, slow the tempo, keep your body guessing." },
];

// ── 3-Hour Proactive Pings ──────────────────────────────────
const PINGS = [
  { text:"Hey bestie 👋 Did you get your study block in today? Even 25 minutes of Active Recall changes your exam results. Go! 📚",    tag:"study"   },
  { text:"💰 Financial tip: SFA has a $500 emergency fund — no-questions-asked money most students don't know about. sfasu.edu/financial-aid", tag:"finance"  },
  { text:"💜 GPA check: If it's below 3.0, book office hours THIS week. Free tutoring at the JTAC. Not next week — THIS week, sis.", tag:"academic" },
  { text:"🌙 Sleep check! 7-9 hrs is your secret weapon for memory consolidation. Don't trade it for Netflix tonight, bestie.",        tag:"wellness" },
  { text:"⚡ Priority check: What's your #1 task RIGHT NOW? If you have something due in 48 hrs — that's your answer. Handle it.",     tag:"priority" },
];

// ── Shared Pill Component ───────────────────────────────────
const Pill = ({ label, color = C.purple, bg = "#F3E8FF", style = {} }) => (
  <span style={{ background:bg, color, fontFamily:"'DM Sans',sans-serif", fontSize:"10px", fontWeight:700, padding:"2px 8px", borderRadius:"20px", letterSpacing:"0.6px", textTransform:"uppercase", whiteSpace:"nowrap", ...style }}>
    {label}
  </span>
);

// ============================================================
// WEBAUTHN UTILITIES
// ============================================================
const webAuthn = {
  isSupported: () => typeof window !== "undefined" && !!window.PublicKeyCredential,

  async register(username) {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId    = new TextEncoder().encode(username);
    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name:"Jack-it-UP!", id:window.location.hostname },
          user: { id:userId, name:username, displayName:username },
          pubKeyCredParams: [{ alg:-7, type:"public-key" }, { alg:-257, type:"public-key" }],
          authenticatorSelection: { authenticatorAttachment:"platform", userVerification:"required", residentKey:"preferred" },
          timeout: 60000,
        }
      });
      if (!cred) return false;
      const rawId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
      localStorage.setItem("ll_credId", rawId);
      localStorage.setItem("ll_username", username);
      return true;
    } catch { return false; }
  },

  async authenticate() {
    const rawId = localStorage.getItem("ll_credId");
    if (!rawId) return false;
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    try {
      const credId    = Uint8Array.from(atob(rawId), c => c.charCodeAt(0));
      const assertion = await navigator.credentials.get({
        publicKey: { challenge, allowCredentials:[{ id:credId, type:"public-key" }], userVerification:"required", timeout:60000 }
      });
      return !!assertion;
    } catch { return false; }
  },

  hasRegistered:    () => !!localStorage.getItem("ll_credId"),
  getSavedUsername: () => localStorage.getItem("ll_username") || "",
  clear:            () => { localStorage.removeItem("ll_credId"); localStorage.removeItem("ll_username"); },
};

// ============================================================
// COMPONENT: LOGIN SCREEN
// ============================================================
function LoginScreen({ onLogin }) {
  const [phase, setPhase]     = useState("landing"); // landing | register | pin
  const [name, setName]       = useState("");
  const [sid, setSid]         = useState("");
  const [parent, setParent]   = useState("");
  const [pin, setPin]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const hasReg = webAuthn.hasRegistered();

  const doRegister = async () => {
    if (!name.trim() || !sid.trim()) { setError("Name and Student ID are required."); return; }
    setLoading(true); setError("");
    const ok = await webAuthn.register(`${sid}_${name.replace(/\s+/g,"_")}`);
    if (ok) {
      localStorage.setItem("ll_sid", sid);
      localStorage.setItem("ll_displayName", name);
      localStorage.setItem("ll_parentEmail", parent);
      onLogin({ name, studentId:sid, parentEmail:parent });
    } else {
      setError("Biometric unavailable on this device. Set a PIN instead.");
      setPhase("pin");
    }
    setLoading(false);
  };

  const doAuth = async () => {
    setLoading(true); setError("");
    const ok = await webAuthn.authenticate();
    if (ok) {
      onLogin({
        name:        localStorage.getItem("ll_displayName") || "Lumberjack",
        studentId:   localStorage.getItem("ll_sid")         || "demo",
        parentEmail: localStorage.getItem("ll_parentEmail") || "",
      });
    } else {
      setError("Biometric failed. Use PIN.");
      setPhase("pin");
    }
    setLoading(false);
  };

  const doPinLogin = () => {
    const saved = localStorage.getItem("ll_pin");
    if (!saved) {
      localStorage.setItem("ll_pin", pin);
      localStorage.setItem("ll_sid", sid || "demo");
      localStorage.setItem("ll_displayName", name || "Lumberjack");
      onLogin({ name:name||"Lumberjack", studentId:sid||"demo", parentEmail:parent });
      return;
    }
    if (pin === saved) onLogin({
      name:        localStorage.getItem("ll_displayName") || "Lumberjack",
      studentId:   localStorage.getItem("ll_sid")         || "demo",
      parentEmail: localStorage.getItem("ll_parentEmail") || "",
    });
    else setError("Incorrect PIN.");
  };

  const demoLogin = () => onLogin({ name:"Jasmine T.", studentId:"SFA2026001", parentEmail:"", isDemo:true });

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(150deg,${C.ink} 0%,${C.dark} 35%,${C.purple} 70%,#7B2FBE 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700;800&display=swap');
        @keyframes floatIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(200,169,81,0.3)} 50%{box-shadow:0 0 40px rgba(200,169,81,0.6)} }
        .lf-input { width:100%; border:1.5px solid rgba(255,255,255,0.2); border-radius:12px; padding:13px 16px; background:rgba(255,255,255,0.1); color:#fff; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; box-sizing:border-box; transition:border-color 0.2s; }
        .lf-input::placeholder { color:rgba(255,255,255,0.4); }
        .lf-input:focus { border-color:${C.gold}; }
        .lf-btn { width:100%; border:none; border-radius:14px; padding:14px; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:800; font-size:14px; letter-spacing:0.4px; transition:all 0.2s; }
        .lf-btn:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
        .lf-btn:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>

      <div style={{ width:"100%", maxWidth:"420px", animation:"floatIn 0.5s ease-out" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ background:C.gold, display:"inline-block", borderRadius:"16px", padding:"10px 22px", marginBottom:"14px", animation:"glow 3s ease-in-out infinite" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"22px", color:C.dark }}>🪓 Jack-it-UP!</span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"12px", margin:0, letterSpacing:"2px", textTransform:"uppercase" }}>Stephen F. Austin State University</p>
        </div>

        {/* Shaniqua chip */}
        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:"16px", padding:"14px 18px", marginBottom:"22px", display:"flex", alignItems:"center", gap:"12px", border:"1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ width:"44px", height:"44px", borderRadius:"50%", overflow:"hidden", border:`2.5px solid ${C.gold}`, flexShrink:0 }}>
            <img src={shaniquaAvatar} alt="Shaniqua" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
          </div>
          <div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:C.goldLight, margin:0, fontWeight:700 }}>Shaniqua's got you! 💜</p>
            <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.55)", margin:0, lineHeight:1.5 }}>Your AI mentor, scholarship tracker, and campus guide — all in one.</p>
          </div>
        </div>

        {/* Auth Card */}
        <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:"20px", padding:"26px", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(10px)" }}>

          {/* LANDING */}
          {phase === "landing" && (
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:"20px", margin:"0 0 18px", textAlign:"center", fontWeight:900 }}>
                {hasReg ? "Welcome Back 🪓" : "Create Your Account"}
              </h2>
              {!hasReg && (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"14px" }}>
                  <input className="lf-input" placeholder="Full Name"                          value={name}   onChange={e=>setName(e.target.value)}   />
                  <input className="lf-input" placeholder="SFA Student ID"                     value={sid}    onChange={e=>setSid(e.target.value)}    />
                  <input className="lf-input" type="email" placeholder="Parent Email (for badge alerts)" value={parent} onChange={e=>setParent(e.target.value)} />
                </div>
              )}
              {hasReg && <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"13px", textAlign:"center", marginBottom:"18px" }}>Use your device biometric to log in instantly.</p>}
              <button onClick={hasReg ? doAuth : () => setPhase("register")} disabled={loading} className="lf-btn"
                style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, color:C.dark, marginBottom:"10px" }}>
                {loading ? "Authenticating..." : hasReg ? "🔐 FaceID / TouchID Login" : "Continue →"}
              </button>
              <button onClick={() => setPhase("pin")} className="lf-btn"
                style={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.75)", marginBottom:"10px" }}>
                {hasReg ? "Use PIN" : "Skip Biometric — Use PIN"}
              </button>
              <button onClick={demoLogin} className="lf-btn"
                style={{ background:"transparent", color:"rgba(255,255,255,0.4)", border:"1px dashed rgba(255,255,255,0.2)" }}>
                Demo Mode (No Account)
              </button>
              {hasReg && (
                <div style={{ textAlign:"center", marginTop:"14px" }}>
                  <button onClick={() => { webAuthn.clear(); setPhase("landing"); window.location.reload(); }}
                    style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:"11px", cursor:"pointer", textDecoration:"underline" }}>
                    New student? Start over
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BIOMETRIC REGISTER */}
          {phase === "register" && (
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:"48px", margin:"0 0 10px" }}>🔐</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:"19px", margin:"0 0 10px", fontWeight:900 }}>Enable Biometric Login</h2>
              <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"12px", margin:"0 0 20px", lineHeight:1.6 }}>
                FaceID or TouchID — instant, secure access. Your biometric data never leaves your device.
              </p>
              <button onClick={doRegister} disabled={loading} className="lf-btn"
                style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, color:C.dark, marginBottom:"10px" }}>
                {loading ? "Setting Up..." : "✨ Enable FaceID / TouchID"}
              </button>
              <button onClick={() => setPhase("pin")} className="lf-btn"
                style={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)" }}>
                Set PIN Instead
              </button>
            </div>
          )}

          {/* PIN */}
          {phase === "pin" && (
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:"19px", margin:"0 0 14px", textAlign:"center", fontWeight:900 }}>
                {localStorage.getItem("ll_pin") ? "Enter PIN" : "Create 4-Digit PIN"}
              </h2>
              {!localStorage.getItem("ll_pin") && (
                <>
                  <input className="lf-input" placeholder="Your name"      value={name} onChange={e=>setName(e.target.value)} style={{ marginBottom:"10px" }} />
                  <input className="lf-input" placeholder="SFA Student ID" value={sid}  onChange={e=>setSid(e.target.value)}  style={{ marginBottom:"10px" }} />
                </>
              )}
              <input className="lf-input" type="password" maxLength={4} inputMode="numeric" placeholder="• • • •"
                style={{ textAlign:"center", fontSize:"26px", letterSpacing:"10px", marginBottom:"14px" }}
                value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))} />
              <button onClick={doPinLogin} className="lf-btn"
                style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, color:C.dark }}>
                {localStorage.getItem("ll_pin") ? "Log In →" : "Set PIN & Enter →"}
              </button>
            </div>
          )}

          {error && <p style={{ color:"#fca5a5", fontSize:"12px", textAlign:"center", marginTop:"12px", fontWeight:600 }}>⚠️ {error}</p>}
        </div>

        <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"10px", textAlign:"center", marginTop:"18px", lineHeight:1.6 }}>
          Stephen F. Austin State University · Nacogdoches, TX<br />
          UPD Safe Ride: (936) 468-2608 · Available 24/7
        </p>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT: XP SYSTEM HEADER CARD
// ============================================================
function XPSystem({ xp, badges }) {
  const level   = Math.floor(xp / 100) + 1;
  const inLevel = xp % 100;
  return (
    <div style={{ background:`linear-gradient(135deg,${C.dark},${C.purple})`, borderRadius:"16px", padding:"18px 22px", marginBottom:"20px", boxShadow:`0 8px 32px rgba(75,24,105,0.25)` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
        <div>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:900, color:C.gold, margin:0 }}>Level {level} Lumberjack</p>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.5)", margin:0 }}>{xp} XP total · {inLevel}/100 to Level {level+1}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", fontWeight:900, color:"#fff", margin:0 }}>{xp}</p>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9px", color:`${C.gold}80`, margin:0, letterSpacing:"1.5px" }}>LUMBERJACK XP</p>
        </div>
      </div>
      <div style={{ height:"8px", background:"rgba(255,255,255,0.12)", borderRadius:"4px", overflow:"hidden", marginBottom:"14px" }}>
        <div style={{ width:`${inLevel}%`, height:"100%", background:`linear-gradient(90deg,${C.gold},${C.goldLight})`, borderRadius:"4px", transition:"width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </div>
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
        {ALL_BADGES.filter(b=>badges.includes(b.id)).map(b=>(
          <div key={b.id} title={b.desc} style={{ background:"rgba(200,169,81,0.18)", border:`1px solid ${C.gold}55`, borderRadius:"8px", padding:"4px 10px", display:"flex", alignItems:"center", gap:"5px" }}>
            <span style={{ fontSize:"13px" }}>{b.icon}</span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"10px", color:C.goldLight, fontWeight:700 }}>{b.name}</span>
          </div>
        ))}
        {badges.length === 0 && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px", color:"rgba(255,255,255,0.4)", margin:0 }}>Complete a study session to earn your first badge! (+50 XP)</p>}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT: HEADER
// ============================================================
function Header({ user, athlete, setAthlete, vibe, setVibe, safeRide, onSafeRide, xp, onLogout }) {
  const level = Math.floor(xp / 100) + 1;
  return (
    <header style={{ background:`linear-gradient(135deg,${C.ink} 0%,${C.dark} 50%,${C.purple} 100%)`, borderBottom:`3px solid ${C.gold}`, position:"sticky", top:0, zIndex:999, boxShadow:"0 4px 24px rgba(26,10,46,0.5)" }}>
      <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"0 16px" }}>
        {/* Digital ID strip */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(200,169,81,0.2)", flexWrap:"wrap", gap:"6px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ background:C.gold, borderRadius:"8px", padding:"3px 12px", display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ fontSize:"13px" }}>🪓</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, color:C.dark, fontSize:"11px", letterSpacing:"1px" }}>SFA DIGITAL ID</span>
            </div>
            <span style={{ fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.7)", fontSize:"11px" }}>{user.name} · {user.studentId} · Spring 2026</span>
            <span style={{ background:"rgba(255,255,255,0.1)", borderRadius:"6px", padding:"2px 8px", fontFamily:"'DM Sans',sans-serif", fontSize:"10px", color:C.gold, fontWeight:700 }}>Lv.{level} · {xp} XP</span>
          </div>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <button onClick={() => onSafeRide(!safeRide)}
              style={{ background:safeRide?"#16a34a":C.red, color:"#fff", border:"none", borderRadius:"8px", padding:"5px 14px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"11px", transition:"background 0.2s" }}>
              🚗 {safeRide ? "SAFE RIDE ACTIVE" : "SAFE RIDE"}
            </button>
            <button onClick={onLogout} style={{ background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"8px", padding:"5px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.45)" }}>
              Log Out
            </button>
          </div>
        </div>
        {/* Nav row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", flexWrap:"wrap", gap:"10px" }}>
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, color:"#fff", fontSize:"22px", margin:0 }}>Jack-it-<span style={{ color:C.gold }}>UP!</span></h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif", color:`${C.gold}70`, fontSize:"9px", margin:0, letterSpacing:"2.5px", textTransform:"uppercase" }}>SFA Student Success Platform {user.isDemo ? "· Demo" : ""}</p>
          </div>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:"12px", padding:"4px", display:"flex" }}>
              {[["beast","⚡ BEAST"],["social","🎉 SOCIAL"]].map(([id,lbl])=>(
                <button key={id} onClick={()=>setVibe(id)}
                  style={{ background:vibe===id?C.gold:"transparent", color:vibe===id?C.dark:"rgba(255,255,255,0.55)", border:"none", borderRadius:"9px", padding:"7px 14px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"12px", transition:"all 0.2s" }}>
                  {lbl}
                </button>
              ))}
            </div>
            <button onClick={()=>setAthlete(a=>!a)}
              style={{ background:athlete?C.gold:"rgba(255,255,255,0.08)", color:athlete?C.dark:"#fff", border:`1px solid ${athlete?C.gold:"rgba(255,255,255,0.2)"}`, borderRadius:"10px", padding:"7px 14px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"12px", transition:"all 0.2s" }}>
              🏆 {athlete ? "ATHLETE ✓" : "ATHLETE"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// COMPONENT: NOTIFICATION MODAL
// ============================================================
function NotifModal({ notif, onDismiss, onXP }) {
  if (!notif) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,10,46,0.8)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:"20px", backdropFilter:"blur(4px)" }}>
      <style>{"@keyframes slideUp2{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}"}</style>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"24px", width:"100%", maxWidth:"440px", animation:"slideUp2 0.3s ease-out", boxShadow:"0 -8px 48px rgba(75,24,105,0.35)" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:"14px", marginBottom:"18px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"50%", overflow:"hidden", border:`2.5px solid ${C.gold}`, flexShrink:0 }}>
            <img src={shaniquaAvatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"15px", color:C.dark, margin:"0 0 6px" }}>Shaniqua — 3-Hour Check-In</p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14px", color:"#374151", margin:0, lineHeight:1.6 }}>{notif.text}</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={()=>{ onXP(XP_TABLE.study_session,"Check-in acknowledged"); onDismiss(); }}
            style={{ flex:1, background:`linear-gradient(135deg,${C.purple},${C.dark})`, color:"#fff", border:"none", borderRadius:"12px", padding:"12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"13px" }}>
            ✓ Handled It! +50 XP
          </button>
          <button onClick={onDismiss}
            style={{ background:"#F3E8FF", color:C.purple, border:"none", borderRadius:"12px", padding:"12px 18px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"13px" }}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT: DASHBOARD TAB
// ============================================================
function DashboardTab({ xp, badges, athlete, onEarnXP, dormHacks, setDormHacks }) {
  const toggleHack = (id) => {
    setDormHacks(prev => {
      const was = prev.find(h => h.id === id);
      if (!was?.done) onEarnXP(XP_TABLE.dorm_hack, `Dorm hack: ${was?.title}`);
      const updated = prev.map(h => h.id === id ? { ...h, done: !h.done } : h);
      if (updated.every(h => h.done) && !badges.includes("dorm_boss")) onEarnXP(100, "All Dorm Hacks complete! DORM BOSS!");
      return updated;
    });
  };

  const actions = [
    { label:"✅ Study Session Done",    amt:XP_TABLE.study_session },
    { label:"🏋️ Gym Visit Logged",      amt:XP_TABLE.gym_visit     },
    { label:"📋 Club Event Check-In",   amt:XP_TABLE.club_check    },
    { label:"🔮 Pre-Reg Simulator Used",amt:XP_TABLE.register_sim  },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

      {/* Hero Banner */}
      <div style={{ borderRadius:"20px", overflow:"hidden", position:"relative", boxShadow:"0 12px 48px rgba(26,10,46,0.45)", border:`2.5px solid ${C.gold}` }}>
        <img src={heroBanner} alt="Jack-it-UP! Your SFA Secret Weapon" style={{ width:"100%", display:"block", maxHeight:"340px", objectFit:"cover", objectPosition:"center top" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(to top, rgba(26,10,46,0.92) 0%, rgba(26,10,46,0.5) 60%, transparent 100%)", padding:"20px 24px 16px" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"26px", color:C.gold, margin:0, lineHeight:1.1, textShadow:"0 2px 12px rgba(0,0,0,0.6)" }}>
                Jack-it-<span style={{ color:"#fff" }}>UP!</span>
              </p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.7)", margin:"4px 0 0", letterSpacing:"2px", textTransform:"uppercase" }}>Your SFA Secret Weapon</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px" }}>
              <div style={{ background:C.gold, borderRadius:"10px", padding:"5px 14px", display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"18px", color:C.dark }}>{xp}</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9px", color:`${C.dark}99`, fontWeight:700, letterSpacing:"1.5px" }}>JACK XP</span>
              </div>
              <div style={{ display:"flex", gap:"4px" }}>
                {ALL_BADGES.filter(b => badges.includes(b.id)).slice(-4).map(b => (
                  <span key={b.id} title={b.name} style={{ fontSize:"16px", filter:"drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }}>{b.icon}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <XPSystem xp={xp} badges={badges} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>

        {/* Quick XP */}
        <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #E9D5FF", overflow:"hidden" }}>
          <div style={{ background:`linear-gradient(135deg,${C.dark},${C.purple})`, padding:"14px 20px" }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:"16px", margin:0, fontWeight:900 }}>⚡ Earn XP Today</h3>
            <p style={{ fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.5)", fontSize:"10px", margin:"2px 0 0", letterSpacing:"1px" }}>TAP TO LOG ACTIVITY</p>
          </div>
          <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:"8px" }}>
            {actions.map(a => (
              <button key={a.label} onClick={() => onEarnXP(a.amt, a.label)}
                style={{ background:"#F9F5FF", border:"1.5px solid #E9D5FF", borderRadius:"10px", padding:"12px 16px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", textAlign:"left", transition:"all 0.15s", fontFamily:"'DM Sans',sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.background="#F3E8FF"; e.currentTarget.style.borderColor=C.purple; }}
                onMouseLeave={e => { e.currentTarget.style.background="#F9F5FF"; e.currentTarget.style.borderColor="#E9D5FF"; }}>
                <span style={{ fontSize:"13px", color:C.dark, fontWeight:600 }}>{a.label}</span>
                <Pill label={`+${a.amt} XP`} color={C.dark} bg={C.gold} />
              </button>
            ))}
            {athlete && (
              <button onClick={() => onEarnXP(XP_TABLE.gym_visit, "Study Hall logged")}
                style={{ background:`${C.gold}15`, border:`1.5px solid ${C.gold}50`, borderRadius:"10px", padding:"12px 16px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", textAlign:"left" }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px", color:C.dark, fontWeight:600 }}>🏆 Study Hall Logged</span>
                <Pill label={`+${XP_TABLE.gym_visit} XP`} color={C.dark} bg={C.gold} />
              </button>
            )}
          </div>
        </div>

        {/* Badge Wall */}
        <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #E9D5FF", overflow:"hidden" }}>
          <div style={{ background:`linear-gradient(135deg,${C.gold},${C.goldLight})`, padding:"14px 20px" }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", color:C.dark, fontSize:"16px", margin:0, fontWeight:900 }}>🏅 Badge Collection</h3>
            <p style={{ fontFamily:"'DM Sans',sans-serif", color:`${C.dark}70`, fontSize:"10px", margin:"2px 0 0", letterSpacing:"1px" }}>{badges.length}/{ALL_BADGES.length} UNLOCKED</p>
          </div>
          <div style={{ padding:"14px", overflowY:"auto", maxHeight:"220px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
              {ALL_BADGES.map(b => {
                const earned = badges.includes(b.id);
                return (
                  <div key={b.id} title={b.desc} style={{ background:earned?"#F9F5FF":"#fafafa", border:`1.5px solid ${earned?"#E9D5FF":"#f0f0f0"}`, borderRadius:"10px", padding:"10px 12px", opacity:earned?1:0.45, transition:"all 0.2s" }}>
                    <p style={{ fontSize:"20px", margin:"0 0 4px" }}>{b.icon}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:700, color:earned?C.purple:"#9ca3af", margin:"0 0 2px" }}>{b.name}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9px", color:"#9ca3af", margin:0, lineHeight:1.4 }}>{b.desc}</p>
                    {b.notifyParent && earned && <Pill label="📧 Parent Notified" color="#16a34a" bg="#d1fae5" style={{ marginTop:"4px" }} />}
                    {!earned && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9px", color:C.gold, margin:"4px 0 0", fontWeight:700 }}>{b.xpReq} XP</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dorm Hacks */}
      <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #E9D5FF", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg,#0F4C81,#1565C0)`, padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:"16px", margin:0, fontWeight:900 }}>🏠 Dorm Life Hacks</h3>
            <p style={{ fontFamily:"'DM Sans',sans-serif", color:"rgba(255,255,255,0.55)", fontSize:"10px", margin:"2px 0 0" }}>+20 XP each · +100 bonus for all 5 · Tap to complete</p>
          </div>
          {dormHacks.every(h => h.done) && <Pill label="🏅 DORM BOSS!" color={C.dark} bg={C.gold} />}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
          {dormHacks.map((h, i) => (
            <div key={h.id} onClick={() => toggleHack(h.id)}
              style={{ padding:"16px 20px", cursor:"pointer", background:h.done?"#F0FDF4":"#fff", borderBottom:i<3?"1px solid #F3E8FF":"none", borderRight:i%2===0?"1px solid #F3E8FF":"none", transition:"background 0.2s", display:"flex", gap:"12px", alignItems:"flex-start" }}>
              <div style={{ width:"22px", height:"22px", borderRadius:"6px", border:`2px solid ${h.done?C.green:C.purple}`, background:h.done?C.green:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"2px", transition:"all 0.2s" }}>
                {h.done && <span style={{ color:"#fff", fontSize:"13px", fontWeight:900 }}>✓</span>}
              </div>
              <div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"13px", color:h.done?C.green:C.dark, margin:"0 0 3px" }}>{h.icon} {h.title}</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", color:"#6b7280", margin:0, lineHeight:1.5 }}>{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Science */}
      <div style={{ background:`linear-gradient(135deg,${C.ink},#1a2744)`, borderRadius:"16px", padding:"22px 26px" }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"10px", color:`${C.gold}80`, margin:"0 0 8px", letterSpacing:"1.5px", textTransform:"uppercase" }}>📊 5-Year Data (SFA 1101 Research)</p>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#fff", margin:"0 0 6px", fontWeight:700, lineHeight:1.4 }}>Active Recall outperforms re-reading by 50%+ on 30-day retention tests.</p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px", color:"rgba(255,255,255,0.55)", margin:"0 0 14px", lineHeight:1.7 }}>
          Close your notes. Ask yourself what you just learned. Answer out loud. Check your accuracy. Repeat.
          Combine with Spaced Repetition: review at Day 1 → Day 3 → Day 7 → Day 21 for permanent encoding.
        </p>
        <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
          {[["📖","Active Recall","50% better retention"],["⏳","Spaced Rep.","4× longer memory"],["😴","Sleep 7–9 hrs","GPA+0.5 average"],["🧠","Pomodoro 25/5","Peak focus cycles"]].map(([icon,key,val]) => (
            <div key={key} style={{ background:"rgba(255,255,255,0.06)", borderRadius:"10px", padding:"10px 14px", textAlign:"center" }}>
              <p style={{ fontSize:"20px", margin:"0 0 4px" }}>{icon}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:700, color:C.goldLight, margin:0 }}>{key}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"10px", color:"rgba(255,255,255,0.4)", margin:0 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ============================================================
// COMPONENT: SCHOLARSHIP TAB
// ============================================================
function ScholarshipTab({ athlete }) {
  const [gpa, setGpa]         = useState(3.1);
  const [credits, setCredits] = useState(15);
  const [picked, setPicked]   = useState([]);
  const [filter, setFilter]   = useState("all");
  const [showSim, setShowSim] = useState(false);

  const onTrack = gpa >= PP.minGPA && credits >= PP.minCredits;
  const projGpa = picked.length > 0
    ? parseFloat(Math.min(4.0, Math.max(0, gpa + picked.reduce((s, p) => s + parseFloat(p.gpaD), 0) / picked.length)).toFixed(2))
    : gpa;

  const toggleProf = p => setPicked(prev =>
    prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : prev.length < 5 ? [...prev, p] : prev
  );

  const vis = filter === "safe" ? PROFESSORS.filter(p => p.safe)
            : filter === "risky" ? PROFESSORS.filter(p => !p.safe)
            : PROFESSORS;

  const rules = [
    ["GPA ≥ 2.5",            gpa >= PP.minGPA,       `${gpa.toFixed(2)}`],
    ["15+ Credit Hrs/Sem",   credits >= PP.minCredits,`${credits} hrs`],
    ["Full-Time Enrolled",   credits >= PP.fullTimeMin, credits >= 12 ? "Full-time" : "Part-time"],
    ["No Incomplete Grades", true, "0 flagged"],
    ...(athlete ? [
      ["NCAA GPA ≥ 2.5",    gpa >= PP.ncaaMinGPA, `${gpa.toFixed(2)}`],
      ["Study Hall 8hr/wk", false, "Track in Dashboard"],
    ] : []),
  ];

  const r = 40, circ = 2 * Math.PI * r, fill = Math.min(gpa / 4, 1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

      {/* Purple Promise Engine */}
      <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #E9D5FF", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg,${C.dark},${C.purple})`, padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#fff", fontSize:"20px", margin:"0 0 2px", fontWeight:900 }}>💜 Purple Promise Engine</h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", color:`${C.gold}90`, fontSize:"10px", margin:0, letterSpacing:"1.5px", textTransform:"uppercase" }}>Scholarship Safety Dashboard · SFA Financial Aid</p>
          </div>
          <Pill label={onTrack ? "✓ SAFE" : "⚠ AT RISK"} color={onTrack ? "#fff" : C.dark} bg={onTrack ? C.green : C.red} />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:"24px", padding:"24px", alignItems:"start" }}>

          {/* GPA Ring */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={r} fill="none" stroke="#E9D5FF" strokeWidth="10" />
              <circle cx="50" cy="50" r={r} fill="none" stroke={gpa >= PP.minGPA ? C.gold : C.red} strokeWidth="10"
                strokeDasharray={`${circ * fill} ${circ * (1 - fill)}`} strokeLinecap="round" transform="rotate(-90 50 50)"
                style={{ transition:"stroke-dasharray 0.7s ease" }} />
              <text x="50" y="46" textAnchor="middle" fontSize="17" fontWeight="bold" fill={C.dark} fontFamily="Playfair Display,serif">{gpa.toFixed(2)}</text>
              <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="DM Sans,sans-serif">GPA</text>
            </svg>
            <input type="range" min={0} max={4} step={0.01} value={gpa} onChange={e => setGpa(parseFloat(e.target.value))} style={{ width:"90px", accentColor:C.purple }} />
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9px", color:"#9ca3af" }}>Drag to simulate</span>
          </div>

          {/* Credits + NCAA */}
          <div>
            <div style={{ background:"#F9F5FF", borderRadius:"12px", padding:"16px", marginBottom:"12px" }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"10px", color:"#9ca3af", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"1px" }}>Credit Hours This Semester</p>
              <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                <input type="number" min={1} max={21} value={credits} onChange={e => setCredits(parseInt(e.target.value) || 0)}
                  style={{ width:"60px", fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:900, color:C.purple, border:"none", background:"transparent", outline:"none" }} />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px", color:credits >= 15 ? C.green : C.red, fontWeight:700 }}>
                  {credits >= 15 ? "✓ Meets 15-hr rule" : `⚠ Need ${15 - credits} more hrs`}
                </span>
              </div>
            </div>
            {athlete && (
              <div style={{ background:`${C.gold}15`, border:`1px solid ${C.gold}40`, borderRadius:"12px", padding:"14px" }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:700, color:C.dark, margin:"0 0 10px" }}>🏆 NCAA COMPLIANCE OVERLAY</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                  {[["Study Hall","8 hrs/week"],["NCAA Min GPA","2.500"],["Credits/Year","24 minimum"],["Travel Days","Check Fridays"]].map(([k, v]) => (
                    <div key={k} style={{ background:"rgba(255,255,255,0.7)", borderRadius:"8px", padding:"8px 10px" }}>
                      <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", fontWeight:900, color:C.dark, margin:0 }}>{v}</p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9px", color:"#6b7280", margin:0, textTransform:"uppercase" }}>{k}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rules Panel */}
          <div style={{ background:onTrack ? "#f0fdf4" : "#fef2f2", border:`1px solid ${onTrack ? "#86efac" : "#fca5a5"}`, borderRadius:"12px", padding:"16px", minWidth:"210px" }}>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"13px", color:onTrack ? C.green : C.red, margin:"0 0 14px" }}>
              {onTrack ? "✅ Scholarship SAFE" : "❌ Scholarship AT RISK"}
            </p>
            {rules.map(([rule, ok, val]) => (
              <div key={rule} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"9px" }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px", color:"#374151" }}>{rule}</span>
                <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"10px", color:"#9ca3af" }}>{val}</span>
                  <span style={{ fontSize:"13px", color:ok ? C.green : C.red }}>{ok ? "✓" : "✗"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-Reg Simulator toggle */}
      <button onClick={() => setShowSim(s => !s)}
        style={{ background:`linear-gradient(135deg,${C.purple},${C.dark})`, color:"#fff", border:"none", borderRadius:"14px", padding:"16px 22px", cursor:"pointer", fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"17px", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span>🔮 Pre-Registration Simulator — Pick Scholarship-Safe Professors</span>
        <span style={{ fontSize:"18px" }}>{showSim ? "▲" : "▼"}</span>
      </button>

      {showSim && (
        <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #E9D5FF", padding:"24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
            {picked.length > 0 && (
              <div style={{ background:`linear-gradient(135deg,${C.purple},${C.dark})`, borderRadius:"12px", padding:"10px 18px", display:"flex", gap:"18px", alignItems:"center" }}>
                <div>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9px", color:"rgba(255,255,255,0.5)", margin:0, letterSpacing:"1.5px" }}>PROJECTED GPA</p>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", color:projGpa >= 2.5 ? C.gold : "#f87171", margin:0, fontWeight:900 }}>{projGpa}</p>
                </div>
                <Pill label={projGpa >= 2.5 ? "SCHOLARSHIP SAFE ✓" : "GPA AT RISK ✗"} color={projGpa >= 2.5 ? C.dark : "#fff"} bg={projGpa >= 2.5 ? C.gold : C.red} />
              </div>
            )}
            <div style={{ display:"flex", gap:"6px" }}>
              {[["all","All"],["safe","✅ Safe"],["risky","⚠️ Risky"]].map(([v, l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  style={{ background:filter === v ? C.purple : "#F3E8FF", color:filter === v ? "#fff" : C.purple, border:"none", borderRadius:"8px", padding:"6px 14px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"12px" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", maxHeight:"400px", overflowY:"auto" }}>
            {vis.map(prof => {
              const sel = !!picked.find(x => x.id === prof.id);
              return (
                <div key={prof.id} onClick={() => toggleProf(prof)}
                  style={{ border:`2px solid ${sel ? C.purple : prof.safe ? "#bbf7d0" : "#fecdd3"}`, borderRadius:"12px", padding:"14px", cursor:"pointer", background:sel ? "#F9F5FF" : "#fff", transition:"all 0.15s", position:"relative" }}>
                  <div style={{ position:"absolute", top:"10px", right:"10px" }}>
                    <Pill label={prof.safe ? "SAFE" : "RISKY"} color={prof.safe ? "#16a34a" : "#fff"} bg={prof.safe ? "#d1fae5" : C.red} />
                  </div>
                  {sel && (
                    <div style={{ position:"absolute", top:"10px", left:"10px", background:C.purple, borderRadius:"50%", width:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ color:"#fff", fontSize:"10px", fontWeight:900 }}>✓</span>
                    </div>
                  )}
                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"14px", color:C.dark, margin:"0 0 2px", paddingRight:"52px" }}>{prof.name}</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", color:"#6b7280", margin:"0 0 10px" }}>{prof.course}</p>
                  <div style={{ display:"flex", gap:"14px", marginBottom:"8px" }}>
                    {[["⭐", prof.rating, C.purple], ["🔥", prof.diff, prof.diff > 3.5 ? C.red : C.green], ["📈", prof.gpaD, parseFloat(prof.gpaD) >= 0 ? C.green : C.red]].map(([ic, v, col]) => (
                      <div key={ic} style={{ textAlign:"center" }}>
                        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", fontWeight:900, color:col, margin:0 }}>{v}</p>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9px", color:"#9ca3af", margin:0 }}>{ic}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
                    {prof.tags.map(t => (
                      <span key={t} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"10px", background:"#F3E8FF", color:C.purple, padding:"2px 6px", borderRadius:"4px" }}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
