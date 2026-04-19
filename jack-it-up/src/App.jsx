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

// ── END OF PART 1 ── (LoginScreen and beyond follow in Part 2)
