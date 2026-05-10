{
  "brand": {
    "product_name": "Memind",
    "design_north_star": "Investor-ready, doctor-demo-ready futuristic medical AI cockpit. Patient experience stays emotionally safe and simple; dashboards become dense, analytical, and modular. Brain Core is the central intelligence with electric neural pulses and clear state language.",
    "brand_attributes": [
      "clinical-trustworthy",
      "premium-sci-fi",
      "calm-for-patients",
      "data-dense-for-caregivers-and-clinicians",
      "ethically-transparent"
    ],
    "role_differentiation": {
      "patient_app": "Warm, calming, low cognitive load. Large touch targets, fewer panels, friendly AI orb.",
      "family_care_center": "Cockpit dashboard: dense cards, risk surfaces, timeline, recommendations. Brain Core dominates.",
      "doctor_clinical_console": "Professional clinical console: patient list sidebar, charts, correlations, notes. Less decorative, more signal.",
      "admin_panel": "Systems cockpit: health, model status, audit logs, consent/GDPR actions. Operational clarity."
    }
  },

  "inspiration_sources": {
    "visual_direction": [
      {
        "type": "behance",
        "url": "https://www.behance.net/gallery/107774237/Futuristic-medical-user-interface",
        "takeaways": [
          "FUI medical cockpit density",
          "glowing edges + HUD lines",
          "central scan/brain panel"
        ]
      },
      {
        "type": "behance",
        "url": "https://www.behance.net/gallery/107774493/Futuristic-medical-user-interface",
        "takeaways": [
          "layered translucent panels",
          "thin dividers + micro labels",
          "status chips"
        ]
      },
      {
        "type": "dribbble",
        "url": "https://dribbble.com/search/glass-morphism-dark",
        "takeaways": [
          "refined glass cards",
          "soft glow borders",
          "depth via blur + subtle noise"
        ]
      },
      {
        "type": "dribbble",
        "url": "https://dribbble.com/search/futuristic-health",
        "takeaways": [
          "left-rail + top-bar cockpit layout",
          "data-rich modular panels",
          "neon accents used sparingly"
        ]
      }
    ],
    "motion_reference": [
      {
        "type": "video",
        "url": "https://www.youtube.com/watch?v=ZACJnu0XWZs",
        "takeaways": [
          "electric spike pulses",
          "short-lived glow trails",
          "activity bursts"
        ]
      }
    ]
  },

  "typography": {
    "font_pairing": {
      "display": {
        "google_font": "Space Grotesk",
        "usage": "H1/H2, panel titles, cockpit labels",
        "tailwind": "font-display"
      },
      "body": {
        "google_font": "Inter",
        "usage": "Body, tables, forms",
        "tailwind": "font-sans"
      },
      "mono": {
        "google_font": "IBM Plex Mono",
        "usage": "Telemetry numbers, timestamps, IDs",
        "tailwind": "font-mono"
      }
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm md:text-base",
      "small": "text-xs"
    },
    "bilingual_layout_rules": [
      "Assume DE strings are ~20–35% longer than EN; avoid fixed widths for buttons/chips.",
      "Use `truncate` only for secondary metadata; never truncate patient-critical text.",
      "Prefer two-line wrapping for card titles: `leading-snug` + `line-clamp-2` where safe."
    ]
  },

  "color_system": {
    "notes": [
      "Keep base near-black navy; accents are electric cyan + a restrained violet used only for neural glow and highlights.",
      "Patient app introduces warm peach/amber accents (NOT purple) while keeping overall dark premium shell optional.",
      "Gradients are decorative only and must not exceed 20% viewport."
    ],
    "tokens_css": {
      "location": "/app/frontend/src/index.css",
      "add_or_adjust": [
        "--mm-bg-0",
        "--mm-bg-1",
        "--mm-panel",
        "--mm-panel-strong",
        "--mm-stroke",
        "--mm-stroke-strong",
        "--mm-accent-cyan",
        "--mm-accent-cyan-soft",
        "--mm-accent-violet-soft",
        "--mm-text-muted",
        "--mm-shadow-elev",
        "--mm-shadow-glow"
      ],
      "new_tokens_to_add": {
        "--mm-accent-mint": "#3ddc97",
        "--mm-accent-amber": "#ffb020",
        "--mm-accent-rose": "#ff8c7a",
        "--mm-danger": "#ff4d4d",
        "--mm-warn": "#ffb020",
        "--mm-ok": "#3ddc97",
        "--mm-info": "#00d4ff",
        "--mm-glass": "rgba(255,255,255,0.06)",
        "--mm-glass-2": "rgba(255,255,255,0.09)",
        "--mm-glass-border": "rgba(255,255,255,0.12)",
        "--mm-glow-cyan": "0 0 0 1px rgba(0,212,255,0.18), 0 0 40px rgba(0,212,255,0.12)",
        "--mm-glow-warm": "0 0 0 1px rgba(255,176,32,0.18), 0 0 40px rgba(255,140,122,0.10)"
      }
    },
    "semantic_colors": {
      "surface": {
        "app_bg": "#070a12",
        "app_bg_2": "#0b1020",
        "panel": "rgba(255,255,255,0.06)",
        "panel_strong": "rgba(255,255,255,0.09)",
        "stroke": "rgba(255,255,255,0.10)",
        "stroke_focus": "rgba(0,212,255,0.35)"
      },
      "text": {
        "primary": "hsl(var(--foreground))",
        "muted": "rgba(234, 242, 255, 0.72)",
        "faint": "rgba(234, 242, 255, 0.55)"
      },
      "status": {
        "stable": "#3ddc97",
        "slightly_unstable": "#ffb020",
        "under_observation": "#00d4ff",
        "high_confusion": "#ff4d4d",
        "recovering": "#7bdcff"
      },
      "role_accents": {
        "patient": "warm (amber/rose)",
        "caregiver": "cyan + mint",
        "doctor": "cyan + neutral",
        "admin": "cyan + amber (ops)"
      }
    },
    "allowed_gradients": {
      "cockpit_header_bg": "radial-gradient(circle at 20% 10%, rgba(0,212,255,0.14), transparent 35%), radial-gradient(circle at 80% 0%, rgba(140,120,255,0.10), transparent 30%)",
      "patient_warm_header_bg": "radial-gradient(circle at 20% 10%, rgba(255,176,32,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,140,122,0.14), transparent 35%)"
    }
  },

  "layout_and_grid": {
    "global_shell": {
      "pattern": "Left rail + top bar cockpit for dashboards; patient uses simplified single-column with optional bottom actions.",
      "max_width": "Dashboards: fluid (no max) with `2xl:px-8`; Patient: `max-w-2xl` content column.",
      "spacing": {
        "section_padding": "px-4 sm:px-6 lg:px-8 py-5 sm:py-6",
        "panel_gap": "gap-4 md:gap-5",
        "card_padding": "p-4 md:p-5"
      }
    },
    "dashboard_grids": {
      "caregiver_overview": "grid grid-cols-1 xl:grid-cols-[360px_1fr_420px] gap-4",
      "doctor_overview": "grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4",
      "admin_overview": "grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4"
    },
    "density_rules": [
      "Caregiver/Doctor dashboards: prefer 12–16px internal spacing, compact labels, and more panels per viewport.",
      "Patient screens: prefer 20–28px spacing, fewer choices, large buttons.",
      "Use `ScrollArea` for long lists/timelines inside fixed-height panels to keep cockpit feel."
    ]
  },

  "components": {
    "component_path": {
      "shadcn_primary": "/app/frontend/src/components/ui/",
      "use_these": [
        "card.jsx",
        "button.jsx",
        "badge.jsx",
        "tabs.jsx",
        "table.jsx",
        "scroll-area.jsx",
        "separator.jsx",
        "tooltip.jsx",
        "sheet.jsx",
        "dialog.jsx",
        "dropdown-menu.jsx",
        "select.jsx",
        "calendar.jsx",
        "progress.jsx",
        "skeleton.jsx",
        "sonner.jsx"
      ]
    },
    "new_ui_building_blocks_to_create": [
      {
        "name": "GlassPanel",
        "type": "wrapper",
        "purpose": "Standardize glassmorphism surfaces across dashboards.",
        "implementation": {
          "file": "/app/frontend/src/components/GlassPanel.js",
          "tailwind": "rounded-[var(--radius)] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[var(--mm-shadow-elev)]",
          "variants": {
            "strong": "bg-white/[0.09]",
            "glow": "shadow-[var(--mm-shadow-glow)] border-cyan-400/20"
          }
        }
      },
      {
        "name": "BrainCorePanel",
        "type": "feature",
        "purpose": "Central intelligence visualization with state ring + electric pulses.",
        "implementation": {
          "file": "/app/frontend/src/components/BrainCorePanel.js",
          "notes": [
            "Use SVG + CSS animations (no heavy 3D required) for reliability.",
            "Optional enhancement: React Three Fiber later; keep fallback SVG always."
          ]
        }
      },
      {
        "name": "RiskCard",
        "type": "feature",
        "purpose": "Compact risk tiles (confusion, wandering, fall, medication, sleep, last interaction).",
        "implementation": {
          "file": "/app/frontend/src/components/RiskCard.js",
          "tailwind": "rounded-xl border border-white/10 bg-white/[0.05] p-4 hover:bg-white/[0.07] transition-colors"
        }
      },
      {
        "name": "TelemetryStat",
        "type": "feature",
        "purpose": "Small stat rows with mono numbers + delta chips.",
        "implementation": {
          "file": "/app/frontend/src/components/TelemetryStat.js",
          "tailwind": "flex items-baseline justify-between gap-3"
        }
      }
    ],
    "button_system": {
      "style": "Glass / Neomorphic (soft geometry) for dashboards; Patient primary uses warm solid fill.",
      "variants": {
        "primary_dashboard": {
          "tailwind": "bg-cyan-400 text-slate-950 hover:bg-cyan-300 focus-visible:ring-cyan-300",
          "notes": "Use sparingly for primary actions (Generate report, Start session)."
        },
        "secondary_glass": {
          "tailwind": "bg-white/[0.06] text-white hover:bg-white/[0.09] border border-white/10",
          "notes": "Default cockpit button."
        },
        "ghost": {
          "tailwind": "bg-transparent hover:bg-white/[0.06]",
          "notes": "For icon buttons in top bar/rail."
        },
        "patient_primary": {
          "tailwind": "bg-amber-400 text-slate-950 hover:bg-amber-300 focus-visible:ring-amber-300",
          "notes": "Warm, reassuring."
        },
        "danger_emergency": {
          "tailwind": "bg-red-500 text-white hover:bg-red-400 focus-visible:ring-red-400",
          "notes": "Emergency only; large size; requires confirm dialog."
        }
      },
      "micro_interactions": [
        "Buttons: `transition-colors duration-200` only (no `transition-all`).",
        "Press: `active:scale-[0.98]` for primary actions.",
        "Focus: always `focus-visible:ring-2 focus-visible:ring-offset-0` with role-appropriate ring color."
      ]
    },
    "badges_and_chips": {
      "use": "badge.jsx",
      "styles": {
        "state_chip": "rounded-full bg-white/[0.06] border border-white/10 text-xs",
        "live_chip": "memind-badge-live",
        "mock_chip": "memind-badge-mock"
      }
    },
    "tables": {
      "use": "table.jsx",
      "rules": [
        "Sticky header inside ScrollArea for patient lists and audit logs.",
        "Use mono for IDs and timestamps.",
        "Row hover: `hover:bg-white/[0.04] transition-colors`."
      ]
    },
    "charts": {
      "library": "recharts (already present)",
      "chart_surface": "Use `.memind-chart-surface` + GlassPanel strong variant.",
      "palette_mapping": {
        "primary_line": "var(--mm-accent-cyan)",
        "secondary_line": "#3ddc97",
        "warning": "#ffb020",
        "danger": "#ff4d4d",
        "neutral_grid": "rgba(255,255,255,0.08)"
      },
      "empty_states": [
        "Use `Skeleton` for loading.",
        "Use a compact empty card with icon + bilingual hint; never leave blank chart areas."
      ]
    }
  },

  "brain_core_visual_system": {
    "states": [
      "Stable",
      "Slightly unstable",
      "Under observation",
      "High confusion",
      "Recovering"
    ],
    "state_to_color": {
      "Stable": "#3ddc97",
      "Slightly unstable": "#ffb020",
      "Under observation": "#00d4ff",
      "High confusion": "#ff4d4d",
      "Recovering": "#7bdcff"
    },
    "panel_layout": {
      "caregiver": "Large central panel (min-h 420px) with ring + pulses + small telemetry list on right.",
      "doctor": "Clinical brain status panel with ring + trend sparkline + annotations.",
      "patient": "Small friendly orb (not clinical brain) with warm glow and simple status text."
    },
    "implementation_notes_js": {
      "svg_layers": [
        "Outer stability ring (stroke-dasharray animated)",
        "Inner neural mesh (thin paths with low opacity)",
        "Pulse particles (small circles moving along paths)",
        "Glow filter (SVG filter + CSS drop-shadow)"
      ],
      "css_animation": [
        "Use keyframes for pulse travel; stagger 6–10 particles.",
        "Use `prefers-reduced-motion` to disable particle travel and keep subtle glow only."
      ],
      "framer_motion": [
        "Entrance: fade+translateY 8px for panels.",
        "Continuous: very subtle breathing scale (1.00 → 1.02) on orb/ring only."
      ]
    }
  },

  "page_upgrade_blueprints": {
    "role_switcher_landing": {
      "goal": "Make role selection feel like entering different consoles.",
      "layout": "Hero with 4 role cards in a bento grid; each card previews its UI density.",
      "cards": [
        "Patient App (warm preview)",
        "Family Care Center (brain core preview)",
        "Doctor Console (patient list preview)",
        "Admin Panel (system health preview)"
      ],
      "data_testids": [
        "role-switcher-patient-button",
        "role-switcher-caregiver-button",
        "role-switcher-doctor-button",
        "role-switcher-admin-button",
        "language-toggle"
      ]
    },

    "patient": {
      "patient_home": {
        "visual": "Warm calm background overlay (small area only) + friendly AI orb.",
        "must_have_cards": [
          "Today summary",
          "Familiar voice card (play last family message)",
          "Confusion support card (simple steps)",
          "Emergency button (large, confirm dialog)",
          "Next reminder"
        ],
        "interaction_rules": [
          "Large buttons: min-h 48px, text-base.",
          "Avoid dense charts; use 1–2 simple progress indicators.",
          "Use warm accent (amber/rose) not purple."
        ],
        "data_testids": [
          "patient-home-ai-orb",
          "patient-home-today-summary-card",
          "patient-home-familiar-voice-card",
          "patient-home-confusion-support-card",
          "patient-home-emergency-button"
        ]
      },
      "patient_talk": {
        "visual": "Mic button with warm glow; transcript in large readable bubbles.",
        "components": [
          "Button",
          "Card",
          "ScrollArea",
          "Sonner"
        ],
        "data_testids": [
          "patient-talk-mic-button",
          "patient-talk-transcript",
          "patient-talk-send-button"
        ]
      },
      "patient_memories": {
        "visual": "Photo-first memory cards; minimal metadata.",
        "data_testids": [
          "patient-memories-list",
          "patient-memories-filter"
        ]
      },
      "patient_help": {
        "visual": "Simple FAQ + big contact actions.",
        "data_testids": [
          "patient-help-emergency-button",
          "patient-help-call-caregiver-button"
        ]
      }
    },

    "family_care_center": {
      "overview": {
        "layout": "3-column cockpit: identity+ring left, Brain Core center, risks+timeline right.",
        "panels": [
          "Patient identity card (avatar, age, diagnosis label, last check-in)",
          "Cognitive stability ring (progress + state chip)",
          "Brain Core panel (electric pulses)",
          "Risk cards grid (confusion, wandering, fall, medication, sleep, last interaction)",
          "Daily timeline (ScrollArea)",
          "AI recommendations (ranked list)",
          "Risk radar (Recharts RadarChart)"
        ],
        "data_testids": [
          "caregiver-overview-brain-core-panel",
          "caregiver-overview-risk-cards",
          "caregiver-overview-timeline",
          "caregiver-overview-ai-recommendations"
        ]
      },
      "timeline": {
        "visual": "Vertical timeline with status dots + hover tooltips.",
        "data_testids": [
          "caregiver-timeline-list",
          "caregiver-timeline-filter"
        ]
      },
      "analytics": {
        "visual": "Dense chart grid with consistent chart surfaces.",
        "charts": [
          "Cognitive trend line",
          "Confusion episodes bar",
          "Sleep vs confusion correlation scatter"
        ],
        "data_testids": [
          "caregiver-analytics-cognitive-trend-chart",
          "caregiver-analytics-confusion-chart"
        ]
      }
    },

    "doctor_clinical_console": {
      "overview": {
        "layout": "Left patient list sidebar + main clinical panels.",
        "sidebar": [
          "Search input",
          "Patient list with status chips",
          "Quick filters (High confusion, Under observation)"
        ],
        "main_panels": [
          "Clinical brain status panel",
          "Cognitive trends",
          "Confusion episode charts",
          "Speech/language analysis",
          "Intervention effectiveness",
          "Medication correlation",
          "Clinical notes"
        ],
        "data_testids": [
          "doctor-sidebar-patient-search",
          "doctor-sidebar-patient-list",
          "doctor-overview-brain-status",
          "doctor-overview-cognitive-trends"
        ]
      },
      "notes": {
        "visual": "Split view: notes editor + timeline of entries.",
        "data_testids": [
          "doctor-notes-editor",
          "doctor-notes-save-button",
          "doctor-notes-list"
        ]
      }
    },

    "admin_panel": {
      "overview": {
        "layout": "Ops cockpit: system health left, audit/consent right.",
        "panels": [
          "System health (uptime, queue, latency)",
          "AI model status (version, last deploy, drift indicator)",
          "Consent overview (counts, expiring soon)",
          "Audit logs (table)",
          "GDPR actions (export/delete requests)"
        ],
        "data_testids": [
          "admin-overview-system-health",
          "admin-overview-ai-model-status",
          "admin-overview-audit-logs",
          "admin-overview-consent-overview"
        ]
      }
    }
  },

  "motion_and_microinteractions": {
    "principles": [
      "Motion communicates system intelligence, not playfulness.",
      "Keep loops subtle; reserve stronger pulses for alerts/high confusion.",
      "Never animate large text blocks."
    ],
    "framer_motion_patterns": {
      "panel_enter": "initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.26,ease:'easeOut'}}",
      "hover_lift": "whileHover={{y:-2}} transition={{duration:0.18}}",
      "alert_pulse": "animate={{boxShadow:['0 0 0 1px rgba(255,77,77,0.25)','0 0 0 1px rgba(255,77,77,0.45)']}} transition={{duration:1.6,repeat:Infinity,repeatType:'mirror'}}"
    },
    "reduced_motion": [
      "Respect `prefers-reduced-motion`: disable pulse travel and hover lifts; keep color changes only."
    ]
  },

  "accessibility_and_safety": {
    "wcag": [
      "Maintain AA contrast for all text on glass panels.",
      "Focus rings must be visible on dark backgrounds.",
      "Avoid relying on color alone for Brain Core states: include label + icon."
    ],
    "dementia_friendly_patient_rules": [
      "Use plain language; avoid abbreviations.",
      "One primary action per screen.",
      "Emergency requires confirm dialog with large buttons."
    ],
    "ethical_disclaimers": [
      "Always show a persistent disclaimer link in dashboards: AI assists, not diagnoses.",
      "In patient app, show a gentle, non-alarming disclaimer in Help/About."
    ]
  },

  "testing_attributes": {
    "rule": "All interactive and key informational elements MUST include `data-testid` in kebab-case.",
    "examples": [
      "data-testid=\"caregiver-overview-risk-card-confusion\"",
      "data-testid=\"doctor-sidebar-patient-row-<id>\"",
      "data-testid=\"admin-audit-log-table\""
    ]
  },

  "image_urls": {
    "dashboard_backgrounds": [
      {
        "url": "https://images.unsplash.com/photo-1633259584604-afdc243122ea?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHw0fHxtZWRpY2FsJTIwdGVjaG5vbG9neSUyMGFic3RyYWN0JTIwZGFyayUyMGJsdWV8ZW58MHx8fGJsdWV8MTc3ODQ0OTM5MHww&ixlib=rb-4.1.0&q=85",
        "category": "caregiver/doctor/admin shell",
        "description": "Dark blue wave lines for subtle cockpit background overlay (use at low opacity, decorative only)."
      },
      {
        "url": "https://images.unsplash.com/photo-1592829016842-156c305ecc7e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA4Mzl8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVjaG5vbG9neSUyMGFic3RyYWN0JTIwZGFyayUyMGJsdWV8ZW58MHx8fGJsdWV8MTc3ODQ0OTM5MHww&ixlib=rb-4.1.0&q=85",
        "category": "hero/role switcher",
        "description": "Blue light abstract for role landing hero background (keep gradient area under 20%)."
      }
    ],
    "patient_warm_backgrounds": [
      {
        "url": "https://images.unsplash.com/photo-1548504773-429e84f586d2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwzfHx3YXJtJTIwY2FsbWluZyUyMGdyYWRpZW50JTIwYWJzdHJhY3R8ZW58MHx8fG9yYW5nZXwxNzc4NDQ5Mzk0fDA&ixlib=rb-4.1.0&q=85",
        "category": "patient home header",
        "description": "Warm blurred gradient for patient header strip (decorative only)."
      }
    ]
  },

  "libraries_and_integrations": {
    "already_present": [
      "shadcn/ui",
      "tailwind",
      "recharts",
      "framer-motion",
      "sonner"
    ],
    "optional_additions": [
      {
        "name": "react-three-fiber (optional)",
        "why": "If you want a true 3D Brain Core later; keep SVG fallback now.",
        "install": "npm i three @react-three/fiber @react-three/drei",
        "usage_note": "Gate behind a feature flag; render Canvas only on desktop widths; always provide SVG fallback for performance and accessibility."
      }
    ]
  },

  "instructions_to_main_agent": [
    "Do NOT rebuild routes or data flows. Only upgrade styling/layout and add new presentational components (GlassPanel, BrainCorePanel, RiskCard, TelemetryStat).",
    "Keep existing i18n keys; ensure layouts tolerate longer DE strings.",
    "Patient UI: introduce warm accent tokens and a simplified layout; keep actions large and minimal.",
    "Caregiver/Doctor/Admin: adopt cockpit density: left rail + top bar, ScrollArea panels, compact chips, consistent chart surfaces.",
    "Implement Brain Core as SVG-first with electric pulse particles; map states to semantic colors and always show label + icon.",
    "Apply `data-testid` to every interactive element and key info surface (cards that show state/risk, charts, tables, buttons, inputs).",
    "Respect gradient restriction rules: gradients only as decorative section backgrounds; never on text-heavy panels; never exceed 20% viewport.",
    "Do not use `transition: all`; use `transition-colors` and targeted transitions only."
  ],

  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
