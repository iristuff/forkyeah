// Recipe + culture content. Static, bundled, works offline.
// Adding a dish: give it a unique id, list steps in cooking order, keep stories factual.
import type { Cuisine, Dish } from '../types';

export const CUISINES: Cuisine[] = [
  // ── Japan ───────────────────────────────────────────────────
  {
    id: 'japan',
    name: 'Japan',
    adjective: 'Japanese',
    flag: '🇯🇵',
    stamp: '🗻',
    story:
      'Japanese home cooking is built on dashi, a quick stock of kombu seaweed and bonito flakes that carries umami through soups, simmered dishes and sauces. The everyday meal follows ichiju-sansai: one soup, three sides, and rice.',
    dishes: [
      {
        id: 'miso-soup',
        cuisineId: 'japan',
        name: 'Miso Soup',
        emoji: '🥣',
        story:
          'Miso soup has been part of the Japanese table for centuries and is still eaten daily, often at breakfast. Every region and household has its own miso: pale shiro miso is sweet and mild, darker aka miso is aged longer and saltier.',
        timeMin: 25,
        difficulty: 1,
        serves: 2,
        xp: 150,
        ingredients: [
          '1 piece kombu (about 10 cm)',
          '10 g katsuobushi (bonito flakes)',
          '700 ml water',
          '2–3 tbsp miso paste',
          '150 g silken or soft tofu',
          '1 tbsp dried wakame',
          '2 spring onions',
        ],
        steps: [
          { text: 'Wipe the kombu with a damp cloth (don’t wash off the white powder — it’s flavour). Soak it in the water for at least 10 minutes.', timerSec: 600 },
          { text: 'Heat the pot slowly. Remove the kombu just before the water boils.', tip: 'Boiling kombu makes the stock slimy and bitter.' },
          { text: 'Add the katsuobushi, simmer 1 minute, turn off the heat and let the flakes sink, about 3 minutes. Strain. This is your dashi.', timerSec: 240 },
          { text: 'Soak the wakame in cold water for 5 minutes, then drain. Cut the tofu into 1.5 cm cubes and slice the spring onions.', timerSec: 300 },
          { text: 'Bring the dashi back to a bare simmer and add the tofu and wakame.' },
          { text: 'Turn the heat to low. Dissolve the miso in a ladle of dashi first, then stir it into the pot.', tip: 'Never boil after adding miso — it dulls the aroma.' },
          { text: 'Serve right away, topped with spring onion.' },
        ],
      },
      {
        id: 'oyakodon',
        cuisineId: 'japan',
        name: 'Oyakodon',
        emoji: '🍚',
        story:
          'Oyakodon means "parent-and-child bowl": chicken and egg simmered together over rice. It is credited to Tamahide, a Tokyo restaurant founded in 1760, and became a classic donburi — a fast, filling one-bowl meal.',
        timeMin: 25,
        difficulty: 2,
        serves: 2,
        xp: 250,
        ingredients: [
          '2 bowls cooked short-grain rice',
          '250 g boneless chicken thigh',
          '1/2 onion',
          '3 eggs',
          '120 ml dashi',
          '2 tbsp soy sauce',
          '2 tbsp mirin',
          '1 tsp sugar',
          'Mitsuba or spring onion to garnish',
        ],
        steps: [
          { text: 'Cut the chicken into bite-size pieces and slice the onion thinly.' },
          { text: 'In a small frying pan, bring the dashi, soy sauce, mirin and sugar to a simmer.' },
          { text: 'Add the onion and cook 2 minutes until soft, then add the chicken and simmer 5–6 minutes, turning once, until cooked through.', timerSec: 360 },
          { text: 'Lightly beat the eggs — just 5–6 strokes so the whites and yolks stay streaky.' },
          { text: 'Pour two-thirds of the egg over the chicken, cover and cook 1 minute. Add the rest, cover and cook 30 seconds more.', tip: 'Pull it off the heat while the top is still soft and glossy.', timerSec: 90 },
          { text: 'Slide it over hot rice, spoon over the remaining sauce and garnish.' },
        ],
      },
    ],
  },

  // ── India ───────────────────────────────────────────────────
  {
    id: 'india',
    name: 'India',
    adjective: 'Indian',
    flag: '🇮🇳',
    stamp: '🪷',
    story:
      'India has dozens of regional cuisines, but many share one technique: tadka (tempering) — blooming whole spices in hot fat so their flavour carries through the whole dish. Spice blends are often ground fresh at home.',
    dishes: [
      {
        id: 'chana-masala',
        cuisineId: 'india',
        name: 'Chana Masala',
        emoji: '🫘',
        story:
          'Chana masala is a chickpea curry from North India, especially Punjab, where it is famously eaten with fried bread as chole bhature. Dried mango powder (amchur) gives its signature tang.',
        timeMin: 40,
        difficulty: 1,
        serves: 3,
        xp: 200,
        ingredients: [
          '2 cans (800 g) chickpeas, drained',
          '1 large onion, finely chopped',
          '2 tomatoes, puréed',
          '1 tbsp ginger-garlic paste',
          '1 green chilli, slit',
          '2 tbsp oil or ghee',
          '1 tsp cumin seeds',
          '1 tsp ground coriander, 1/2 tsp turmeric, 1 tsp Kashmiri chilli powder',
          '1 1/2 tsp garam masala (or chana masala)',
          '1 tsp amchur or juice of 1/2 lemon',
          'Salt, fresh coriander',
        ],
        steps: [
          { text: 'Heat the oil and add cumin seeds. When they sizzle and darken slightly (about 30 seconds), you’ve made the tadka.' },
          { text: 'Add the onion and cook 8–10 minutes until deep golden.', tip: 'Patience here builds the gravy’s sweetness and colour.', timerSec: 540 },
          { text: 'Stir in the ginger-garlic paste and green chilli for 1 minute until the raw smell is gone.' },
          { text: 'Add turmeric, ground coriander and chilli powder with a splash of water so they don’t burn. Then add the tomato purée and cook until oil shines on the edges, 6–8 minutes.', timerSec: 420 },
          { text: 'Add the chickpeas, 250 ml water and salt. Mash a few chickpeas against the pot to thicken. Simmer 15 minutes.', timerSec: 900 },
          { text: 'Finish with garam masala and amchur, simmer 2 minutes more, and garnish with coriander.' },
        ],
      },
      {
        id: 'chicken-biryani',
        cuisineId: 'india',
        name: 'Chicken Biryani',
        emoji: '🍛',
        story:
          'Biryani grew out of the Mughal royal kitchens, blending Persian rice cooking with Indian spices. Cities like Hyderabad, Lucknow and Kolkata each have their own style; this is a home-style dum biryani, where layered rice and chicken finish cooking in their own steam.',
        timeMin: 90,
        difficulty: 3,
        serves: 4,
        xp: 350,
        ingredients: [
          '500 g chicken thighs, bone-in or boneless, in pieces',
          '300 g aged basmati rice',
          '200 g plain yoghurt',
          '2 onions, thinly sliced',
          '1 tbsp ginger-garlic paste',
          '2 tsp biryani masala or garam masala, 1 tsp chilli powder, 1/2 tsp turmeric',
          'Whole spices: 1 bay leaf, 4 green cardamom, 4 cloves, 1 cinnamon stick',
          'Handful of mint and coriander leaves',
          'Pinch of saffron soaked in 3 tbsp warm milk',
          '3 tbsp ghee or oil, salt',
        ],
        steps: [
          { text: 'Marinate the chicken with yoghurt, ginger-garlic paste, ground spices and salt for at least 30 minutes.', timerSec: 1800 },
          { text: 'Rinse the rice until the water runs clear, then soak it 30 minutes.', tip: 'Soaking lets the grains grow long without breaking.' },
          { text: 'Fry the sliced onions in ghee until deep brown and crisp (birista). Set half aside for topping.', timerSec: 900 },
          { text: 'In the same pot, add the chicken and its marinade and cook 10–12 minutes until almost done and the sauce is thick.', timerSec: 660 },
          { text: 'Boil a large pot of well-salted water with the whole spices. Cook the drained rice for 5–6 minutes until 70% done — it should still have a bite. Drain.', timerSec: 330 },
          { text: 'Layer the rice over the chicken. Top with mint, coriander, the reserved onions and the saffron milk.' },
          { text: 'Seal the pot with a tight lid (or foil under the lid) and cook on the lowest heat for 20 minutes — this is the dum.', timerSec: 1200 },
          { text: 'Rest 5 minutes, then gently fold from the edges so every plate gets rice and chicken.' },
        ],
      },
    ],
  },

  // ── Mexico ──────────────────────────────────────────────────
  {
    id: 'mexico',
    name: 'Mexico',
    adjective: 'Mexican',
    flag: '🇲🇽',
    stamp: '🌵',
    story:
      'Traditional Mexican cuisine is on UNESCO’s list of Intangible Cultural Heritage. Its base is the milpa trio of corn, beans and squash, plus chiles — and nixtamalization, the ancient process that turns corn into masa.',
    dishes: [
      {
        id: 'esquites',
        cuisineId: 'mexico',
        name: 'Esquites',
        emoji: '🌽',
        story:
          'Esquites are a street snack sold from carts across Mexico: charred corn kernels in a cup with lime, mayo, cheese and chile. The name comes from the Nahuatl word izquitl, meaning toasted corn.',
        timeMin: 20,
        difficulty: 1,
        serves: 4,
        xp: 150,
        ingredients: [
          '4 cups corn kernels (from 4–5 cobs or frozen, thawed)',
          '1 tbsp butter or oil',
          '1/2 white onion, finely chopped',
          '1 jalapeño or serrano, finely chopped',
          '3 tbsp mayonnaise',
          '60 g cotija or feta, crumbled',
          '1 lime',
          'Chile powder (Tajín or ancho), coriander, salt',
        ],
        steps: [
          { text: 'Heat a large pan until very hot. Add the corn in one layer and leave it alone for 3–4 minutes to char.', tip: 'Don’t stir too early — the char is the flavour.', timerSec: 210 },
          { text: 'Stir, then char again for 2–3 minutes. Repeat until well spotted with brown.' },
          { text: 'Add the butter, onion and chile and cook 2 minutes. Season with salt.' },
          { text: 'Off the heat, stir in the mayonnaise, most of the cheese and the juice of half the lime.' },
          { text: 'Serve in cups, topped with the rest of the cheese, chile powder, coriander and a lime wedge.' },
        ],
      },
      {
        id: 'chicken-tinga',
        cuisineId: 'mexico',
        name: 'Tinga de Pollo',
        emoji: '🌮',
        story:
          'Tinga comes from Puebla, a city famous for its cooking. Shredded chicken simmers in a smoky tomato and chipotle sauce, then is piled onto crisp tostadas — a dish for family gatherings and fiestas.',
        timeMin: 45,
        difficulty: 2,
        serves: 4,
        xp: 250,
        ingredients: [
          '500 g chicken breast or thigh',
          '1/2 onion + 1 garlic clove (for poaching)',
          '1 large onion, thinly sliced',
          '2 garlic cloves',
          '3 tomatoes (or 400 g canned)',
          '2–3 chipotles in adobo + 1 tbsp of the sauce',
          '1/2 tsp dried oregano, 1 bay leaf',
          '2 tbsp oil, salt',
          'Tostadas, refried beans, crema, avocado, lettuce to serve',
        ],
        steps: [
          { text: 'Poach the chicken with the half onion, garlic and salt in water to cover for 20 minutes. Keep 250 ml of the broth.', timerSec: 1200 },
          { text: 'Shred the chicken with two forks.' },
          { text: 'Blend the tomatoes, garlic, chipotles, adobo sauce and 125 ml of the broth until smooth.' },
          { text: 'Fry the sliced onion in oil for 5–6 minutes until soft and lightly golden.', timerSec: 330 },
          { text: 'Pour in the sauce with the oregano and bay leaf and cook 5 minutes until it darkens slightly.', timerSec: 300 },
          { text: 'Add the chicken and simmer 5–10 minutes, adding broth if it gets dry. Taste for salt and heat.' },
          { text: 'Build tostadas: beans, tinga, lettuce, crema, avocado.' },
        ],
      },
    ],
  },

  // ── Morocco ─────────────────────────────────────────────────
  {
    id: 'morocco',
    name: 'Morocco',
    adjective: 'Moroccan',
    flag: '🇲🇦',
    stamp: '🕌',
    story:
      'Moroccan cooking blends Amazigh (Berber), Arab, Andalusian and Mediterranean influences. Signature flavours include preserved lemons, olives, saffron, cumin and ras el hanout, literally "head of the shop" — a spice merchant’s best blend.',
    dishes: [
      {
        id: 'zaalouk',
        cuisineId: 'morocco',
        name: 'Zaalouk',
        emoji: '🍆',
        story:
          'Zaalouk is a cooked aubergine and tomato salad served warm or cold as part of a spread of small salads, scooped up with khobz bread. Every family seasons it a little differently.',
        timeMin: 40,
        difficulty: 1,
        serves: 4,
        xp: 150,
        ingredients: [
          '2 aubergines (eggplants)',
          '3 ripe tomatoes, grated or chopped',
          '3 garlic cloves, minced',
          '3 tbsp olive oil',
          '1 tsp ground cumin, 1 tsp sweet paprika',
          'Handful of parsley and coriander, chopped',
          '1/2 lemon, salt',
        ],
        steps: [
          { text: 'Peel the aubergines in stripes and cut into 2 cm cubes.' },
          { text: 'Steam or boil them for 10–15 minutes until very soft, then drain well.', timerSec: 720 },
          { text: 'Warm the olive oil with the garlic for 1 minute, then add tomatoes, cumin, paprika and salt. Cook 5 minutes.', timerSec: 300 },
          { text: 'Add the aubergine and mash it into the sauce. Cook 15 minutes, stirring, until thick and jammy.', timerSec: 900 },
          { text: 'Stir in the herbs and lemon juice. Finish with a drizzle of olive oil and serve with bread.' },
        ],
      },
      {
        id: 'chicken-tagine',
        cuisineId: 'morocco',
        name: 'Chicken Tagine with Preserved Lemon & Olives',
        emoji: '🥘',
        story:
          'A tagine is both the cone-lidded clay pot and the slow-cooked stew made in it. The lid returns steam to the food, keeping it tender. Chicken with preserved lemon and olives is one of Morocco’s best-loved classics.',
        timeMin: 75,
        difficulty: 2,
        serves: 4,
        xp: 300,
        ingredients: [
          '1 kg chicken thighs and drumsticks',
          '2 onions, grated or finely chopped',
          '3 garlic cloves, minced',
          '1 preserved lemon, peel only, in strips',
          'Handful of green or violet olives',
          '1 tsp ground ginger, 1 tsp turmeric, 1/2 tsp black pepper',
          'Pinch of saffron',
          'Bunch of coriander and parsley, tied',
          '3 tbsp olive oil, salt',
        ],
        steps: [
          { text: 'Rub the chicken with the garlic, ginger, turmeric, pepper, crumbled saffron, oil and a little salt. Rest 30 minutes if you can.', tip: 'Go easy on salt — the preserved lemon and olives add plenty.', timerSec: 1800 },
          { text: 'Put the onions in the tagine or a heavy pot, arrange the chicken on top and add the herb bundle and 250 ml water.' },
          { text: 'Cover and cook on low heat for 45 minutes, turning the chicken once. Use a diffuser if using a clay tagine.', timerSec: 2700 },
          { text: 'Add the preserved lemon and olives and cook uncovered 10–15 minutes to reduce the sauce.', timerSec: 720 },
          { text: 'Remove the herb bundle. The sauce should coat the chicken. Serve with bread or couscous.' },
        ],
      },
    ],
  },

  // ── Thailand ────────────────────────────────────────────────
  {
    id: 'thailand',
    name: 'Thailand',
    adjective: 'Thai',
    flag: '🇹🇭',
    stamp: '🐘',
    story:
      'Thai cooking is about balance: salty, sour, sweet, spicy and often bitter in the same dish. Fresh aromatics — lemongrass, galangal, makrut lime leaf, Thai basil — are pounded into pastes in a stone mortar.',
    dishes: [
      {
        id: 'pad-kra-pao',
        cuisineId: 'thailand',
        name: 'Pad Kra Pao',
        emoji: '🌿',
        story:
          'Pad kra pao — stir-fried meat with holy basil — is one of Thailand’s most popular quick lunches, cooked to order at street stalls and served over rice with a crispy fried egg (khai dao).',
        timeMin: 20,
        difficulty: 1,
        serves: 2,
        xp: 200,
        ingredients: [
          '300 g minced chicken or pork',
          '4 garlic cloves + 3–6 Thai chillies, pounded together',
          '1 tbsp oyster sauce',
          '1 tsp soy sauce + 1 tsp dark soy sauce',
          '1 tsp fish sauce, 1 tsp sugar',
          '2 big handfuls of holy basil (or Thai basil)',
          '2 eggs, oil, jasmine rice to serve',
        ],
        steps: [
          { text: 'Mix the oyster sauce, both soy sauces, fish sauce, sugar and 2 tbsp water in a small bowl.' },
          { text: 'Fry the eggs in plenty of very hot oil, spooning oil over the top until the edges are crisp and lacy. Set aside.', tip: 'The yolk should stay runny.' },
          { text: 'Pour off most of the oil. Stir-fry the garlic-chilli paste over high heat for 15 seconds.' },
          { text: 'Add the mince and break it up. Stir-fry until cooked and starting to brown, 3–4 minutes.', timerSec: 210 },
          { text: 'Add the sauce and toss until glossy. Turn off the heat and fold in the basil until just wilted.' },
          { text: 'Serve over rice with the fried egg on top.' },
        ],
      },
      {
        id: 'green-curry',
        cuisineId: 'thailand',
        name: 'Green Curry',
        emoji: '🍜',
        story:
          'Kaeng khiao wan, "sweet green curry", gets its colour from fresh green chillies. The technique that defines it is "cracking" the coconut cream — frying the paste in coconut fat until it is fragrant.',
        timeMin: 35,
        difficulty: 2,
        serves: 3,
        xp: 300,
        ingredients: [
          '3–4 tbsp green curry paste',
          '400 ml coconut milk (don’t shake the can)',
          '400 g chicken thigh, sliced',
          '150 g Thai aubergine or regular aubergine, in chunks',
          '4 makrut lime leaves, torn',
          '1–2 tbsp fish sauce, 1–2 tsp palm or brown sugar',
          'Handful of Thai basil, 1 red chilli, sliced',
          'Jasmine rice to serve',
        ],
        steps: [
          { text: 'Spoon the thick cream from the top of the coconut milk can into a wok. Simmer it, stirring, until the oil separates, 3–5 minutes.', tip: 'This "cracked" cream fries the paste and makes the curry fragrant.', timerSec: 240 },
          { text: 'Add the curry paste and fry 2 minutes until very aromatic.' },
          { text: 'Add the chicken and stir to coat it in the paste for 2 minutes.' },
          { text: 'Pour in the rest of the coconut milk and 100 ml water. Add the aubergine and lime leaves and simmer 10 minutes.', timerSec: 600 },
          { text: 'Season with fish sauce and sugar. Taste: it should be spicy, salty, then slightly sweet.' },
          { text: 'Turn off the heat, stir in the basil and chilli and serve with rice.' },
        ],
      },
    ],
  },
];

// ── Lookups ───────────────────────────────────────────────────
const DISH_INDEX = new Map<string, Dish>(CUISINES.flatMap(c => c.dishes.map(d => [d.id, d] as const)));
const CUISINE_INDEX = new Map(CUISINES.map(c => [c.id, c] as const));

export const ALL_DISHES: Dish[] = [...DISH_INDEX.values()];

export function getDish(id: string): Dish | undefined {
  return DISH_INDEX.get(id);
}

export function getCuisine(id: string): Cuisine | undefined {
  return CUISINE_INDEX.get(id);
}
