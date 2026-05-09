from __future__ import annotations

import json
from itertools import cycle
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TOPICS_PATH = ROOT / "src/lib/data/topics.json"
OUTPUT_PATH = ROOT / "src/lib/data/topic-branding.json"

FALLBACK_GRADIENTS = cycle(
    [
        "from-[#0f5b5c] via-[#1f7a78] to-[#d4a34f]",
        "from-[#123f5f] via-[#2a6585] to-[#c58f44]",
        "from-[#3f224d] via-[#72408b] to-[#d0a058]",
        "from-[#304a36] via-[#4c7a57] to-[#d8b26a]",
    ]
)

PRESETS = {
    "Contextualizing Care": {
        "mark": "CC",
        "gradient": "from-[#6b2f68] via-[#9e4b7e] to-[#e0b16b]",
        "accent": "#9e4b7e",
        "badgeClass": "bg-[#f5e8f3] text-[#6b2f68] dark:bg-[#2d1830] dark:text-[#efc8e7]",
        "description": "Context-aware clinical practice built for human-centered Saudi care delivery.",
    },
    "ClaimLINC": {
        "mark": "CL",
        "gradient": "from-[#8a4a14] via-[#c17127] to-[#f1bb63]",
        "accent": "#c17127",
        "badgeClass": "bg-[#fff0df] text-[#8a4a14] dark:bg-[#2f2013] dark:text-[#ffd3a1]",
        "description": "Revenue-cycle precision, payer fluency, and operational control for claims teams.",
    },
    "AI Healthcare": {
        "mark": "AI",
        "gradient": "from-[#162b66] via-[#3757b6] to-[#7bc0ff]",
        "accent": "#3757b6",
        "badgeClass": "bg-[#e6efff] text-[#23428f] dark:bg-[#162343] dark:text-[#b7ceff]",
        "description": "Applied AI literacy for clinical, operational, and patient-experience transformation.",
    },
    "Decarbonization": {
        "mark": "DC",
        "gradient": "from-[#1e4b37] via-[#3e7a5b] to-[#c8b06c]",
        "accent": "#3e7a5b",
        "badgeClass": "bg-[#eaf5ef] text-[#23563f] dark:bg-[#15291f] dark:text-[#b8dec6]",
        "description": "Sustainable healthcare operations with measurable environmental stewardship.",
    },
    "Dental Care": {
        "mark": "DN",
        "gradient": "from-[#0d5b6a] via-[#2b8aa0] to-[#b9d8df]",
        "accent": "#2b8aa0",
        "badgeClass": "bg-[#e3f7fb] text-[#0d5b6a] dark:bg-[#12262b] dark:text-[#b6e5ee]",
        "description": "Modern dental quality and safety programs grounded in disciplined care standards.",
    },
    "FHIR R4": {
        "mark": "F4",
        "gradient": "from-[#0f4268] via-[#2a6fa4] to-[#7db8de]",
        "accent": "#2a6fa4",
        "badgeClass": "bg-[#e4f0f9] text-[#0f4268] dark:bg-[#112131] dark:text-[#b5d3ea]",
        "description": "Interoperability fluency for teams building dependable clinical data exchange.",
    },
    "Graduate Medical Education": {
        "mark": "GM",
        "gradient": "from-[#2f3d68] via-[#5b6fb2] to-[#d4b06a]",
        "accent": "#5b6fb2",
        "badgeClass": "bg-[#ebefff] text-[#2f3d68] dark:bg-[#182033] dark:text-[#c8d2ff]",
        "description": "Residency-ready curriculum design with academic rigor and practical leadership.",
    },
    "Leadership": {
        "mark": "LD",
        "gradient": "from-[#5c2c12] via-[#9f5a24] to-[#e4b76b]",
        "accent": "#9f5a24",
        "badgeClass": "bg-[#fbeee2] text-[#7a4218] dark:bg-[#2a1d14] dark:text-[#f4cfa1]",
        "description": "Executive presence, team influence, and change leadership for health systems.",
    },
    "Advanced Leadership": {
        "mark": "AL",
        "gradient": "from-[#51203d] via-[#8a365f] to-[#e0b172]",
        "accent": "#8a365f",
        "badgeClass": "bg-[#f8e7ef] text-[#6a2648] dark:bg-[#2c1724] dark:text-[#efbfd3]",
        "description": "Strategic leadership frameworks for transformation at enterprise scale.",
    },
    "NPHIES": {
        "mark": "NP",
        "gradient": "from-[#0b4b4d] via-[#1d7b7a] to-[#9ee1db]",
        "accent": "#1d7b7a",
        "badgeClass": "bg-[#def6f3] text-[#0b4b4d] dark:bg-[#102627] dark:text-[#b1e7e2]",
        "description": "Saudi payer and exchange standards translated into cleaner delivery execution.",
    },
    "Person- and Family-Centered Care": {
        "mark": "PF",
        "gradient": "from-[#7b2343] via-[#b43e69] to-[#f0b48a]",
        "accent": "#b43e69",
        "badgeClass": "bg-[#fde8ef] text-[#7b2343] dark:bg-[#311521] dark:text-[#f0bfd0]",
        "description": "Service design that respects dignity, trust, and partnership with every family.",
    },
    "Patient Safety": {
        "mark": "PS",
        "gradient": "from-[#0d5048] via-[#19806c] to-[#d7b05f]",
        "accent": "#19806c",
        "badgeClass": "bg-[#e1f4ef] text-[#0d5048] dark:bg-[#10241f] dark:text-[#bce7da]",
        "description": "High-reliability systems, safer decisions, and stronger risk awareness at the bedside.",
    },
    "Quality Improvement": {
        "mark": "QI",
        "gradient": "from-[#18335d] via-[#315d9a] to-[#d6af67]",
        "accent": "#315d9a",
        "badgeClass": "bg-[#e7eefb] text-[#18335d] dark:bg-[#151d2d] dark:text-[#bfd0f1]",
        "description": "Measurement-led improvement with disciplined testing, governance, and spread.",
    },
    "Triple Aim": {
        "mark": "TA",
        "gradient": "from-[#45215b] via-[#7042a0] to-[#d6ab6d]",
        "accent": "#7042a0",
        "badgeClass": "bg-[#efe7fa] text-[#45215b] dark:bg-[#20152c] dark:text-[#d7c0f1]",
        "description": "Balanced excellence across patient experience, outcomes, and cost discipline.",
    },
}


def fallback_mark(name: str) -> str:
    letters = [part[0] for part in name.split() if part and part[0].isalnum()]
    return "".join(letters[:2]).upper() or "AC"


def build_branding() -> list[dict[str, str]]:
    topics = json.loads(TOPICS_PATH.read_text(encoding="utf-8"))
    output: list[dict[str, str]] = []
    for topic in topics:
        preset = PRESETS.get(topic["name"], {})
        output.append(
            {
                "name": topic["name"],
                "slug": topic["slug"],
                "mark": preset.get("mark", fallback_mark(topic["name"])),
                "gradient": preset.get("gradient", next(FALLBACK_GRADIENTS)),
                "accent": preset.get("accent", "#0f5b5c"),
                "badgeClass": preset.get(
                    "badgeClass",
                    "bg-[#e3f2ef] text-[#0f5b5c] dark:bg-[#13262a] dark:text-[#c2e8e0]",
                ),
                "description": preset.get(
                    "description",
                    f"Curated premium learning for {topic['name'].lower()} teams.",
                ),
            }
        )
    return output


def main() -> None:
    branding = build_branding()
    OUTPUT_PATH.write_text(
        json.dumps(branding, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(branding)} topic branding records to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()