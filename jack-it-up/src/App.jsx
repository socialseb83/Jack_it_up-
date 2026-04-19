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

// ── END OF PART 2 ── (DashboardTab and beyond follow in Part 3)
