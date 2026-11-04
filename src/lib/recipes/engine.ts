import type { ApiRecipeResponse, RecipeIngredientItem, RecipeStep } from "@/types/recipe";

export interface RecipeTemplate {
  keywords: string[];
  matchAll?: boolean; // if true, all keywords must be present in the user items
  recipe_name: string;
  description: string;
  prep_time: string;
  cook_time: string;
  difficulty: "Easy" | "Medium";
  ingredients: RecipeIngredientItem[];
  instructions: RecipeStep[];
  waste_saved_summary: string;
}

export const WORLD_EASIEST_RECIPES: RecipeTemplate[] = [
  // ─── MILK COMBINATIONS (2 & 3 INGREDIENTS) ─────────────────────────
  {
    keywords: ["milk", "banana"],
    matchAll: true,
    recipe_name: "2-Ingredient Creamy Banana Milk Smoothie",
    description: "A silky, naturally sweet 2-ingredient world classic smoothie popular across India, USA, and Europe. No added sugar needed!",
    prep_time: "2 mins",
    cook_time: "0 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Rescued Fresh Milk", is_deal: true, quantity: "250 ml (1 cup)" },
      { name: "Ripe Banana", is_deal: true, quantity: "1 large or 2 small" },
      { name: "Pinch of Cardamom or Cinnamon (Optional)", is_deal: false, quantity: "1 pinch" },
    ],
    instructions: [
      { step_number: 1, instruction: "Peel the ripe banana and slice it into rough chunks into a blender." },
      { step_number: 2, instruction: "Pour in 250 ml of cold milk (or room temperature)." },
      { step_number: 3, instruction: "Blend on high speed for 30–45 seconds until thick, frothy, and creamy." },
      { step_number: 4, instruction: "Pour into a tall glass and enjoy immediate natural energy with zero food waste!" },
    ],
    waste_saved_summary: "Rescued 250ml milk and 1 ripe banana, preventing 0.8 kg CO₂e greenhouse emissions!",
  },
  {
    keywords: ["milk", "bread"],
    matchAll: true,
    recipe_name: "3-Ingredient Royal Shahi Tukda (Golden Milk Toast)",
    description: "A famous Mughal dessert and universal favorite comfort dish. Turns near-expiry milk and bread slices into a warm, rich delicacy.",
    prep_time: "3 mins",
    cook_time: "7 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Surplus Milk", is_deal: true, quantity: "300 ml" },
      { name: "Bread Slices", is_deal: true, quantity: "3–4 slices" },
      { name: "Sugar or Honey", is_deal: false, quantity: "2 tablespoons" },
    ],
    instructions: [
      { step_number: 1, instruction: "Simmer the milk in a wide pan with 2 tablespoons of sugar/honey for 5 minutes until reduced and slightly thickened." },
      { step_number: 2, instruction: "Lightly toast the bread slices with a touch of butter or ghee in a pan until golden and crispy." },
      { step_number: 3, instruction: "Pour the warm sweetened rabdi milk over the hot toasted bread slices." },
      { step_number: 4, instruction: "Let the bread soak for 60 seconds and serve warm. Crispy on edges, meltingly soft in the center!" },
    ],
    waste_saved_summary: "Rescued 4 bread slices and 300ml milk from kitchen waste!",
  },
  {
    keywords: ["milk", "egg", "bread"],
    matchAll: true,
    recipe_name: "3-Ingredient Classic French Toast (Pain Perdu)",
    description: "The world's original zero-waste breakfast invented in France to rescue day-old bread and surplus milk with eggs.",
    prep_time: "3 mins",
    cook_time: "5 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Bread Slices", is_deal: true, quantity: "4 slices" },
      { name: "Fresh Milk", is_deal: true, quantity: "100 ml" },
      { name: "Egg", is_deal: true, quantity: "2 whole eggs" },
    ],
    instructions: [
      { step_number: 1, instruction: "Whisk the 2 eggs and 100 ml milk together in a shallow bowl until smooth." },
      { step_number: 2, instruction: "Dip each bread slice into the mixture for 10 seconds per side so it absorbs the custard." },
      { step_number: 3, instruction: "Melt 1 tsp butter or oil in a skillet over medium heat. Fry slices for 2–3 minutes per side until golden brown." },
      { step_number: 4, instruction: "Serve hot dusted with a pinch of sugar, cinnamon, or honey." },
    ],
    waste_saved_summary: "Saved surplus bread, eggs, and dairy, preventing 1.2 kg CO₂e!",
  },
  {
    keywords: ["milk"],
    recipe_name: "2-Ingredient Homemade Fresh Paneer / Cottage Cheese",
    description: "The ultimate 2-ingredient zero-waste kitchen rescue! Turn approaching-expiry milk into fresh, protein-rich artisanal Paneer in 15 minutes.",
    prep_time: "5 mins",
    cook_time: "10 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Surplus Fresh Milk", is_deal: true, quantity: "500 ml – 1 Litre" },
      { name: "Lemon Juice or Vinegar", is_deal: false, quantity: "2 tablespoons" },
      { name: "Pinch of Salt", is_deal: false, quantity: "1/4 teaspoon" },
    ],
    instructions: [
      { step_number: 1, instruction: "Bring the milk to a rolling boil in a heavy-bottomed pot over medium heat." },
      { step_number: 2, instruction: "Turn off heat, slowly add 2 tbsp lemon juice or vinegar, and stir gently. Curds will immediately separate from green whey." },
      { step_number: 3, instruction: "Strain through a clean kitchen cloth or fine colander. Rinse lightly with cold water to remove acidity." },
      { step_number: 4, instruction: "Squeeze gently and press under a small weight for 10 minutes. Cut into fresh paneer cubes ready for curries or salads!" },
    ],
    waste_saved_summary: "Upcycled 1 Litre of milk into 150g of fresh protein paneer!",
  },
  {
    keywords: ["milk", "chocolate"],
    matchAll: true,
    recipe_name: "2-Ingredient Parisian Velvety Hot Chocolate",
    description: "Rich French café-style hot chocolate made simply by melting real chocolate into hot milk.",
    prep_time: "2 mins",
    cook_time: "4 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Fresh Milk", is_deal: true, quantity: "300 ml" },
      { name: "Chocolate (Bar or Chips)", is_deal: true, quantity: "60g" },
      { name: "Vanilla or Cinnamon (Optional)", is_deal: false, quantity: "1 drop" },
    ],
    instructions: [
      { step_number: 1, instruction: "Warm 300 ml of milk in a small saucepan over medium-low heat until steaming (do not boil)." },
      { step_number: 2, instruction: "Break the chocolate into small pieces and whisk directly into the hot milk." },
      { step_number: 3, instruction: "Whisk continuously for 2 minutes until glossy, thick, and fully melted." },
      { step_number: 4, instruction: "Pour into your favorite mug and sip cozy café perfection!" },
    ],
    waste_saved_summary: "Zero milk wasted; high antioxidants and pure comfort!",
  },
  {
    keywords: ["milk", "oat"],
    matchAll: true,
    recipe_name: "2-Ingredient Creamy Swiss Overnight Oats",
    description: "Zero-cook breakfast inspired by Swiss Bircher Muesli. Soak oats in fresh milk overnight for an ultra-creamy, energizing morning meal.",
    prep_time: "2 mins",
    cook_time: "0 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Rolled Oats", is_deal: true, quantity: "1/2 cup (50g)" },
      { name: "Fresh Milk", is_deal: true, quantity: "150 ml" },
      { name: "Honey or Maple Syrup (Optional)", is_deal: false, quantity: "1 teaspoon" },
    ],
    instructions: [
      { step_number: 1, instruction: "Add oats and milk into a small jar or bowl." },
      { step_number: 2, instruction: "Stir thoroughly to ensure all oats are submerged." },
      { step_number: 3, instruction: "Cover and refrigerate for 2 hours (or overnight)." },
      { step_number: 4, instruction: "Enjoy cold or microwave for 60 seconds for warm oatmeal porridge!" },
    ],
    waste_saved_summary: "Zero-effort breakfast rescuing dairy shelf life!",
  },
  {
    keywords: ["milk", "tea"],
    matchAll: true,
    recipe_name: "3-Ingredient Royal Cardamom Masala Chai",
    description: "The world's most beloved spiced milk tea. Uses simple pantry tea leaves and fresh milk brewed into fragrant comfort.",
    prep_time: "2 mins",
    cook_time: "6 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Fresh Milk", is_deal: true, quantity: "200 ml" },
      { name: "Black Tea Leaves / Powder", is_deal: false, quantity: "2 teaspoons" },
      { name: "Sugar & Crushed Cardamom", is_deal: false, quantity: "To taste" },
    ],
    instructions: [
      { step_number: 1, instruction: "Boil 100 ml water with 2 tsp tea leaves and 2 crushed cardamom pods for 2 minutes." },
      { step_number: 2, instruction: "Pour in 200 ml of fresh milk and bring to a rolling boil over medium heat." },
      { step_number: 3, instruction: "Simmer for 3 minutes until rich karak golden-brown, then stir in sugar." },
      { step_number: 4, instruction: "Strain through a tea sieve into a glass and serve steaming hot!" },
    ],
    waste_saved_summary: "Saved 200ml milk from going stale, crafting authentic Indian Chai!",
  },

  // ─── BREAD COMBINATIONS (2 & 3 INGREDIENTS) ─────────────────────────
  {
    keywords: ["bread", "garlic"],
    matchAll: true,
    recipe_name: "2-Ingredient Crispy Café Garlic Bread",
    description: "Golden, fragrant, crunchy garlic toast made with simple pantry butter/oil and bread slices in 5 minutes.",
    prep_time: "2 mins",
    cook_time: "4 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Bread Slices", is_deal: true, quantity: "4 slices" },
      { name: "Butter mixed with crushed Garlic", is_deal: false, quantity: "2 tablespoons" },
      { name: "Dried Oregano or Chili Flakes", is_deal: false, quantity: "1 pinch" },
    ],
    instructions: [
      { step_number: 1, instruction: "Spread garlic butter generously on one side of each bread slice." },
      { step_number: 2, instruction: "Place buttered side down on a hot skillet over medium heat for 2 minutes." },
      { step_number: 3, instruction: "Flip and toast the other side for 60 seconds until crisp and golden." },
      { step_number: 4, instruction: "Cut into triangles and serve hot with soup or as a snack!" },
    ],
    waste_saved_summary: "Saved 4 near-expiry bread slices from trash, creating crispy appetizers!",
  },
  {
    keywords: ["bread", "cheese"],
    matchAll: true,
    recipe_name: "2-Ingredient Ultimate Grilled Cheese Toastie",
    description: "The universally adored American comfort sandwich. Melty, gooey cheese inside golden buttery toasted bread.",
    prep_time: "2 mins",
    cook_time: "4 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Bread Slices", is_deal: true, quantity: "2 slices" },
      { name: "Cheese Slices or Grated Cheese", is_deal: true, quantity: "2 slices / 50g" },
      { name: "Butter for pan", is_deal: false, quantity: "1 teaspoon" },
    ],
    instructions: [
      { step_number: 1, instruction: "Place cheese between the two slices of bread to assemble sandwich." },
      { step_number: 2, instruction: "Melt 1 tsp butter in a skillet over low-medium heat." },
      { step_number: 3, instruction: "Cook sandwich for 2–3 minutes on each side until bread is golden and cheese is gooey and melted." },
      { step_number: 4, instruction: "Slice diagonally and enjoy the classic cheesy pull!" },
    ],
    waste_saved_summary: "Zero waste comfort sandwich saving surplus bread and cheese!",
  },
  {
    keywords: ["bread"],
    recipe_name: "3-Ingredient Spicy Bread Upma",
    description: "Fast, flavorful South Indian breakfast that turns dry or day-old bread into a savory, mustard-tempered delight.",
    prep_time: "3 mins",
    cook_time: "6 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Bread Slices", is_deal: true, quantity: "4 slices (cubed)" },
      { name: "Onion & Green Chili", is_deal: false, quantity: "1 small, chopped" },
      { name: "Mustard Seeds & Turmeric", is_deal: false, quantity: "1/2 tsp each" },
    ],
    instructions: [
      { step_number: 1, instruction: "Cut bread slices into bite-sized 1-inch cubes." },
      { step_number: 2, instruction: "Heat 1 tbsp oil in a pan, splutter mustard seeds, then sauté onions and chilies until soft." },
      { step_number: 3, instruction: "Add turmeric, a splash of water, then toss in bread cubes over medium heat for 3 minutes." },
      { step_number: 4, instruction: "Garnish with fresh coriander or lemon squeeze and serve hot!" },
    ],
    waste_saved_summary: "Upcycled 4 bread slices into a satisfying 10-minute meal!",
  },

  // ─── BANANA COMBINATIONS (2 & 3 INGREDIENTS) ────────────────────────
  {
    keywords: ["banana", "egg"],
    matchAll: true,
    recipe_name: "2-Ingredient Grain-Free Banana Pancakes",
    description: "Magic 2-ingredient flourless pancakes popular in healthy kitchens worldwide. Super tender, naturally sweet, and gluten-free!",
    prep_time: "3 mins",
    cook_time: "5 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Ripe Banana", is_deal: true, quantity: "1 large" },
      { name: "Eggs", is_deal: true, quantity: "2 whole" },
      { name: "Pinch of Cinnamon (Optional)", is_deal: false, quantity: "1 pinch" },
    ],
    instructions: [
      { step_number: 1, instruction: "Mash the ripe banana thoroughly in a bowl using a fork until completely smooth." },
      { step_number: 2, instruction: "Crack in the 2 eggs and whisk vigorously until well blended into a pancake batter." },
      { step_number: 3, instruction: "Heat a greased non-stick pan over medium-low heat. Pour 2 tbsp batter per pancake." },
      { step_number: 4, instruction: "Cook for 2 minutes until bubbles set, flip gently for 1 minute, and serve warm!" },
    ],
    waste_saved_summary: "Rescued 1 brown banana and 2 eggs into high-protein pancakes!",
  },
  {
    keywords: ["banana", "oat"],
    matchAll: true,
    recipe_name: "2-Ingredient Healthy Banana Oat Cookies",
    description: "No flour, no sugar, no butter! Just ripe mashed bananas and rolled oats baked into chewy, wholesome breakfast cookies.",
    prep_time: "4 mins",
    cook_time: "12 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Ripe Bananas", is_deal: true, quantity: "2 medium" },
      { name: "Rolled Oats", is_deal: true, quantity: "1 cup (90g)" },
      { name: "Chocolate chips or Raisins (Optional)", is_deal: false, quantity: "2 tablespoons" },
    ],
    instructions: [
      { step_number: 1, instruction: "Preheat oven or air-fryer to 180°C (350°F)." },
      { step_number: 2, instruction: "Mash bananas in a bowl, then stir in oats until a cookie dough forms." },
      { step_number: 3, instruction: "Scoop 6 spoonfuls onto a lined baking tray and flatten slightly." },
      { step_number: 4, instruction: "Bake for 12–15 minutes until golden brown and firm. Wholesome chewy goodness!" },
    ],
    waste_saved_summary: "Rescued 2 spotty bananas from disposal into nutritious cookies!",
  },
  {
    keywords: ["banana"],
    recipe_name: "1-Ingredient Creamy Banana Soft-Serve (Nice-Cream)",
    description: "The world's easiest ice cream hack! Frozen ripe bananas blended into a luscious, 100% dairy-free soft serve ice cream.",
    prep_time: "2 mins",
    cook_time: "0 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Ripe Bananas (Frozen)", is_deal: true, quantity: "2 bananas" },
      { name: "Milk or Peanut Butter (Optional)", is_deal: false, quantity: "1 tablespoon" },
    ],
    instructions: [
      { step_number: 1, instruction: "Slice ripe bananas and freeze for at least 2 hours in a container." },
      { step_number: 2, instruction: "Add frozen banana slices to a food processor or blender." },
      { step_number: 3, instruction: "Pulse until crumbly, then blend continuously for 60 seconds as it transforms into velvety soft-serve ice cream!" },
      { step_number: 4, instruction: "Scoop into bowls and eat immediately with your favorite toppings!" },
    ],
    waste_saved_summary: "Converted overripe bananas into guilt-free ice cream!",
  },

  // ─── EGG COMBINATIONS (2 & 3 INGREDIENTS) ───────────────────────────
  {
    keywords: ["egg", "tomato"],
    matchAll: true,
    recipe_name: "2-Ingredient Chinese Tomato Scrambled Eggs (Fan Qie Chao Dan)",
    description: "China's most famous home-cooked comfort dish! Juicy sweet tomatoes cooked into soft, fluffy scrambled eggs.",
    prep_time: "3 mins",
    cook_time: "5 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Eggs", is_deal: true, quantity: "3 eggs" },
      { name: "Tomatoes", is_deal: true, quantity: "2 ripe, cut into wedges" },
      { name: "Oil, Salt & Sugar", is_deal: false, quantity: "Pinch of each" },
    ],
    instructions: [
      { step_number: 1, instruction: "Beat the eggs with a pinch of salt. Soft scramble in a hot oiled pan for 1 minute, then transfer to a plate." },
      { step_number: 2, instruction: "In the same pan, stir-fry tomato wedges for 2 minutes with a pinch of sugar until juicy." },
      { step_number: 3, instruction: "Return the scrambled eggs to the pan, toss together for 30 seconds to soak up tomato juices." },
      { step_number: 4, instruction: "Serve over warm rice or crusty bread. Pure culinary balance!" },
    ],
    waste_saved_summary: "Saved 2 ripe tomatoes and eggs into a staple international dish!",
  },
  {
    keywords: ["egg", "cheese"],
    matchAll: true,
    recipe_name: "2-Ingredient French Fluffy Cheese Omelette",
    description: "The timeless French bistro classic. Velvety, buttery eggs folded around gooey melted cheese.",
    prep_time: "2 mins",
    cook_time: "3 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Fresh Eggs", is_deal: true, quantity: "2–3 eggs" },
      { name: "Grated Cheese", is_deal: true, quantity: "40g" },
      { name: "Butter / Oil", is_deal: false, quantity: "1 teaspoon" },
    ],
    instructions: [
      { step_number: 1, instruction: "Beat eggs with salt and pepper until smooth and uniform." },
      { step_number: 2, instruction: "Melt butter in a non-stick skillet over medium-low heat. Pour in eggs and stir gently with a spatula." },
      { step_number: 3, instruction: "When the base sets but the surface remains glossy, sprinkle cheese across the center." },
      { step_number: 4, instruction: "Fold the omelette in half and slide onto a warm plate. Silky and luxurious!" },
    ],
    waste_saved_summary: "High-protein gourmet meal in under 5 minutes!",
  },
  {
    keywords: ["egg"],
    recipe_name: "2-Ingredient Classic Egg in a Hole (Bird's Nest)",
    description: "A fun, crispy toast with a golden egg cooked right in the center hole. Loved in British and American breakfast culture.",
    prep_time: "1 min",
    cook_time: "4 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Fresh Egg", is_deal: true, quantity: "1 whole" },
      { name: "Bread Slice", is_deal: true, quantity: "1 thick slice" },
      { name: "Butter for skillet", is_deal: false, quantity: "1 teaspoon" },
    ],
    instructions: [
      { step_number: 1, instruction: "Cut or press a round 2-inch hole in the center of the bread slice using a small glass rim." },
      { step_number: 2, instruction: "Melt butter in skillet, place bread slice in pan, and toast for 1 minute." },
      { step_number: 3, instruction: "Crack the egg directly into the center hole. Cook for 2 minutes until white is set." },
      { step_number: 4, instruction: "Flip carefully for 45 seconds for a warm, runny yolk. Season with black pepper!" },
    ],
    waste_saved_summary: "Saved near-expiry bread and fresh egg in a single skillet!",
  },

  // ─── POTATO COMBINATIONS (2 & 3 INGREDIENTS) ────────────────────────
  {
    keywords: ["potato", "milk"],
    matchAll: true,
    recipe_name: "3-Ingredient Classic Velvety Mashed Potatoes",
    description: "The gold standard side dish of French and British tables. Fluffy boiled potatoes mashed with warm milk and butter.",
    prep_time: "5 mins",
    cook_time: "15 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Potatoes", is_deal: true, quantity: "3 medium" },
      { name: "Warm Milk", is_deal: true, quantity: "100 ml" },
      { name: "Butter or Salt", is_deal: false, quantity: "1 tbsp butter, salt to taste" },
    ],
    instructions: [
      { step_number: 1, instruction: "Peel and boil potatoes in salted water for 12–15 minutes until fork-tender." },
      { step_number: 2, instruction: "Drain well and return to warm pot. Mash with a potato masher or fork." },
      { step_number: 3, instruction: "Pour in warm milk and butter, stirring vigorously until cloud-like and velvety." },
      { step_number: 4, instruction: "Season with fresh black pepper and serve warm!" },
    ],
    waste_saved_summary: "Rescued 3 potatoes and fresh milk into gourmet comfort food!",
  },
  {
    keywords: ["potato"],
    recipe_name: "2-Ingredient Crispy Restaurant Hash Browns",
    description: "Crispy shredded potato cakes pan-fried until deeply golden brown and crunchy. Better than fast food!",
    prep_time: "4 mins",
    cook_time: "8 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Potatoes", is_deal: true, quantity: "2 medium" },
      { name: "Cooking Oil & Salt", is_deal: false, quantity: "2 tbsp oil, 1/2 tsp salt" },
    ],
    instructions: [
      { step_number: 1, instruction: "Grate raw potatoes using a coarse cheese grater." },
      { step_number: 2, instruction: "Squeeze the shredded potatoes tightly in a clean towel to remove all excess moisture." },
      { step_number: 3, instruction: "Heat oil in a skillet, press shredded potatoes into thin round patties, and fry for 4 minutes per side." },
      { step_number: 4, instruction: "Sprinkle with salt and serve steaming hot and crunchy!" },
    ],
    waste_saved_summary: "Zero food waste; ultra-crispy potato patties in minutes!",
  },

  // ─── TOMATO COMBINATIONS (2 & 3 INGREDIENTS) ────────────────────────
  {
    keywords: ["tomato", "bread"],
    matchAll: true,
    recipe_name: "3-Ingredient Catalan Pan con Tomate (Spanish Tomato Bread)",
    description: "Spain's national tapas pride. Crusty toasted bread rubbed with raw garlic and slathered with grated fresh ripe tomatoes and olive oil.",
    prep_time: "3 mins",
    cook_time: "2 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Bread Slices / Baguette", is_deal: true, quantity: "2–4 slices" },
      { name: "Ripe Juicy Tomato", is_deal: true, quantity: "1 large" },
      { name: "Garlic Clove & Olive Oil", is_deal: false, quantity: "1 clove, 1 tbsp oil" },
    ],
    instructions: [
      { step_number: 1, instruction: "Toast the bread slices until golden, crusty, and firm." },
      { step_number: 2, instruction: "Cut a garlic clove in half and rub it gently over the rough toasted bread surface." },
      { step_number: 3, instruction: "Cut the tomato in half and grate or rub the juicy pulp directly into the bread until soaked." },
      { step_number: 4, instruction: "Drizzle with olive oil and flaky salt. Fresh Mediterranean sunshine in every bite!" },
    ],
    waste_saved_summary: "Rescued 1 ripe tomato and crusty bread, preventing landfill waste!",
  },
  {
    keywords: ["tomato"],
    recipe_name: "3-Ingredient Tuscan Quick Tomato Pasta Sauce",
    description: "Simmered fresh tomatoes with garlic and olive oil into a luscious, sweet Italian pasta sauce.",
    prep_time: "3 mins",
    cook_time: "10 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Fresh Tomatoes", is_deal: true, quantity: "4 ripe, chopped" },
      { name: "Garlic Cloves", is_deal: false, quantity: "2 cloves, sliced" },
      { name: "Olive Oil & Salt", is_deal: false, quantity: "1 tbsp oil, salt to taste" },
    ],
    instructions: [
      { step_number: 1, instruction: "Sauté sliced garlic in olive oil in a pan for 1 minute until fragrant." },
      { step_number: 2, instruction: "Add chopped tomatoes and 1/2 tsp salt. Simmer over medium heat for 8 minutes." },
      { step_number: 3, instruction: "Crush tomatoes with your wooden spoon as they break down into a rich sauce." },
      { step_number: 4, instruction: "Toss with boiled pasta or dip crusty bread right into the pan!" },
    ],
    waste_saved_summary: "Rescued 4 surplus tomatoes into authentic Italian pasta sauce!",
  },

  // ─── PANEER / CHEESE COMBINATIONS (2 & 3 INGREDIENTS) ───────────────
  {
    keywords: ["paneer", "tomato"],
    matchAll: true,
    recipe_name: "3-Ingredient Quick Butter Paneer",
    description: "Restaurant favorite made in a fraction of the time using fresh paneer cubes simmered in buttery tomato puree.",
    prep_time: "3 mins",
    cook_time: "7 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Paneer Cubes", is_deal: true, quantity: "200g" },
      { name: "Ripe Tomatoes (Pureed)", is_deal: true, quantity: "3 medium" },
      { name: "Butter & Garam Masala", is_deal: false, quantity: "1 tbsp butter, 1 tsp masala" },
    ],
    instructions: [
      { step_number: 1, instruction: "Melt butter in a pan, pour in fresh tomato puree, and cook for 4 minutes until oil separates." },
      { step_number: 2, instruction: "Add garam masala and salt, then gently slide in paneer cubes." },
      { step_number: 3, instruction: "Simmer for 2 minutes on low heat until paneer absorbs the silky buttery gravy." },
      { step_number: 4, instruction: "Serve hot with roti, rice, or toasted bread!" },
    ],
    waste_saved_summary: "Saved 200g paneer and 3 tomatoes into a royal curry dinner!",
  },
  {
    keywords: ["paneer"],
    recipe_name: "2-Ingredient Tawa Paneer Tikka Bites",
    description: "Sizzling golden paneer cubes pan-seared with chaat masala. Crispy on the outside, succulent and juicy inside.",
    prep_time: "2 mins",
    cook_time: "4 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Fresh Paneer", is_deal: true, quantity: "200g, cut into bite-sized cubes" },
      { name: "Chaat Masala or Chili Powder", is_deal: false, quantity: "1 teaspoon" },
      { name: "Cooking Oil / Butter", is_deal: false, quantity: "1 teaspoon" },
    ],
    instructions: [
      { step_number: 1, instruction: "Toss paneer cubes lightly with chaat masala or chili powder and salt." },
      { step_number: 2, instruction: "Heat 1 tsp oil in a non-stick tawa or skillet over medium-high heat." },
      { step_number: 3, instruction: "Sear paneer cubes for 1 minute on each side until golden and slightly charred." },
      { step_number: 4, instruction: "Squeeze a drop of lemon juice and serve immediately with toothpicks!" },
    ],
    waste_saved_summary: "Instant high-protein appetizer rescuing fresh dairy shelf life!",
  },

  // ─── YOGURT / CURD COMBINATIONS (2 & 3 INGREDIENTS) ─────────────────
  {
    keywords: ["yogurt", "curd"],
    recipe_name: "2-Ingredient Authentic Punjabi Sweet Lassi",
    description: "The refreshing crown jewel of North Indian drinks. Creamy, chilled yogurt whipped with sugar and a splash of cold water.",
    prep_time: "2 mins",
    cook_time: "0 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Fresh Curd / Yogurt", is_deal: true, quantity: "1 cup (240g)" },
      { name: "Sugar or Honey", is_deal: false, quantity: "2 tablespoons" },
      { name: "Chilled Water / Ice", is_deal: false, quantity: "1/4 cup" },
    ],
    instructions: [
      { step_number: 1, instruction: "Add fresh curd, sugar, and chilled water into a blender jar or use a traditional wooden madhani." },
      { step_number: 2, instruction: "Blend for 30–45 seconds until a thick, frothy malai top forms." },
      { step_number: 3, instruction: "Pour into a glass and serve chilled. Creamy, cooling, and probiotic-rich!" },
    ],
    waste_saved_summary: "Upcycled 1 cup of near-expiry yogurt into a revitalizing drink!",
  },

  // ─── RICE COMBINATIONS (2 & 3 INGREDIENTS) ──────────────────────────
  {
    keywords: ["rice", "egg"],
    matchAll: true,
    recipe_name: "2-Ingredient 3-Minute Egg Fried Rice",
    description: "The ultimate Asian leftover rescue! Turns surplus cooked rice and eggs into a steaming, fragrant bowl of comfort.",
    prep_time: "1 min",
    cook_time: "3 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Cooked Rice", is_deal: true, quantity: "1–2 cups" },
      { name: "Eggs", is_deal: true, quantity: "2 whole" },
      { name: "Soy Sauce or Salt & Oil", is_deal: false, quantity: "1 tbsp oil, 1 tbsp soy sauce" },
    ],
    instructions: [
      { step_number: 1, instruction: "Heat 1 tbsp oil in a wok or skillet over high heat. Crack in the eggs and scramble quickly for 30 seconds." },
      { step_number: 2, instruction: "Add cold cooked rice immediately and break up any clumps with a spatula." },
      { step_number: 3, instruction: "Toss vigorously over high heat for 2 minutes, then drizzle soy sauce or salt along the edges of the pan." },
      { step_number: 4, instruction: "Serve steaming hot. Restaurant-quality egg fried rice in 3 minutes flat!" },
    ],
    waste_saved_summary: "Zero cooked rice wasted, saving valuable grain harvest!",
  },
  {
    keywords: ["rice", "milk"],
    matchAll: true,
    recipe_name: "3-Ingredient Creamy Rice Kheer / Rice Pudding",
    description: "The international comfort pudding celebrated from India (Kheer) to Spain (Arroz con Leche) and Latin America. Creamy, fragrant, and warming.",
    prep_time: "2 mins",
    cook_time: "18 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Surplus Fresh Milk", is_deal: true, quantity: "500 ml" },
      { name: "Rice (Raw or Cooked)", is_deal: true, quantity: "1/4 cup raw or 1/2 cup cooked" },
      { name: "Sugar & Cardamom", is_deal: false, quantity: "3 tbsp sugar, pinch of cardamom" },
    ],
    instructions: [
      { step_number: 1, instruction: "Bring milk to a boil in a heavy pot over medium heat." },
      { step_number: 2, instruction: "Add washed rice, reduce heat to low, and simmer for 15 minutes, stirring occasionally until rice softens and absorbs the milk." },
      { step_number: 3, instruction: "Stir in sugar and crushed cardamom for 2 minutes until rich and thick." },
      { step_number: 4, instruction: "Serve warm or chilled. A timeless royal dessert made with 3 basic pantry staples!" },
    ],
    waste_saved_summary: "Turned 500ml milk and rice into a festive dessert!",
  },

  // ─── APPLE / FRUIT COMBINATIONS ─────────────────────────────────────
  {
    keywords: ["apple"],
    recipe_name: "3-Ingredient Warm Baked Cinnamon Apples",
    description: "Cozy Scandinavian-style dessert. Tender, caramelized apples scented with cinnamon and honey.",
    prep_time: "3 mins",
    cook_time: "10 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Fresh Apples", is_deal: true, quantity: "2 apples, sliced" },
      { name: "Butter", is_deal: false, quantity: "1 tablespoon" },
      { name: "Cinnamon & Honey", is_deal: false, quantity: "1/2 tsp cinnamon, 1 tbsp honey" },
    ],
    instructions: [
      { step_number: 1, instruction: "Slice apples into thin wedges (no need to peel)." },
      { step_number: 2, instruction: "Melt 1 tbsp butter in a skillet over medium heat, add sliced apples and cinnamon." },
      { step_number: 3, instruction: "Sauté for 6–8 minutes until apples are soft, golden, and caramelized." },
      { step_number: 4, instruction: "Drizzle with honey and serve warm over oatmeal, yogurt, or by the spoonful!" },
    ],
    waste_saved_summary: "Rescued 2 apples from bruising, preventing fruit waste!",
  },

  // ─── CHICKEN / MEAT COMBINATIONS ────────────────────────────────────
  {
    keywords: ["chicken", "meat"],
    recipe_name: "3-Ingredient Garlic Butter Glazed Chicken Bites",
    description: "Juicy, caramelized pan-seared chicken bites tossed in rich garlic butter. Fast, savory, and high in protein.",
    prep_time: "3 mins",
    cook_time: "8 mins",
    difficulty: "Easy",
    ingredients: [
      { name: "Chicken Pieces", is_deal: true, quantity: "250g, bite-sized" },
      { name: "Butter & Minced Garlic", is_deal: false, quantity: "1 tbsp butter, 3 cloves garlic" },
      { name: "Salt & Black Pepper", is_deal: false, quantity: "To taste" },
    ],
    instructions: [
      { step_number: 1, instruction: "Season chicken bites with salt and pepper." },
      { step_number: 2, instruction: "Melt half the butter in a skillet over high heat. Sear chicken bites for 3 minutes per side until golden brown." },
      { step_number: 3, instruction: "Add remaining butter and minced garlic, basting the chicken continuously for 2 minutes." },
      { step_number: 4, instruction: "Remove from heat when internal temperature reaches 75°C. Succulent and intensely flavorful!" },
    ],
    waste_saved_summary: "Rescued 250g surplus chicken, preventing 3.2 kg CO₂e from livestock waste!",
  },
];

