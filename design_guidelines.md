{
  "product": {
    "name": "Memind",
    "tagline": "Preserve the human behind the memory loss.",
    "brand_attributes": [
      "premium",
      "futuristic medical AI",
      "calm + emotionally safe",
      "clinically credible",
      "investor-demo ready",
      "accessibility-first for patient"
    ],
    "design_style": {
      "default_mode": "dark",
      "aesthetic": [
        "futuristic medical cockpit",
        "glassmorphism",
        "soft neon accents",
        "rounded cards",
        "subtle motion",
        "AI status rings"
      ],
      "gradient_policy": {
        "rule": "Gradients are decorative only and must never exceed 20% of viewport. No saturated/dark gradient combos. No gradients on text-heavy areas or small UI elements (<100px).",
        "allowed_usage": [
          "hero/role switcher background overlay",
          "large section background accents",
          "large AI status halo behind key widgets",
          "decorative separators"
        ],
        "fallback": "If readability drops or gradient area grows, use solid surfaces with subtle noise + border highlights."
      }
    }
  },

  "inspiration_refs": {
    "visual_references": [
      {
        "type": "dribbble-search",
        "url": "https://dribbble.com/search/futuristic%20medical%20dashboard",
        "notes": "Use cockpit-like panels, neon edge highlights, dense but readable analytics blocks."
      },
      {
        "type": "website",
        "url": "https://www.calm.com",
        "notes": "Borrow calm pacing, generous spacing, and emotionally safe tone for Patient App (but keep Memind dark + premium)."
      }
    ],
    "design_fusion": "Layout principle from sci-fi cockpit dashboards (dense modular grid + left rail + top status bar) + Calm-like patient flow (single-task screens, large type, minimal choices) + clinical console typography discipline (numbers/metrics in mono-ish display font)."
  },

  "typography": {
    "font_pairing": {
      "display": {
        "name": "Space Grotesk",
        "google_fonts": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
        "usage": "Headings, navigation labels, AI module titles"
      },
      "body": {
        "name": "Inter",
        "google_fonts": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
        "usage": "Body text, forms, tables"
      },
      "metrics": {
        "name": "IBM Plex Mono",
        "google_fonts": "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap",
        "usage": "Vitals, timestamps, risk scores, chart axis labels"
      }
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-muted-foreground",
      "section_title": "text-lg md:text-xl font-semibold",
      "body": "text-sm md:text-base leading-relaxed",
      "small": "text-xs md:text-sm text-muted-foreground",
      "patient_large": {
        "primary": "text-2xl md:text-3xl font-semibold",
        "secondary": "text-lg md:text-xl",
        "helper": "text-base md:text-lg"
      }
    },
    "copy_tone": {
      "patient": "short sentences, reassuring, one instruction at a time",
      "caregiver": "empathetic but actionable; explain AI confidence",
      "doctor": "precise, clinical, avoids emotional language",
      "admin": "system-oriented, concise"
    }
  },

  "color_system": {
    "notes": "Dark mode default. Avoid purple-heavy gradients; violet is allowed only as a subtle accent (not gradient pair with pink). Primary accent is ocean-neon cyan; secondary is soft periwinkle-violet used sparingly for AI identity.",
    "tokens_hsl": {
      "dark": {
        "background": "222 35% 6%",
        "foreground": "210 40% 98%",
        "card": "222 35% 8%",
        "card-foreground": "210 40% 98%",
        "popover": "222 35% 8%",
        "popover-foreground": "210 40% 98%",
        "primary": "190 100% 55%",
        "primary-foreground": "222 35% 8%",
        "secondary": "222 25% 14%",
        "secondary-foreground": "210 40% 98%",
        "muted": "222 22% 12%",
        "muted-foreground": "215 20% 70%",
        "accent": "190 100% 55%",
        "accent-foreground": "222 35% 8%",
        "border": "215 25% 18%",
        "input": "215 25% 18%",
        "ring": "190 100% 55%",
        "destructive": "0 72% 52%",
        "destructive-foreground": "210 40% 98%",
        "success": "152 55% 45%",
        "warning": "38 92% 55%",
        "info": "205 90% 55%"
      }
    },
    "extended_tokens_hex": {
      "bg_0": "#070A12",
      "bg_1": "#0B1020",
      "panel": "rgba(255,255,255,0.06)",
      "panel_strong": "rgba(255,255,255,0.09)",
      "stroke": "rgba(255,255,255,0.10)",
      "stroke_strong": "rgba(0,212,255,0.35)",
      "accent_cyan": "#00D4FF",
      "accent_cyan_soft": "rgba(0,212,255,0.18)",
      "accent_violet_soft": "rgba(140,120,255,0.14)",
      "text_primary": "#EAF2FF",
      "text_muted": "rgba(234,242,255,0.72)",
      "danger": "#FF4D4D",
      "success": "#3DDC97",
      "warning": "#FFB020"
    },
    "allowed_gradients": [
      {
        "name": "cockpit-sheen",
        "css": "linear-gradient(135deg, rgba(0,212,255,0.14) 0%, rgba(140,120,255,0.10) 45%, rgba(255,255,255,0.00) 70%)",
        "usage": "Hero overlay / large background accent only"
      },
      {
        "name": "ai-halo",
        "css": "radial-gradient(closest-side, rgba(0,212,255,0.22), rgba(0,212,255,0.00) 70%)",
        "usage": "Behind AI avatar/ring widgets (large, subtle)"
      }
    ],
    "noise_texture": {
      "css_snippet": "background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px); background-size: 24px 24px;",
      "usage": "Apply to app shell backgrounds at 6–10% opacity via pseudo-element"
    }
  },

  "design_tokens_css": {
    "instructions": "Update /app/frontend/src/index.css :root and .dark tokens to match below. Keep Tailwind + shadcn variables. Add extra custom properties under :root and .dark.",
    "css": ":root {\n  --radius: 0.9rem;\n}\n.dark {\n  --background: 222 35% 6%;\n  --foreground: 210 40% 98%;\n  --card: 222 35% 8%;\n  --card-foreground: 210 40% 98%;\n  --popover: 222 35% 8%;\n  --popover-foreground: 210 40% 98%;\n  --primary: 190 100% 55%;\n  --primary-foreground: 222 35% 8%;\n  --secondary: 222 25% 14%;\n  --secondary-foreground: 210 40% 98%;\n  --muted: 222 22% 12%;\n  --muted-foreground: 215 20% 70%;\n  --accent: 190 100% 55%;\n  --accent-foreground: 222 35% 8%;\n  --destructive: 0 72% 52%;\n  --destructive-foreground: 210 40% 98%;\n  --border: 215 25% 18%;\n  --input: 215 25% 18%;\n  --ring: 190 100% 55%;\n  --chart-1: 190 100% 55%;\n  --chart-2: 152 55% 45%;\n  --chart-3: 38 92% 55%;\n  --chart-4: 205 90% 55%;\n  --chart-5: 260 70% 65%;\n\n  /* Memind extras */\n  --mm-bg-0: #070A12;\n  --mm-bg-1: #0B1020;\n  --mm-panel: rgba(255,255,255,0.06);\n  --mm-panel-strong: rgba(255,255,255,0.09);\n  --mm-stroke: rgba(255,255,255,0.10);\n  --mm-stroke-strong: rgba(0,212,255,0.35);\n  --mm-accent-cyan: #00D4FF;\n  --mm-accent-cyan-soft: rgba(0,212,255,0.18);\n  --mm-accent-violet-soft: rgba(140,120,255,0.14);\n  --mm-text-muted: rgba(234,242,255,0.72);\n  --mm-shadow-elev: 0 18px 60px rgba(0,0,0,0.45);\n  --mm-shadow-glow: 0 0 0 1px rgba(0,212,255,0.18), 0 18px 60px rgba(0,0,0,0.45);\n}\n"
  },

  "layout_system": {
    "app_shell": {
      "dashboards": {
        "pattern": "Left rail + top status bar + content grid",
        "container": "max-w-[1400px] mx-auto px-4 md:px-6",
        "grid": "grid grid-cols-12 gap-4 md:gap-6",
        "left_rail": "hidden lg:flex lg:w-[280px] lg:flex-col",
        "top_bar": "sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
      },
      "patient_mobile": {
        "pattern": "Bottom nav (3–5 items) + single primary card per screen",
        "container": "max-w-md mx-auto px-4",
        "spacing": "py-5 space-y-4",
        "touch_targets": "min-h-[48px] min-w-[48px]"
      }
    },
    "card_language": {
      "base": "rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[var(--mm-shadow-elev)]",
      "hover": "hover:border-[color:var(--mm-stroke-strong)] hover:shadow-[var(--mm-shadow-glow)]",
      "doctor_variant": "rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-lg",
      "patient_variant": "rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl"
    }
  },

  "component_path": {
    "primary_shadcn": [
      "/app/frontend/src/components/ui/button.jsx",
      "/app/frontend/src/components/ui/card.jsx",
      "/app/frontend/src/components/ui/tabs.jsx",
      "/app/frontend/src/components/ui/dialog.jsx",
      "/app/frontend/src/components/ui/drawer.jsx",
      "/app/frontend/src/components/ui/sheet.jsx",
      "/app/frontend/src/components/ui/table.jsx",
      "/app/frontend/src/components/ui/badge.jsx",
      "/app/frontend/src/components/ui/tooltip.jsx",
      "/app/frontend/src/components/ui/scroll-area.jsx",
      "/app/frontend/src/components/ui/separator.jsx",
      "/app/frontend/src/components/ui/skeleton.jsx",
      "/app/frontend/src/components/ui/calendar.jsx",
      "/app/frontend/src/components/ui/sonner.jsx"
    ],
    "recommended_new_components_to_create": [
      "src/components/memind/AppShell.js (role-aware shell)",
      "src/components/memind/GlassPanel.js (standard glass card wrapper)",
      "src/components/memind/AiStatusRing.js (glowing ring + status)",
      "src/components/memind/MetricTile.js (mono metric + delta)",
      "src/components/memind/Timeline.js (filterable events)",
      "src/components/memind/LanguageSwitcher.js (EN/DE)",
      "src/components/memind/EthicsConsentBanner.js (GDPR/consent visibility)",
      "src/components/memind/PatientBottomNav.js",
      "src/components/memind/ChatComposer.js (Talk to Memind)"
    ],
    "charts": {
      "library": "recharts",
      "usage": "Caregiver + Doctor dashboards: trends, correlations, risk trajectories",
      "components": [
        "LineChart (cognitive trend)",
        "AreaChart (mood confidence band)",
        "BarChart (med adherence)",
        "ScatterChart (medication correlation)",
        "RadarChart (cognitive domains snapshot)"
      ]
    },
    "motion": {
      "library": "framer-motion",
      "usage": "panel entrance, hover lift, AI ring pulse, route transitions (subtle)"
    }
  },

  "interaction_and_motion": {
    "principles": [
      "Motion communicates system intelligence (AI scanning, status breathing) not decoration.",
      "Respect prefers-reduced-motion; disable pulses and parallax when enabled.",
      "No universal transition: never use transition-all."
    ],
    "micro_interactions": {
      "buttons": {
        "hover": "bg/outline shift + subtle glow ring",
        "press": "scale-[0.98]",
        "focus": "ring-2 ring-[hsl(var(--ring))] ring-offset-2 ring-offset-background"
      },
      "cards": {
        "hover": "translate-y-[-2px] + border highlight",
        "active": "translate-y-[0px]"
      },
      "ai_modules": {
        "status_ring": "slow breathing pulse (3.2s) + rotating conic highlight (very subtle)",
        "loading": "skeleton + 'Analyzing…' with animated ellipsis"
      },
      "scroll": {
        "dashboards": "top bar increases blur + shows compact patient chip",
        "patient": "no parallax; keep stable"
      }
    },
    "framer_snippets": {
      "panel_enter": "initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}",
      "hover_lift": "whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}"
    }
  },

  "role_experiences": {
    "landing_role_switcher": {
      "goal": "Investor-ready entry: choose role + language; show AI system status + privacy note.",
      "layout": "Full-bleed dark background with subtle cockpit-sheen gradient overlay (<=20% viewport) + centered role cards in a 2x2 grid on desktop, 1-column on mobile.",
      "components": [
        "Card (role tiles)",
        "Button (Enter)",
        "Badge (AI Live / Mock)",
        "DropdownMenu or Select (language)",
        "Alert (GDPR/ethics note)"
      ],
      "must_include": [
        "data-testid=role-switcher-patient-button",
        "data-testid=role-switcher-caregiver-button",
        "data-testid=role-switcher-doctor-button",
        "data-testid=role-switcher-admin-button",
        "data-testid=language-switcher"
      ]
    },

    "patient_app": {
      "north_star": "Calm, minimal, large text, emotionally safe. One primary action per screen.",
      "navigation": "Bottom nav with 4 items: Home, Talk, Memories, Help. 'My Family' lives inside Home as a large card.",
      "visual_rules": [
        "Avoid dense charts.",
        "Use large cards with icons + short labels.",
        "Use warm supportive microcopy and confirmations.",
        "Always show 'You are safe' / 'Emergency' affordance."
      ],
      "pages": {
        "Patient Home": {
          "hero": "Today orientation card: date, time, location label (if enabled), 'How are you feeling?' quick buttons.",
          "modules": [
            "Today Summary (AI)",
            "My Family (faces)",
            "Next Step (single reminder)",
            "Safety status"
          ],
          "components": [
            "Card",
            "Avatar",
            "Button",
            "Tabs (optional: Today / Week)",
            "AiStatusRing"
          ]
        },
        "Patient Voice Companion": {
          "layout": "Full-screen chat/voice with big mic button + transcript.",
          "components": [
            "ChatComposer",
            "Button (mic)",
            "ScrollArea (messages)",
            "Badge (Listening / Thinking / Speaking)"
          ]
        },
        "Patient Today Summary": {
          "layout": "Single column; AI summary at top; 3–5 bullet cards; 'Play back' voice narration.",
          "components": [
            "Card",
            "Separator",
            "Button",
            "Progress (confidence)"
          ]
        },
        "Patient Memories": {
          "layout": "Photo-first grid; tap opens memory detail drawer.",
          "components": [
            "Card",
            "Carousel (memory photos)",
            "Drawer",
            "Badge (year/place)"
          ]
        },
        "Patient My Family": {
          "layout": "Large avatars + relationship label + one-tap call/message (mock).",
          "components": [
            "Avatar",
            "Card",
            "Button",
            "Dialog (confirm call)"
          ]
        },
        "Patient Emergency": {
          "layout": "High contrast, minimal choices: Call caregiver, Call emergency services (mock), Share location.",
          "components": [
            "Alert",
            "Button (destructive)",
            "Switch (share location)",
            "Dialog (confirm)"
          ]
        }
      },
      "accessibility": {
        "min_font": "text-base on mobile; primary actions text-lg+",
        "touch": "48px targets",
        "avoid": [
          "tiny icon-only buttons",
          "dense tables",
          "multi-step forms"
        ]
      }
    },

    "caregiver_dashboard": {
      "north_star": "Cinematic command center with AI analytics; emotionally resonant but actionable.",
      "layout": "Left rail navigation + top patient selector + 12-col grid with modular panels.",
      "signature_modules": [
        "Live Patient Monitor (status ring + vitals-like cognitive signals)",
        "Daily Timeline with filters",
        "AI Memory Graph",
        "Emotional Analytics",
        "Confusion Episodes modal",
        "Safety & Location",
        "Medication & Daily Care",
        "AI Recommendations",
        "AI Reports",
        "Permissions & Consent"
      ],
      "components": [
        "Tabs (time ranges)",
        "Table (events)",
        "Dialog (episode detail)",
        "Sheet (filters)",
        "Calendar (date range)",
        "Badge (severity)",
        "Tooltip (AI confidence)"
      ],
      "ai_transparency": "Every AI card shows: confidence %, last updated, data sources used (mock ok)."
    },

    "doctor_dashboard": {
      "north_star": "Clinical, precise, data-driven. Less glow, more clarity.",
      "layout": "Patient list left (or top on tablet) + main content with charts and tables.",
      "signature_modules": [
        "Cognitive Trend Analysis",
        "Speech & Language Analysis",
        "Behavioral Episode Review",
        "Intervention Effectiveness",
        "Medication Correlation",
        "Doctor Notes & Care Plan",
        "Clinical Report Generator"
      ],
      "visual_rules": [
        "Reduce neon glow intensity by 40% vs caregiver.",
        "Prefer solid borders + subtle highlights.",
        "Use mono metrics and clear legends."
      ]
    },

    "admin_panel": {
      "north_star": "Functional system console.",
      "layout": "Standard table-first admin with filters, audit logs, system health cards.",
      "signature_modules": [
        "Users",
        "Patients",
        "Doctors/Caregivers",
        "Devices/Alerts",
        "Audit Logs",
        "AI Model Status",
        "Consent Records",
        "System Health"
      ],
      "components": [
        "Table",
        "Pagination",
        "Select",
        "Input",
        "Dialog (create/edit)",
        "Badge (status)"
      ]
    }
  },

  "i18n_requirements": {
    "languages": ["en", "de"],
    "rules": [
      "All visible strings must come from translation files.",
      "No hard-coded UI text in components.",
      "Use ICU-safe interpolation for names/dates.",
      "Language switcher must be present in shared top bar and on role switcher."
    ],
    "date_time": "Use Intl.DateTimeFormat with locale from i18n state."
  },

  "data_testid_convention": {
    "rule": "All interactive and key informational elements MUST include data-testid in kebab-case describing role/function.",
    "examples": [
      "data-testid=patient-bottom-nav-talk",
      "data-testid=caregiver-live-monitor-status-ring",
      "data-testid=doctor-report-generator-submit-button",
      "data-testid=admin-audit-log-table"
    ]
  },

  "accessibility_and_safety": {
    "wcag": [
      "WCAG AA contrast",
      "visible focus states",
      "keyboard navigable dashboards"
    ],
    "patient_safety": [
      "Emergency actions require confirmation dialog",
      "Avoid alarming red unless truly emergency",
      "Provide 'AI may be wrong' disclaimer in patient-friendly language"
    ],
    "ethical_gdpr": [
      "Always show consent status chip on dashboards",
      "Provide GDPR placeholder pages and data retention notes",
      "Explain AI data sources and limitations"
    ]
  },

  "libraries_and_setup": {
    "framer_motion": {
      "install": "npm i framer-motion",
      "usage": "Use for subtle panel entrance and AI ring pulse; disable when prefers-reduced-motion."
    },
    "recharts": {
      "install": "npm i recharts",
      "usage": "Charts for caregiver/doctor; ensure empty states and legends."
    },
    "icons": {
      "library": "lucide-react",
      "usage": "Use consistent line icons; avoid emojis."
    }
  },

  "image_urls": {
    "backgrounds": [
      {
        "url": "https://images.unsplash.com/photo-1524168948265-8f79ad8d4e33?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwbWVkaWNhbCUyMGFic3RyYWN0JTIwZGFyayUyMGJsdWUlMjBnbGFzc21vcnBoaXNtJTIwYmFja2dyb3VuZHxlbnwwfHx8Ymx1ZXwxNzc4NDQ3MDc0fDA&ixlib=rb-4.1.0&q=85",
        "category": "role-switcher-hero-bg",
        "description": "Abstract blue geometry; use as blurred background layer with dark overlay."
      },
      {
        "url": "https://images.unsplash.com/photo-1653668168018-0ee2c5756bca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxmdXR1cmlzdGljJTIwbWVkaWNhbCUyMGFic3RyYWN0JTIwZGFyayUyMGJsdWUlMjBnbGFzc21vcnBoaXNtJTIwYmFja2dyb3VuZHxlbnwwfHx8Ymx1ZXwxNzc4NDQ3MDc0fDA&ixlib=rb-4.1.0&q=85",
        "category": "dashboard-bg-accent",
        "description": "Minimal stripe texture; use as subtle section accent behind top bar."
      }
    ],
    "human_story": [
      {
        "url": "https://images.unsplash.com/flagged/photo-1567318362383-fa193e67bbd5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwY2FyZWdpdmVyJTIwZmFtaWx5JTIwcG9ydHJhaXQlMjB3YXJtfGVufDB8fHx8MTc3ODQ0NzA4MXww&ixlib=rb-4.1.0&q=85",
        "category": "landing-trust-panel",
        "description": "Warm family scene; use small (not full-bleed) in a trust/mission card."
      }
    ]
  },

  "instructions_to_main_agent": [
    "Remove default CRA App.css centered header usage; do not center the whole app container.",
    "Set dark mode as default by applying className='dark' on the root html/body wrapper (or via Tailwind dark mode strategy).",
    "Replace index.css shadcn tokens with Memind tokens (see design_tokens_css.css).",
    "Implement role-aware shells: Patient uses bottom nav + large cards; Caregiver/Doctor/Admin use left rail + top bar.",
    "Every page must include an AI presence: status ring, confidence chip, 'last analyzed' timestamp, or AI summary card.",
    "Use shadcn components from /src/components/ui only for interactive primitives (dialogs, dropdowns, calendar, etc.).",
    "Add data-testid to all interactive and key informational elements (buttons, inputs, nav links, key metrics).",
    "Use lucide-react icons; no emoji icons.",
    "Gradients: only as background accents <=20% viewport; never on reading surfaces."
  ]
}

---

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
