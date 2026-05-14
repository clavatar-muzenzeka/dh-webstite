/* ============================================================
   <cyber-diagram>
   ------------------------------------------------------------
   Web Component natif (Shadow DOM) qui rend le diagramme
   interactif "Cybersecurity One Page" : 4 piliers (cercles
   pointillés) + 10 capacités (hexagones) + 4 étiquettes
   flottantes "PILIER".

   Usage :
       <script src="cyber-diagram.js"></script>
       <cyber-diagram lang="en"></cyber-diagram>
       <!-- lang="en" | lang="fr" — attribut ou setAttribute -->

   Tout (markup, styles, animations, données, interactions,
   tooltip) est encapsulé. Aucune dépendance externe.
   ============================================================ */
   (() => {
    "use strict";

    /* ----------------------------- Données (i18n) ---------------------- */
    const DEFAULT_LANG = "en";
    const SUPPORTED_LANGS = new Set(["en", "fr"]);

    function normalizeLang(value) {
        const s = String(value || "")
            .trim()
            .toLowerCase()
            .slice(0, 2);
        return SUPPORTED_LANGS.has(s) ? s : DEFAULT_LANG;
    }

    const UI_STRINGS = {
        en: {
            diagramAria:
                "Interactive diagram of cybersecurity pillars and capabilities",
            pillarAriaPrefix: "Pillar",
            pillarTagKind: "Pillar",
            pillarTagTitle: {
                prevent: "Prevent",
                defense: "Defense",
                architecture: "Architecture",
                governance: "Governance",
            },
        },
        fr: {
            diagramAria:
                "Diagramme interactif des piliers et capacités cybersécurité",
            pillarAriaPrefix: "Pilier",
            pillarTagKind: "Pilier",
            pillarTagTitle: {
                prevent: "Prévention",
                defense: "Défense",
                architecture: "Architecture",
                governance: "Gouvernance",
            },
        },
    };

    const PILLARS_I18N = {
        en: {
            prevent: {
                name: "Prevent Pillar",
                description:
                    "The <strong>Prevent</strong> pillar groups proactive capabilities that reduce the attack surface: information protection, domain security, business applications, and organizational products and services.",
            },
            defense: {
                name: "Defense Pillar",
                description:
                    "The <strong>Defense</strong> pillar brings together detection, response, and protection of users and data against active threats.",
            },
            architecture: {
                name: "Architecture Pillar",
                description:
                    "The <strong>Architecture</strong> pillar defines durable technical foundations: security hygiene, secure software development, and resilience-focused design.",
            },
            governance: {
                name: "Governance Pillar",
                description:
                    "The <strong>Governance</strong> pillar steers compliance, third-party management, and overall coherence of the cybersecurity program.",
            },
        },
        fr: {
            prevent: {
                name: "Pilier Prévention",
                description:
                    "Le pilier <strong>Prévention</strong> regroupe les capacités proactives qui réduisent la surface d'attaque : protection de l'information, sécurisation du domaine, des applications métier et des produits/services de l'organisation.",
            },
            defense: {
                name: "Pilier Défense",
                description:
                    "Le pilier <strong>Défense</strong> rassemble les dispositifs de détection, de réaction et de protection des utilisateurs et des données face aux menaces actives.",
            },
            architecture: {
                name: "Pilier Architecture",
                description:
                    "Le pilier <strong>Architecture</strong> définit les fondations techniques durables : hygiène de sécurité, développement logiciel sécurisé et conception centrée sur la résilience.",
            },
            governance: {
                name: "Pilier Gouvernance",
                description:
                    "Le pilier <strong>Gouvernance</strong> pilote la conformité, la gestion des tiers et la cohérence globale du programme cybersécurité.",
            },
        },
    };

    const HEXES_I18N = {
        en: {
            "info-protection": {
                name: "Information Protection",
                description:
                    "Mechanisms (encryption, DLP, access control, classification) that protect confidentiality, integrity, and availability throughout the information lifecycle.",
                pillars: ["prevent"],
            },
            "business-app": {
                name: "Organization Business Application",
                description:
                    "Security for business-critical applications: hardening, vulnerability management, and control of integrations and privileged accounts.",
                pillars: ["prevent"],
            },
            "domain-security": {
                name: "Organization Domain Security (LAN, WAN)",
                description:
                    "Protection of internal and wide-area networks (LAN, WAN): segmentation, firewalling, intrusion detection, network access control (NAC), and secure remote access.",
                pillars: ["prevent", "defense"],
            },
            "end-users": {
                name: "End-Users and People Security",
                description:
                    "Protecting end users, their endpoints, and their behavior: EDR, MFA, anti-phishing, awareness, and ongoing training.",
                pillars: ["defense"],
            },
            "products-services": {
                name: "Organization Products & Services",
                description:
                    "Security for products and services the organization delivers to customers: risk assessment, security testing, contractual requirements, and SLAs.",
                pillars: ["prevent", "architecture"],
            },
            iam: {
                name: "Identity & Access Management",
                description:
                    "Central to the whole program: who can access what, when, and how. IAM spans all four pillars and anchors the cybersecurity strategy.",
                pillars: ["prevent", "defense", "architecture", "governance"],
            },
            "asset-classification": {
                name: "Information Asset Classification & Handling",
                description:
                    "Identify, classify, and handle information assets based on sensitivity and criticality, with consistent handling rules.",
                pillars: ["defense", "governance"],
            },
            "third-party": {
                name: "Suppliers, Partners & Third Party",
                description:
                    "Third-party risk management: due diligence, contracts, ongoing monitoring, and exit strategies for vendors, partners, and subcontractors.",
                pillars: ["governance"],
            },
            "security-hygiene": {
                name: "Security Hygiene & Essentials",
                description:
                    "Core cybersecurity hygiene: configuration hardening, patch management, backups, logging, and monitoring.",
                pillars: ["architecture"],
            },
            "software-dev": {
                name: "Software Development",
                description:
                    "Secure software development lifecycle (SDLC): static and dynamic testing, code review, dependency management, and DevSecOps.",
                pillars: ["architecture", "governance"],
            },
        },
        fr: {
            "info-protection": {
                name: "Protection de l'information",
                description:
                    "Mécanismes (chiffrement, DLP, contrôle d'accès, classification) qui protègent la confidentialité, l'intégrité et la disponibilité de l'information à chaque étape de son cycle de vie.",
                pillars: ["prevent"],
            },
            "business-app": {
                name: "Applications métier de l'organisation",
                description:
                    "Sécurisation des applications métier critiques : durcissement, gestion des vulnérabilités, contrôle des intégrations et des comptes à privilèges.",
                pillars: ["prevent"],
            },
            "domain-security": {
                name: "Sécurité du domaine (LAN, WAN)",
                description:
                    "Protection des réseaux internes et étendus : segmentation, pare-feu, détection d'intrusion, contrôle d'accès réseau (NAC) et sécurisation des accès distants.",
                pillars: ["prevent", "defense"],
            },
            "end-users": {
                name: "Utilisateurs finaux et sécurité des personnes",
                description:
                    "Protection des utilisateurs finaux, de leurs équipements et de leurs comportements : EDR, MFA, anti-hameçonnage, sensibilisation et formation continue.",
                pillars: ["defense"],
            },
            "products-services": {
                name: "Produits et services de l'organisation",
                description:
                    "Sécurisation des produits et services proposés par l'organisation à ses clients : analyse de risque, tests de sécurité, exigences contractuelles et SLA.",
                pillars: ["prevent", "architecture"],
            },
            iam: {
                name: "Gestion des identités et des accès",
                description:
                    "Cœur du dispositif : gérer qui accède à quoi, quand et comment. L'IAM se trouve à l'intersection des quatre piliers — il ancre la stratégie cybersécurité.",
                pillars: ["prevent", "defense", "architecture", "governance"],
            },
            "asset-classification": {
                name: "Classification et traitement des actifs informationnels",
                description:
                    "Identifier, classifier et traiter les actifs informationnels selon leur sensibilité et leur criticité, avec des règles de manipulation cohérentes.",
                pillars: ["defense", "governance"],
            },
            "third-party": {
                name: "Fournisseurs, partenaires et tiers",
                description:
                    "Maîtrise du risque tiers : évaluation, contractualisation, surveillance continue et plans de sortie pour fournisseurs, partenaires et sous-traitants.",
                pillars: ["governance"],
            },
            "security-hygiene": {
                name: "Hygiène et fondamentaux de sécurité",
                description:
                    "Pratiques fondamentales de l'hygiène cyber : durcissement des configurations, gestion des correctifs, sauvegardes, journalisation et supervision.",
                pillars: ["architecture"],
            },
            "software-dev": {
                name: "Développement logiciel",
                description:
                    "Cycle de développement logiciel sécurisé (SDLC) : analyse statique/dynamique, revues de code, gestion des dépendances et DevSecOps.",
                pillars: ["architecture", "governance"],
            },
        },
    };

    /** Lignes de texte dans chaque hexagone (ordre = nœuds .hex-label). */
    const HEX_LINE_LABELS = {
        en: {
            "business-app": ["Organization", "Business", "Application"],
            "info-protection": ["Information", "Protection"],
            "products-services": ["Organization", "Products &", "Services"],
            "security-hygiene": ["Security", "Hygiene &", "Essentials"],
            "domain-security": ["Organization", "Domain Security", "(LAN, WAN)"],
            iam: ["Identity &", "Access", "Management"],
            "end-users": ["End-Users", "and People", "Security"],
            "asset-classification": [
                "Information",
                "Asset",
                "Classification",
                "& Handling",
            ],
            "software-dev": ["Software", "Development"],
            "third-party": ["Suppliers,", "Partners &", "Third Party"],
        },
        fr: {
            "business-app": ["Organisation", "Métier", "Application"],
            "info-protection": ["Information", "Protection"],
            "products-services": ["Organisation", "Produits &", "Services"],
            "security-hygiene": ["Sécurité", "Hygiène &", "Essentiels"],
            "domain-security": ["Organisation", "Sécurité du domaine", "(LAN, WAN)"],
            iam: ["Identité &", "Accès", "Gestion"],
            "end-users": ["Utilisateurs finaux", "et personnel", "Sécurité"],
            "asset-classification": [
                "Information",
                "Actifs",
                "Classification",
                "et traitement",
            ],
            "software-dev": ["Logiciels", "Développement"],
            "third-party": ["Fournisseurs,", "Partenaires &", "Tiers"],
        },
    };

    function getHexData(lang, hexKey) {
        const L = normalizeLang(lang);
        return (
            HEXES_I18N[L]?.[hexKey] ||
            HEXES_I18N[DEFAULT_LANG][hexKey] ||
            null
        );
    }

    function getPillarData(lang, pillarKey) {
        const L = normalizeLang(lang);
        return (
            PILLARS_I18N[L]?.[pillarKey] ||
            PILLARS_I18N[DEFAULT_LANG][pillarKey] ||
            null
        );
    }

    function getUi(lang) {
        const L = normalizeLang(lang);
        return UI_STRINGS[L] || UI_STRINGS[DEFAULT_LANG];
    }

    /* ----------------------------- Styles ------------------------------ */
    /* Tous les styles vivent à l'intérieur du Shadow DOM (sauf ceux du
       tooltip, posé sur <body>). Aucune fuite, aucune collision possible. */
    const STYLES = `
@property --breathe {
    syntax: '<number>';
    inherits: false;
    initial-value: 1;
}

:host {
    /* Palette */
    --ink: #1b1d29;
    --ink-soft: #4b4f5e;
    --muted: #8a8f9e;
    --line: #e3e6ef;
    --accent: #c81515;
    --accent-dark: #8c0d0d;
    --prevent: #e63946;
    --defense: #1d4ed8;
    --architecture: #0891b2;
    --governance: #b45309;
    --font-sans: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;

    /* Le composant : simple conteneur transparent (pas de carte, pas de fond,
       pas d'ombre) pour que tout ce qui derrière reste visible. */
    display: block;
    position: relative;
    width: 100%;
    max-width: 880px;
    margin: 0 auto;
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    /* Évite que le drop-shadow des hex (+ léger halo) soit rogné. */
    overflow: visible;
    box-sizing: border-box;
    color: var(--ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    animation: cardAppear 0.6s cubic-bezier(.2,.8,.2,1) both;

    /* Active le contexte de container-query pour pouvoir interroger
       la largeur du composant (cqw) → toutes les unités relatives
       à l'intérieur scalent proportionnellement à la carte, plus
       au viewport. Indispensable pour que les tags piliers suivent
       le redimensionnement du SVG. */
    container-type: inline-size;
    container-name: cyberdiagram;
}

:host([hidden]) { display: none; }

/* Animations gatées par la visibilité dans le viewport.
   Tant que le composant n'a pas le flag .is-visible (posé par
   l'IntersectionObserver lorsque l'élément entre à l'écran),
   toutes les animations sont en pause → grâce au fill-mode "both"
   sur chaque @keyframes, les éléments restent figés sur leur état
   "from" (opacité 0, translation/scale initiaux). Dès l'apparition
   du composant à l'écran, on bascule l'état en "running" et toute
   la cascade démarre. */
:host,
:host .pillar,
:host .hex,
:host .pillar-tag {
    animation-play-state: paused;
}
:host(.is-visible),
:host(.is-visible) .pillar,
:host(.is-visible) .hex,
:host(.is-visible) .pillar-tag {
    animation-play-state: running;
}

* { box-sizing: border-box; }

/* ---- Wrapper du SVG ---- */
.diagram-stage {
    position: relative;
    line-height: 0;
    overflow: visible;
}

#diagram {
    width: 100%;
    height: auto;
    display: block;
    margin: 0;
    overflow: visible;
}

/* ---- Animations d'apparition ---- */
@keyframes cardAppear {
    from { opacity: 0; transform: translateY(12px) scale(0.985); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
@keyframes tagAppear {
    /* Arrivée : léger déficit d’échelle puis neutre avant la boucle breathe. */
    from { opacity: 0; --breathe: 0.93; }
    to   { opacity: 1; --breathe: 1; }
}
@keyframes tagBreathe {
    /* Inspiration → micro-apnée → expiration plus longue (rythme
       respiratoire). Courbes ci-dessous : durée de montée courte,
       descente amortie. Toujours --breathe uniquement (GPU léger). */
    0% {
        --breathe: 1;
        animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
    }
    36% {
        --breathe: 1.055;
        animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
    }
    52% {
        --breathe: 1.04;
        animation-timing-function: cubic-bezier(0.22, 0.72, 0.25, 1);
    }
    100% {
        --breathe: 1;
    }
}

/* ---- Piliers (cercles pointillés) ---- */
.pillar {
    fill-opacity: 0.05;
    stroke-width: 2;
    stroke-dasharray: 18 5;
    stroke-opacity: 0.45;
    cursor: pointer;
    transition: all 0.3s ease;
    pointer-events: all;
    outline: none;
    animation: fadeIn 0.5s ease-out 0.3s both;
}
.pillar:focus { outline: none; }
.pillar[data-pillar="prevent"]      { stroke: var(--prevent);      fill: var(--prevent); }
.pillar[data-pillar="defense"]      { stroke: var(--defense);      fill: var(--defense); }
.pillar[data-pillar="architecture"] { stroke: var(--architecture); fill: var(--architecture); }
.pillar[data-pillar="governance"]   { stroke: var(--governance);   fill: var(--governance); }

.pillar:hover,
.pillar.is-hover {
    stroke-opacity: 1;
    fill-opacity: 0.09;
}
.pillar.is-active {
    stroke-opacity: 1;
    fill-opacity: 0.16;
}
.pillar.is-dim {
    opacity: 0.18;
    fill-opacity: 0.02;
}

/* ---- Hexagones ---- */
.hex {
    cursor: pointer;
    transition: opacity 0.2s ease;
    outline: none;
    animation: fadeIn 0.45s ease-out both;
}
.hex:focus { outline: none; }

.hex[data-hex="iam"]                  { animation-delay: 0.50s; }
.hex[data-hex="domain-security"]      { animation-delay: 0.58s; }
.hex[data-hex="products-services"]    { animation-delay: 0.62s; }
.hex[data-hex="asset-classification"] { animation-delay: 0.62s; }
.hex[data-hex="end-users"]            { animation-delay: 0.70s; }
.hex[data-hex="info-protection"]      { animation-delay: 0.70s; }
.hex[data-hex="business-app"]         { animation-delay: 0.74s; }
.hex[data-hex="security-hygiene"]     { animation-delay: 0.78s; }
.hex[data-hex="software-dev"]         { animation-delay: 0.78s; }
.hex[data-hex="third-party"]          { animation-delay: 0.85s; }

.hex polygon {
    fill: url(#hexGrad);
    stroke: #cbd5e1;
    stroke-width: 1.2;
    filter: url(#hexShadow);
    transform-box: fill-box;
    transform-origin: center;
    transition: fill 0.25s ease, stroke 0.25s ease, stroke-width 0.25s ease,
                filter 0.25s ease, transform 0.25s cubic-bezier(.2,.8,.2,1);
}

.hex[data-hex="info-protection"]      polygon { fill: url(#hg-info-protection); }
.hex[data-hex="business-app"]         polygon { fill: url(#hg-business-app); }
.hex[data-hex="software-dev"]         polygon { fill: url(#hg-software-dev); }
.hex[data-hex="domain-security"]      polygon { fill: url(#hg-domain-security); }
.hex[data-hex="security-hygiene"]     polygon { fill: url(#hg-security-hygiene); }
.hex[data-hex="end-users"]            polygon { fill: url(#hg-end-users); }
.hex[data-hex="asset-classification"] polygon { fill: url(#hg-asset-classification); }
.hex[data-hex="products-services"]    polygon { fill: url(#hg-products-services); }
.hex[data-hex="third-party"]          polygon { fill: url(#hg-third-party); }
.hex[data-hex="iam"]                  polygon { fill: url(#hg-iam); }

.hex .hex-label {
    text-anchor: middle;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 700;
    fill: #fe0706;
    stroke: none;
    pointer-events: none;
    user-select: none;
}
.hex .hex-label.small {
    font-size: 12px;
    font-weight: 700;
    fill: #fe0706;
}

.hex:hover polygon {
    fill: hsl(215, 38%, 82%);
    stroke: #94a3b8;
    stroke-width: 1.8;
    transform: scale(1.04);
    filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.2));
}

.hex:hover .hex-label { fill: #fe0706; }

.hex.is-active polygon {
    fill: var(--accent);
    stroke: var(--accent-dark);
    stroke-width: 1.8;
}
.hex.is-active .hex-label { fill: #fff; }
.hex.is-dim { opacity: 0.25; }

/* Mise en évidence : teintes sombres + trait pilier (texte blanc) */
#diagram[data-active-pillar="prevent"]       { --pillar-fill: hsl(352, 32%, 16%); --pillar-stroke: var(--prevent); }
#diagram[data-active-pillar="defense"]       { --pillar-fill: hsl(224, 36%, 15%); --pillar-stroke: var(--defense); }
#diagram[data-active-pillar="architecture"] { --pillar-fill: hsl(192, 34%, 14%); --pillar-stroke: var(--architecture); }
#diagram[data-active-pillar="governance"]   { --pillar-fill: hsl(32,  34%, 14%); --pillar-stroke: var(--governance); }

.hex.is-highlight polygon {
    fill: var(--pillar-fill, hsl(222, 40%, 14%));
    stroke: var(--pillar-stroke, var(--accent-dark));
    stroke-width: 1.5;
}

.hex.is-highlight .hex-label { fill: #ffffff; }

.hex-core polygon { stroke-width: 1.5; fill: url(#hg-iam); }

/* ---- Étiquettes pilier (carte type “call card” : icône ronde + texte en colonne) ----
   Font-size en cqw ; paddings / rayons en em pour suivre la taille du host. */
.pillar-tag {
    --pt-color: #0f172a;
    --pt-rgb: 15, 23, 42;

    position: absolute;
    z-index: 5;
    display: inline-flex;
    align-items: center;
    gap: 0.75em;
    padding: 0.75em 1em 0.75em 0.75em;
    border-radius: 1.1em;

    background: #ffffff;
    color: #0e1629;
    font-size: clamp(8.5px, 1.45cqw, 12.5px);
    line-height: 1.25;
    letter-spacing: 0.01em;

    border: 1px solid #e2e8f0;
    box-shadow:
        0 1px 2px rgba(15, 23, 42, 0.04),
        0 4px 14px rgba(15, 23, 42, 0.06);

    box-sizing: border-box;
    flex-shrink: 0;

    user-select: none;
    cursor: pointer;
    white-space: normal;
    max-width: min(220px, 42vw);
    isolation: isolate;
    will-change: transform;
    backface-visibility: hidden;
    transform: translate3d(var(--tx, 0%), var(--ty, 0%), 0) scale(var(--breathe, 1));
    transition:
        box-shadow 0.2s ease,
        border-color 0.2s ease,
        background 0.2s ease,
        color 0.2s ease;
    outline: none;
    animation:
        tagAppear  0.55s cubic-bezier(.2,.82,.14,1) both,
        tagBreathe 6.75s cubic-bezier(.45,.02,.55,.98) infinite;
    animation-delay: 0.95s, 1.72s;
    transform-origin: center;
}

.pillar-tag.pt-prevent      { animation-delay: 0.95s, 1.65s; }
.pillar-tag.pt-defense      { animation-delay: 0.95s, 1.93s; }
.pillar-tag.pt-architecture { animation-delay: 0.95s, 2.22s; }
.pillar-tag.pt-governance   { animation-delay: 0.95s, 2.48s; }

.pt-prevent      { --pt-color: var(--prevent);      --pt-rgb: 230, 57, 70; }
.pt-defense      { --pt-color: var(--defense);      --pt-rgb: 29, 78, 216; }
.pt-architecture { --pt-color: var(--architecture); --pt-rgb: 8, 145, 178; }
.pt-governance   { --pt-color: var(--governance);   --pt-rgb: 180, 83, 9; }

.pillar-tag:hover,
.pillar-tag:focus-visible {
    transform: translate3d(var(--tx, 0%), var(--ty, 0%), 0) scale(var(--breathe, 1));
    border-color: #cbd5e1;
    box-shadow:
        0 2px 4px rgba(15, 23, 42, 0.06),
        0 8px 24px rgba(15, 23, 42, 0.1);
}

.pillar-tag:active {
    transform: translate3d(var(--tx, 0%), var(--ty, 0%), 0)
        scale(calc(var(--breathe, 1) * 0.985));
    box-shadow:
        0 1px 2px rgba(15, 23, 42, 0.05),
        0 2px 8px rgba(15, 23, 42, 0.06);
    transition-duration: 0.06s;
}

.pillar-tag.is-active {
    background: var(--pt-color);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow:
        0 2px 8px rgba(14, 22, 41, 0.2),
        0 8px 28px rgba(14, 22, 41, 0.12);
}

.pillar-tag.is-active .pt-text {
    color: #ffffff;
}

.pillar-tag.is-active .pt-kind {
    color: rgba(255, 255, 255, 0.88);
}

.pillar-tag .pt-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
}

.pillar-tag .pt-icon svg {
    display: block;
    width: 1.82em;
    height: auto;
    max-height: 2.12em;
    flex-shrink: 0;
}

.pillar-tag .pt-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2em;
    min-width: 0;
}

.pillar-tag .pt-text {
    display: block;
    font-weight: 700;
    font-size: 1.08em;
    letter-spacing: 0.01em;
    color: #0e1629;
    line-height: 1.2;
}

.pillar-tag .pt-kind {
    display: block;
    font-weight: 400;
    font-size: 0.84em;
    letter-spacing: 0.02em;
    text-transform: none;
    color: #64748b;
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
}

/* Position de chaque tag (ancrage diagramme) */
.pt-prevent      { --tx: -100%; --ty: -100%; left: 26.55%; top: 14.08%; }
.pt-defense      { --tx:    0%; --ty: -100%; left: 73.45%; top: 14.08%; }
.pt-architecture { --tx: -100%; --ty:    0%; left: 26.55%; top: 85.92%; }
.pt-governance   { --tx:    0%; --ty:    0%; left: 73.45%; top: 85.92%; }

/* Container query : le label "PILIER" est masqué quand le composant
   lui-même devient étroit (pas le viewport). Les autres sizings
   suivent automatiquement la font-size en cqw → pas besoin d'autres
   overrides ici. */
@container cyberdiagram (max-width: 600px) {
    .pillar-tag .pt-kind { display: none; }
}

@media (prefers-reduced-motion: reduce) {
    :host,
    .pillar,
    .hex,
    .pillar-tag,
    .pillar-tag::after,
    .pillar-tag::before {
        animation: none !important;
        transition: none !important;
    }
    .pillar-tag {
        will-change: auto !important;
    }
}`;

    /* ----------------------------- Template ---------------------------- */
    /* HTML rendu dans le shadow root. */
    const TEMPLATE = `
<div class="diagram-stage">
    <svg id="diagram" viewBox="0 141 1000 630" preserveAspectRatio="xMidYMid meet"
         xmlns="http://www.w3.org/2000/svg" role="img"
         aria-label="Interactive diagram of cybersecurity pillars and capabilities">
        <defs>
            <!-- Fonds hex : famille #e2e8f0 (H≈215°), même écarts de saturation qu’avant entre hex. -->
            <radialGradient id="hexGrad" cx="50%" cy="38%" r="72%">
                <stop offset="0%" stop-color="hsl(215, 32%, 93%)"/><stop offset="100%" stop-color="hsl(215, 44%, 86%)"/>
            </radialGradient>
            <radialGradient id="hg-info-protection"      cx="50%" cy="32%" r="82%">
                <stop offset="0%" stop-color="hsl(215, 22%, 94%)"/><stop offset="100%" stop-color="hsl(215, 38%, 87%)"/>
            </radialGradient>
            <radialGradient id="hg-business-app"         cx="50%" cy="32%" r="82%">
                <stop offset="0%" stop-color="hsl(215, 40%, 92%)"/><stop offset="100%" stop-color="hsl(215, 52%, 84%)"/>
            </radialGradient>
            <radialGradient id="hg-software-dev"         cx="50%" cy="32%" r="82%">
                <stop offset="0%" stop-color="hsl(215, 28%, 94%)"/><stop offset="100%" stop-color="hsl(215, 36%, 87%)"/>
            </radialGradient>
            <radialGradient id="hg-domain-security"      cx="50%" cy="32%" r="82%">
                <stop offset="0%" stop-color="hsl(215, 18%, 94.5%)"/><stop offset="100%" stop-color="hsl(215, 32%, 87%)"/>
            </radialGradient>
            <radialGradient id="hg-security-hygiene"     cx="50%" cy="32%" r="82%">
                <stop offset="0%" stop-color="hsl(215, 46%, 91.5%)"/><stop offset="100%" stop-color="hsl(215, 42%, 84%)"/>
            </radialGradient>
            <radialGradient id="hg-end-users"            cx="50%" cy="32%" r="82%">
                <stop offset="0%" stop-color="hsl(215, 26%, 93.5%)"/><stop offset="100%" stop-color="hsl(215, 48%, 84%)"/>
            </radialGradient>
            <radialGradient id="hg-asset-classification" cx="50%" cy="32%" r="82%">
                <stop offset="0%" stop-color="hsl(215, 20%, 94%)"/><stop offset="100%" stop-color="hsl(215, 40%, 86.5%)"/>
            </radialGradient>
            <radialGradient id="hg-products-services"    cx="50%" cy="32%" r="82%">
                <stop offset="0%" stop-color="hsl(215, 35%, 93%)"/><stop offset="100%" stop-color="hsl(215, 45%, 85%)"/>
            </radialGradient>
            <radialGradient id="hg-third-party"          cx="50%" cy="32%" r="82%">
                <stop offset="0%" stop-color="hsl(215, 30%, 93%)"/><stop offset="100%" stop-color="hsl(215, 38%, 86.5%)"/>
            </radialGradient>
            <radialGradient id="hg-iam"                  cx="50%" cy="30%" r="85%">
                <stop offset="0%" stop-color="hsl(215, 42%, 93%)"/><stop offset="100%" stop-color="hsl(215, 50%, 84%)"/>
            </radialGradient>
            <filter id="hexShadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="#000" flood-opacity="0.12"/>
            </filter>
        </defs>

        <!-- Zoom géométrique des cercles + hexagones (scale 13,5 % depuis le centre IAM).
             Incrément : +4,5 pts par rapport à 1,09 (la moitié du premier +9 %). -->
        <g transform="translate(500,456) scale(1.135) translate(-500,-456)">
        <g class="pillars">
            <circle class="pillar" data-pillar="prevent"      cx="400" cy="376" r="235"/>
            <circle class="pillar" data-pillar="defense"      cx="600" cy="376" r="235"/>
            <circle class="pillar" data-pillar="architecture" cx="400" cy="536" r="235"/>
            <circle class="pillar" data-pillar="governance"   cx="600" cy="536" r="235"/>
        </g>

        <g class="hex-cluster" transform="translate(0,48)">
            <g class="hex" data-hex="business-app" data-pillars="prevent" transform="translate(250,312)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-22">Organization</text>
                <text class="hex-label" y="0">Business</text>
                <text class="hex-label" y="22">Application</text>
            </g>
            <g class="hex" data-hex="info-protection" data-pillars="prevent" transform="translate(375,240)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-11">Information</text>
                <text class="hex-label" y="15">Protection</text>
            </g>
            <g class="hex" data-hex="products-services" data-pillars="prevent,architecture" transform="translate(375,384)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-22">Organization</text>
                <text class="hex-label" y="0">Products &amp;</text>
                <text class="hex-label" y="22">Services</text>
            </g>
            <g class="hex" data-hex="security-hygiene" data-pillars="architecture" transform="translate(375,528)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-22">Security</text>
                <text class="hex-label" y="0">Hygiene &amp;</text>
                <text class="hex-label" y="22">Essentials</text>
            </g>
            <g class="hex" data-hex="domain-security" data-pillars="prevent,defense" transform="translate(500,312)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-22">Organization</text>
                <text class="hex-label" y="0">Domain Security</text>
                <text class="hex-label small" y="22">(LAN, WAN)</text>
            </g>
            <g class="hex hex-core" data-hex="iam" data-pillars="prevent,defense,architecture,governance" transform="translate(500,456)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-22">Identity &amp;</text>
                <text class="hex-label" y="0">Access</text>
                <text class="hex-label" y="22">Management</text>
            </g>
            <g class="hex" data-hex="end-users" data-pillars="defense" transform="translate(625,240)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-22">End-Users</text>
                <text class="hex-label" y="0">and People</text>
                <text class="hex-label" y="22">Security</text>
            </g>
            <g class="hex" data-hex="asset-classification" data-pillars="defense,governance" transform="translate(625,384)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-33">Information</text>
                <text class="hex-label" y="-11">Asset</text>
                <text class="hex-label" y="11">Classification</text>
                <text class="hex-label" y="33">&amp; Handling</text>
            </g>
            <g class="hex" data-hex="software-dev" data-pillars="architecture,governance" transform="translate(625,528)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-11">Software</text>
                <text class="hex-label" y="15">Development</text>
            </g>
            <g class="hex" data-hex="third-party" data-pillars="governance" transform="translate(750,456)">
                <polygon points="78,0 39,68 -39,68 -78,0 -39,-68 39,-68"/>
                <text class="hex-label" y="-22">Suppliers,</text>
                <text class="hex-label" y="0">Partners &amp;</text>
                <text class="hex-label" y="22">Third Party</text>
            </g>
        </g>
        </g>
    </svg>

    <div class="pillar-tag pt-prevent" data-pillar-tag="prevent">
        <span class="pt-icon" aria-hidden="true"><svg viewBox="0 0 11.024133 11.02465" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(-211.86768,-335.29324)"><path fill="#fe0708" d="m 222.38901,338.5044 -2.40709,0.4656 a 3.1843031,3.1843031 0 0 1 0.58239,1.83555 3.1843031,3.1843031 0 0 1 -0.85369,2.16938 l 2.50114,0.48369 a 5.5122003,5.5122003 0 0 0 0.68006,-2.65307 5.5122003,5.5122003 0 0 0 -0.50281,-2.30115 z"/><path fill="#e2e8f0" d="m 217.37949,335.29322 a 5.5122003,5.5122003 0 0 0 -5.51181,5.51233 5.5122003,5.5122003 0 0 0 5.51181,5.51232 5.5122003,5.5122003 0 0 0 4.83227,-2.85925 l -2.50114,-0.48369 a 3.1843031,3.1843031 0 0 1 -2.33113,1.01492 3.1843031,3.1843031 0 0 1 -3.18378,-3.1843 3.1843031,3.1843031 0 0 1 3.18378,-3.1843 3.1843031,3.1843031 0 0 1 2.60243,1.34875 l 2.40709,-0.4656 a 5.5122003,5.5122003 0 0 0 -5.00952,-3.21118 z"/></g></svg></span>
        <span class="pt-body">
            <span class="pt-text">Prevent</span>
            <span class="pt-kind">Pillar</span>
        </span>
    </div>
    <div class="pillar-tag pt-defense" data-pillar-tag="defense">
        <span class="pt-icon" aria-hidden="true"><svg viewBox="0 0 11.622029 12.038025" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(-243.08595,-327.95105)"><path fill="#fe0708" d="m 254.15554,331.93994 -3.03909,0.58808 a 3.1843031,3.1843031 0 0 1 0.66611,1.94872 3.1843031,3.1843031 0 0 1 -0.63097,1.90272 l 2.42259,0.46819 a 5.5122003,5.5122003 0 0 0 0.53589,-2.33629 h 0.0455 z"/><path fill="#e2e8f0" d="m 252.94528,327.95104 -0.84646,0.52865 -0.84698,0.52916 0.55553,-0.003 v 0.98909 a 5.5122003,5.5122003 0 0 0 -3.20911,-1.03043 5.5122003,5.5122003 0 0 0 -5.51233,5.51181 5.5122003,5.5122003 0 0 0 5.51233,5.51232 5.5122003,5.5122003 0 0 0 4.97592,-3.14141 l -2.42259,-0.46819 a 3.1843031,3.1843031 0 0 1 -2.55333,1.28158 3.1843031,3.1843031 0 0 1 -3.1843,-3.1843 3.1843031,3.1843031 0 0 1 3.1843,-3.1843 3.1843031,3.1843031 0 0 1 2.51819,1.23558 l 3.03909,-0.58808 v -2.94297 l 0.55242,-0.002 -0.88108,-0.52193 z"/></g></svg></span>
        <span class="pt-body">
            <span class="pt-text">Defense</span>
            <span class="pt-kind">Pillar</span>
        </span>
    </div>
    <div class="pillar-tag pt-architecture" data-pillar-tag="architecture">
        <span class="pt-icon" aria-hidden="true"><svg viewBox="0 0 11.622336 12.038316" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(-227.76409,-322.54982)"><g transform="matrix(0.19616395,0,0,0.19616395,170.95132,259.99954)"><path fill="#fe0708" d="m 261.92375,277.92298 a 28.099966,28.099966 0 0 0 -28.09957,28.10009 28.099966,28.099966 0 0 0 28.09957,28.1001 28.099966,28.099966 0 0 0 28.1001,-28.1001 28.099966,28.099966 0 0 0 -28.1001,-28.10009 z m 0,11.86697 a 16.232866,16.232866 0 0 1 16.23312,16.23312 16.232866,16.232866 0 0 1 -16.23312,16.23312 16.232866,16.232866 0 0 1 -16.2326,-16.23312 16.232866,16.232866 0 0 1 16.2326,-16.23312 z"/><g transform="matrix(1.360459,0,0,-1,-198.61682,594.36935)" fill="#fe0708"><rect width="8.7992821" height="28.806591" x="317.69418" y="259.7157"/><path d="m 50.709554,43.804741 -4.569632,-1.742196 -4.569633,-1.742195 3.793602,-3.08632 3.793602,-3.08632 0.77603,4.828515 z" transform="matrix(1.2426737,-0.21845632,0.45747191,0.59341328,245.52027,245.55378)"/></g></g><g><g fill="#e2e8f0"><path fill="#fe0708" d="m 238.93115,325.86899 -2.38539,0.46096 a 3.1843031,3.1843031 0 0 1 0.51264,1.73219 3.1843031,3.1843031 0 0 1 -0.68627,1.97507 l 2.4412,0.47181 a 5.5122003,5.5122003 0 0 0 0.57309,-2.44688 5.5122003,5.5122003 0 0 0 -0.45527,-2.19315 z"/><path d="m 233.87409,322.54982 a 5.5122003,5.5122003 0 0 0 -5.51232,5.51232 5.5122003,5.5122003 0 0 0 5.51232,5.51233 5.5122003,5.5122003 0 0 0 4.93924,-3.06545 l -2.4412,-0.47181 a 3.1843031,3.1843031 0 0 1 -2.49804,1.20923 3.1843031,3.1843031 0 0 1 -3.1843,-3.1843 3.1843031,3.1843031 0 0 1 3.1843,-3.1843 3.1843031,3.1843031 0 0 1 2.67167,1.45211 l 2.38539,-0.46096 a 5.5122003,5.5122003 0 0 0 -5.05706,-3.31917 z"/><rect width="2.3482909" height="5.6508145" x="228.31656" y="-333.67853" transform="scale(1,-1)"/><path d="m 50.709554,43.804741 -4.569632,-1.742196 -4.569633,-1.742195 3.793602,-3.08632 3.793602,-3.08632 0.77603,4.828515 z" transform="matrix(0.33163607,0.04285325,0.12208691,-0.11640629,209.05528,336.45659)"/></g></g></g></svg></span>
        <span class="pt-body">
            <span class="pt-text">Architecture</span>
            <span class="pt-kind">Pillar</span>
        </span>
    </div>
    <div class="pillar-tag pt-governance" data-pillar-tag="governance">
        <span class="pt-icon" aria-hidden="true"><svg viewBox="0 0 11.024133 11.02465" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(-211.86768,-335.29324)"><path fill="#fe0708" d="m 222.38901,338.5044 -2.40709,0.4656 a 3.1843031,3.1843031 0 0 1 0.58239,1.83555 3.1843031,3.1843031 0 0 1 -0.85369,2.16938 l 2.50114,0.48369 a 5.5122003,5.5122003 0 0 0 0.68006,-2.65307 5.5122003,5.5122003 0 0 0 -0.50281,-2.30115 z"/><path fill="#e2e8f0" d="m 217.37949,335.29322 a 5.5122003,5.5122003 0 0 0 -5.51181,5.51233 5.5122003,5.5122003 0 0 0 5.51181,5.51232 5.5122003,5.5122003 0 0 0 4.83227,-2.85925 l -2.50114,-0.48369 a 3.1843031,3.1843031 0 0 1 -2.33113,1.01492 3.1843031,3.1843031 0 0 1 -3.18378,-3.1843 3.1843031,3.1843031 0 0 1 3.18378,-3.1843 3.1843031,3.1843031 0 0 1 2.60243,1.34875 l 2.40709,-0.4656 a 5.5122003,5.5122003 0 0 0 -5.00952,-3.21118 z"/></g></svg></span>
        <span class="pt-body">
            <span class="pt-text">Governance</span>
            <span class="pt-kind">Pillar</span>
        </span>
    </div>
</div>`;

    /* ------------------ Styles globaux du tooltip ----------------------- */
    /* Le tooltip est posé sur <body> (pour ne pas être clippé par
       l'overflow:hidden du host) → il faut donc une feuille de style
       globale, injectée une seule fois pour toutes les instances. */
    const TOOLTIP_STYLES = `
.cyber-diagram-tooltip {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
    max-width: 280px;
    padding: 0.7rem 0.9rem;
    background: #f8fafc;
    color: #000000;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow:
        0 10px 28px -10px rgba(15, 23, 42, 0.12),
        0 2px 8px rgba(15, 23, 42, 0.08);
    font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 0.78rem;
    line-height: 1.5;
    opacity: 0;
    transform: translate(-50%, calc(-100% - 14px)) scale(0.96);
    transform-origin: bottom center;
    transition:
        opacity 0.18s ease,
        transform 0.18s cubic-bezier(.2,.8,.2,1);
}
.cyber-diagram-tooltip.is-visible {
    opacity: 1;
    transform: translate(-50%, calc(-100% - 14px)) scale(1);
}
.cyber-diagram-tooltip-title {
    margin: 0 0 0.3rem;
    font-size: 0.84rem;
    font-weight: 700;
    color: #000000;
    letter-spacing: 0.01em;
}
.cyber-diagram-tooltip-desc {
    margin: 0;
    color: #000000;
}
.cyber-diagram-tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -5px;
    width: 10px;
    height: 10px;
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    transform: translateX(-50%) rotate(45deg);
}`;

    let _tooltipStylesInjected = false;
    function ensureTooltipStyles() {
        if (_tooltipStylesInjected) return;
        _tooltipStylesInjected = true;
        const style = document.createElement("style");
        style.setAttribute("data-cyber-diagram", "tooltip");
        style.textContent = TOOLTIP_STYLES;
        document.head.appendChild(style);
    }

    /* --------------------- Définition du composant --------------------- */
    class CyberDiagram extends HTMLElement {
        static get observedAttributes() {
            return ["lang"];
        }

        constructor() {
            super();
            this.attachShadow({ mode: "open" });
            this._activePillar = null;
            this._activeHex = null;
            this._hoverPreview = false;
            this._lang = DEFAULT_LANG;
        }

        attributeChangedCallback(name, _oldVal, newVal) {
            if (name !== "lang" || !this._initialized) return;
            const next = normalizeLang(newVal);
            if (next === this._lang) return;
            this._applyLanguage(next);
        }

        connectedCallback() {
            if (this._initialized) return;
            this._initialized = true;

            this.shadowRoot.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`;
            this._cacheRefs();
            this._lang = normalizeLang(this.getAttribute("lang"));
            this._applyLanguage(this._lang);
            this._bindEvents();
            this._createTooltip();
            this._setupVisibilityObserver();
            this._setupPillarTagWidthSync();
        }

        disconnectedCallback() {
            this._tooltip?.remove();
            this._tooltip = null;
            this._observer?.disconnect();
            this._observer = null;
            if (this._pillarTagResizeObserver) {
                this._pillarTagResizeObserver.disconnect();
                this._pillarTagResizeObserver = null;
            }
            if (this._pillarTagWidthDebounce != null) {
                window.clearTimeout(this._pillarTagWidthDebounce);
                this._pillarTagWidthDebounce = null;
            }
            this._pillarTags?.forEach((t) => t.style.removeProperty("width"));
            this._pillarTagLastObservedW = undefined;
            if (this._escHandler) {
                document.removeEventListener("keydown", this._escHandler);
                this._escHandler = null;
            }
            this._initialized = false;
        }

        /* --- Démarrage différé des animations ---
           IntersectionObserver : on ajoute la classe .is-visible sur le
           host dès que le composant entre dans le viewport (10% visible).
           Les animations en pause se mettent alors à tourner. On
           déconnecte l'observer après le premier trigger : la cascade
           ne joue qu'une seule fois. */
        _setupVisibilityObserver() {
            // Si l'API n'est pas dispo (navigateur très ancien), on joue
            // directement les animations sans gate.
            if (typeof IntersectionObserver === "undefined") {
                this.classList.add("is-visible");
                this._scheduleSyncPillarTagWidths();
                return;
            }
            this._observer = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            this.classList.add("is-visible");
                            this._scheduleSyncPillarTagWidths();
                            this._observer.disconnect();
                            this._observer = null;
                            break;
                        }
                    }
                },
                { threshold: 0.1 },
            );
            this._observer.observe(this);
        }

        /* --- Harmonisation largeur tags pilier --- */
        /* On mesure la largeur intrinsic (offsetWidth pour ignorer scale()
           du breathe) puis on applique le max à tous. Recalculé au
           redimensionnement du composant (@container PILIER peut
           réapparaître / changer de taille de police).
        */
        _scheduleSyncPillarTagWidths() {
            requestAnimationFrame(() =>
                requestAnimationFrame(() => this._syncPillarTagWidths()),
            );
        }

        _syncPillarTagWidths() {
            const tags = this._pillarTags;
            if (!tags || !tags.length) return;

            tags.forEach((tag) => tag.style.removeProperty("width"));
            void tags[0].offsetWidth;

            let max = 0;
            tags.forEach((tag) => {
                max = Math.max(max, tag.offsetWidth);
            });
            if (max <= 0) return;

            const w = `${Math.ceil(max)}px`;
            tags.forEach((tag) => {
                tag.style.width = w;
            });
        }

        _setupPillarTagWidthSync() {
            /* Premier calcul après mise en layout (double rAF) */
            this._scheduleSyncPillarTagWidths();

            if (typeof ResizeObserver === "undefined") return;

            this._pillarTagResizeObserver = new ResizeObserver((entries) => {
                const w = entries[0]?.contentRect?.width;
                if (w == null) return;
                if (
                    this._pillarTagLastObservedW != null &&
                    Math.abs(w - this._pillarTagLastObservedW) < 1
                ) {
                    return;
                }
                this._pillarTagLastObservedW = w;
                window.clearTimeout(this._pillarTagWidthDebounce);
                this._pillarTagWidthDebounce = window.setTimeout(
                    () => this._syncPillarTagWidths(),
                    45,
                );
            });
            this._pillarTagResizeObserver.observe(this);
        }
        _cacheRefs() {
            const r = this.shadowRoot;
            this._svg = r.getElementById("diagram");
            this._hexNodes = r.querySelectorAll(".hex");
            this._pillarNodes = r.querySelectorAll(".pillar");
            this._pillarTags = r.querySelectorAll(".pillar-tag");

            this._pillarByKey = {};
            this._pillarNodes.forEach((p) => {
                this._pillarByKey[p.dataset.pillar] = p;
            });
        }

        _applyLanguage(lang) {
            this._lang = normalizeLang(lang);
            if (!this._svg) return;

            this._updateHexLabels();
            this._updatePillarTagsLang();
            this._updateDiagramAria();
            this._updateAriaLabels();
            this._scheduleSyncPillarTagWidths();
        }

        _updateHexLabels() {
            const L = this._lang;
            this._hexNodes.forEach((node) => {
                const key = node.dataset.hex;
                const lines =
                    HEX_LINE_LABELS[L]?.[key] ||
                    HEX_LINE_LABELS[DEFAULT_LANG][key];
                if (!lines) return;
                const labels = node.querySelectorAll(".hex-label");
                labels.forEach((el, i) => {
                    if (lines[i] != null) el.textContent = lines[i];
                });
            });
        }

        _updatePillarTagsLang() {
            const ui = getUi(this._lang);
            this._pillarTags.forEach((tag) => {
                const pk = tag.dataset.pillarTag;
                const tEl = tag.querySelector(".pt-text");
                const kEl = tag.querySelector(".pt-kind");
                if (tEl) {
                    tEl.textContent =
                        ui.pillarTagTitle[pk] || pk;
                }
                if (kEl) kEl.textContent = ui.pillarTagKind;
            });
        }

        _updateDiagramAria() {
            this._svg.setAttribute(
                "aria-label",
                getUi(this._lang).diagramAria,
            );
        }

        _updateAriaLabels() {
            this._hexNodes.forEach((node) => {
                const data = getHexData(this._lang, node.dataset.hex);
                node.setAttribute("tabindex", "0");
                node.setAttribute("role", "button");
                node.setAttribute(
                    "aria-label",
                    data?.name || node.dataset.hex,
                );
            });
            this._pillarNodes.forEach((node) => {
                const data = getPillarData(this._lang, node.dataset.pillar);
                node.setAttribute("tabindex", "0");
                node.setAttribute("role", "button");
                node.setAttribute(
                    "aria-label",
                    data?.name || node.dataset.pillar,
                );
            });
            this._pillarTags.forEach((tag) => {
                const data = getPillarData(this._lang, tag.dataset.pillarTag);
                tag.setAttribute("tabindex", "0");
                tag.setAttribute("role", "button");
                tag.setAttribute(
                    "aria-label",
                    data?.name || tag.dataset.pillarTag,
                );
            });
        }

        /** Définit la langue du diagramme : `"en"` ou `"fr"`. */
        setLanguage(lang) {
            this.setAttribute("lang", normalizeLang(lang));
        }

        /* --- Tooltip (élément posé sur <body>) --- */
        _createTooltip() {
            ensureTooltipStyles();
            const tip = document.createElement("div");
            tip.className = "cyber-diagram-tooltip";
            tip.setAttribute("role", "tooltip");
            tip.setAttribute("aria-hidden", "true");
            document.body.appendChild(tip);
            this._tooltip = tip;
        }

        _showHexTooltip(hexKey, x, y) {
            const data = getHexData(this._lang, hexKey);
            if (!data || !this._tooltip) return;
            this._tooltip.innerHTML = `
                <p class="cyber-diagram-tooltip-title">${data.name}</p>
                <p class="cyber-diagram-tooltip-desc">${data.description}</p>
            `;
            this._tooltip.style.left = `${x}px`;
            this._tooltip.style.top = `${y}px`;
            this._tooltip.classList.add("is-visible");
            this._tooltip.setAttribute("aria-hidden", "false");
        }

        _moveHexTooltip(x, y) {
            if (!this._tooltip || !this._tooltip.classList.contains("is-visible")) return;
            this._tooltip.style.left = `${x}px`;
            this._tooltip.style.top = `${y}px`;
        }

        _hideHexTooltip() {
            if (!this._tooltip) return;
            this._tooltip.classList.remove("is-visible");
            this._tooltip.setAttribute("aria-hidden", "true");
        }

        /* --- État visuel --- */
        clearActive() {
            this._hexNodes.forEach((n) =>
                n.classList.remove("is-active", "is-dim", "is-highlight"),
            );
            this._pillarNodes.forEach((n) =>
                n.classList.remove("is-active", "is-dim"),
            );
            this._pillarTags.forEach((t) => t.classList.remove("is-active"));
            delete this._svg.dataset.activePillar;
            this._activePillar = null;
            this._activeHex = null;
        }

        activatePillar(pillarKey) {
            this.clearActive();
            this._activePillar = pillarKey;
            this._svg.dataset.activePillar = pillarKey;

            this._pillarNodes.forEach((p) => {
                if (p.dataset.pillar === pillarKey) p.classList.add("is-active");
                else p.classList.add("is-dim");
            });
            this._hexNodes.forEach((h) => {
                const pillars = (h.dataset.pillars || "").split(",");
                if (pillars.includes(pillarKey)) h.classList.add("is-highlight");
                else h.classList.add("is-dim");
            });
            this._pillarTags.forEach((t) => {
                if (t.dataset.pillarTag === pillarKey) t.classList.add("is-active");
            });
        }

        activateHex(hexKey) {
            this.clearActive();
            this._activeHex = hexKey;

            this._hexNodes.forEach((h) => {
                if (h.dataset.hex === hexKey) h.classList.add("is-active");
                else h.classList.add("is-dim");
            });

            const data = getHexData(this._lang, hexKey);
            if (data) {
                this._pillarNodes.forEach((p) => {
                    if (data.pillars.includes(p.dataset.pillar))
                        p.classList.add("is-active");
                    else p.classList.add("is-dim");
                });
            }
        }

        /* --- Bindings --- */
        _bindEvents() {
            // Hexagones
            this._hexNodes.forEach((node) => {
                const key = node.dataset.hex;

                node.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (this._activeHex === key) this.clearActive();
                    else this.activateHex(key);
                });
                node.addEventListener("mouseenter", (e) => {
                    this._showHexTooltip(key, e.clientX, e.clientY);
                });
                node.addEventListener("mousemove", (e) => {
                    this._moveHexTooltip(e.clientX, e.clientY);
                });
                node.addEventListener("mouseleave", () => {
                    this._hideHexTooltip();
                });
                node.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        node.dispatchEvent(new Event("click", { bubbles: true }));
                    }
                });
            });

            // Cercles (piliers)
            this._pillarNodes.forEach((node) => {
                const key = node.dataset.pillar;
                node.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (this._activePillar === key) this.clearActive();
                    else this.activatePillar(key);
                });
                node.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        node.dispatchEvent(new Event("click", { bubbles: true }));
                    }
                });
            });

            // Étiquettes "PILIER" flottantes
            this._pillarTags.forEach((tag) => {
                const key = tag.dataset.pillarTag;
                const pillar = this._pillarByKey[key];
                if (!pillar) return;

                tag.addEventListener("mouseenter", () => {
                    pillar.classList.add("is-hover");
                });
                tag.addEventListener("mouseleave", () => {
                    pillar.classList.remove("is-hover");
                });
                tag.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (this._activePillar === key) this.clearActive();
                    else this.activatePillar(key);
                });
                tag.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        tag.dispatchEvent(new Event("click", { bubbles: true }));
                    }
                });
            });

            // Reset au clic sur le fond du SVG, ou via Échap
            this._svg.addEventListener("click", (e) => {
                if (e.target === this._svg) this.clearActive();
            });
            this._escHandler = (e) => {
                if (e.key === "Escape") this.clearActive();
            };
            document.addEventListener("keydown", this._escHandler);
        }
    }

    customElements.define("cyber-diagram", CyberDiagram);
})();