/**
 * Intelligent 2 & 3-Ingredient Recipe Matcher
 * Finds the easiest, most delicious world recipe matching the provided grocery ingredients.
 */
export function findWorldEasiestRecipe(
  products: Array<{ name: string; category?: string }>
): ApiRecipeResponse {
  if (!products || products.length === 0) {
    return WORLD_EASIEST_RECIPES[0];
  }

  // Combine product names and categories into lower-case search tokens
  const tokens = products.flatMap((p) => {
    const n = (p.name || "").toLowerCase();
    const c = (p.category || "").toLowerCase();
    return [n, c, ...n.split(/\s+/)];
  });

  const fullText = tokens.join(" ");

  // 1. Try multi-ingredient matches (e.g. Milk + Banana, Milk + Bread, Egg + Tomato)
  const multiMatches = WORLD_EASIEST_RECIPES.filter((r) => {
    if (!r.matchAll || r.keywords.length < 2) return false;
    return r.keywords.every((kw) => fullText.includes(kw));
  });

  if (multiMatches.length > 0) {
    const selected = multiMatches[Math.floor(Math.random() * multiMatches.length)];
    return personalizeRecipe(selected, products);
  }

  // 2. Try single-keyword exact/partial matches
  const singleMatches = WORLD_EASIEST_RECIPES.filter((r) => {
    return r.keywords.some((kw) => fullText.includes(kw));
  });

  if (singleMatches.length > 0) {
    // Randomize among valid matches so repeated clicks on "Milk" give exciting different world recipes
    const selected = singleMatches[Math.floor(Math.random() * singleMatches.length)];
    return personalizeRecipe(selected, products);
  }

  // 3. Fallback: Universal 3-Ingredient Skillet Sauté
  const leadName = products[0]?.name || "Surplus Ingredient";
  return {
    recipe_name: `3-Ingredient Golden ${leadName} Skillet Medley`,
    description: `A fast 10-minute zero-waste pan dish designed to rescue your ${leadName} with basic kitchen staples.`,
    prep_time: "3 mins",
    cook_time: "7 mins",
    difficulty: "Easy",
    ingredients: [
      { name: leadName, is_deal: true, quantity: "1 portion" },
      { name: "Butter or Olive Oil", is_deal: false, quantity: "1 tablespoon" },
      { name: "Salt & Crushed Pepper", is_deal: false, quantity: "To taste" },
    ],
    instructions: [
      { step_number: 1, instruction: `Chop ${leadName} into uniform bite-sized pieces.` },
      { step_number: 2, instruction: "Heat 1 tbsp butter or oil in a pan over medium heat." },
      { step_number: 3, instruction: `Add the ${leadName} and sauté for 5–7 minutes until tender, fragrant, and golden brown.` },
      { step_number: 4, instruction: "Season with salt, pepper, and enjoy fresh hot zero-waste goodness!" },
    ],
    waste_saved_summary: `Rescued ${leadName} from landfill, saving 0.7 kg CO₂e greenhouse gas emissions!`,
  };
}

function personalizeRecipe(
  template: RecipeTemplate,
  products: Array<{ name: string; category?: string }>
): ApiRecipeResponse {
  // Flag any ingredient that matches user products as a deal
  const userNames = products.map((p) => (p.name || "").toLowerCase());
  const ingredients = template.ingredients.map((ing) => {
    const ingLower = ing.name.toLowerCase();
    const isUserDeal = userNames.some((un) => un.includes(ingLower) || ingLower.includes(un));
    return {
      ...ing,
      is_deal: ing.is_deal || isUserDeal,
    };
  });

  return {
    recipe_name: template.recipe_name,
    description: template.description,
    prep_time: template.prep_time,
    cook_time: template.cook_time,
    difficulty: template.difficulty,
    ingredients,
    instructions: template.instructions,
    waste_saved_summary: template.waste_saved_summary,
  };
}

