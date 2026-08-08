// Character registry. Assets are external files now.
const HEROES = {
  "wira": {
    "id": "wira",
    "name": "Wira",
    "subtitle": "Kuasa ais",
    "idle": "assets/heroes/wira/idle.webp",
    "attack": "assets/heroes/wira/attack.webp",
    "finisher": "assets/fx/wira/finisher.webp",
    "theme": "ice"
  },
  "bunga": {
    "id": "bunga",
    "name": "Bunga",
    "subtitle": "Kuasa bunga",
    "idle": "assets/heroes/bunga/idle.webp",
    "attack": "assets/heroes/bunga/attack.webp",
    "finisher": "assets/fx/bunga/finisher.webp",
    "theme": "bloom"
  }
};
const savedProfile=JSON.parse(localStorage.getItem("pa_coach_v5")||"null");
let selectedHero=(savedProfile&&savedProfile.hero)||"wira";
