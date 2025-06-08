
import type { Meal } from '@/types';

export const sampleMeals: Meal[] = [
  {
    id: 'meal-1',
    name: 'Vegan Buddha Bowl',
    description: 'A hearty and healthy bowl with quinoa, roasted vegetables, avocado, and a tangy tahini dressing. Perfect for a light yet satisfying meal.',
    price: 15,
    dietaryTags: ['vegan', 'gluten-free', 'dairy-free'],
    imageUrl: 'https://placehold.co/600x400.png',
    calories: 550,
    prepTime: '20 mins',
    ingredients: ['Quinoa', 'Broccoli', 'Sweet Potatoes', 'Avocado', 'Chickpeas', 'Tahini', 'Lemon Juice', 'Maple Syrup'],
    steps: ['Cook quinoa according to package directions.', 'Roast chopped broccoli and sweet potatoes with olive oil and spices.', 'Prepare tahini dressing by whisking tahini, lemon juice, maple syrup, and water.', 'Assemble bowl: layer quinoa, roasted vegetables, sliced avocado, and chickpeas. Drizzle with tahini dressing.'],
    html: `
      <div>
        <h4 style="color: var(--primary); font-weight: bold;">Chef's Special Touch:</h4>
        <p>For an extra crunch, toast some sesame seeds and sprinkle them on top before serving. You can also add a handful of fresh spinach for more greens!</p>
        <ul style="list-style-type: disc; margin-left: 20px;">
          <li><em>Pro Tip 1:</em> Marinate chickpeas in smoked paprika for a smoky flavor.</li>
          <li><em>Pro Tip 2:</em> Roasting vegetables at a high temperature (400°F/200°C) makes them crispy.</li>
        </ul>
      </div>
    `
  },
  {
    id: 'meal-2',
    name: 'Classic Chicken Salad Sandwich',
    description: 'Creamy chicken salad with celery, grapes, served on whole wheat bread. A timeless favorite.',
    price: 12,
    dietaryTags: [],
    imageUrl: 'https://placehold.co/600x400.png',
    calories: 450,
    prepTime: '10 mins',
    ingredients: ['Cooked Chicken Breast', 'Mayonnaise', 'Celery', 'Red Grapes', 'Salt', 'Pepper', 'Whole Wheat Bread', 'Lettuce'],
    steps: ['Dice cooked chicken breast.', 'Finely chop celery and halve red grapes.', 'In a bowl, mix chicken, mayonnaise, celery, and grapes. Season with salt and pepper.', 'Toast whole wheat bread lightly.', 'Serve chicken salad on bread with a lettuce leaf.'],
  },
  {
    id: 'meal-3',
    name: 'Spicy Tofu Stir-fry',
    description: 'Crispy tofu cubes tossed with colorful bell peppers, broccoli, and a savory, spicy sauce. Served with brown rice.',
    price: 14,
    dietaryTags: ['vegetarian', 'vegan', 'dairy-free'],
    imageUrl: 'https://placehold.co/600x400.png',
    calories: 600,
    prepTime: '25 mins',
    ingredients: ['Firm Tofu', 'Soy Sauce', 'Cornstarch', 'Sesame Oil', 'Bell Peppers (various colors)', 'Broccoli Florets', 'Brown Rice', 'Garlic', 'Ginger', 'Chili Flakes', 'Rice Vinegar'],
    steps: ['Press tofu to remove excess water, then cube it. Toss with soy sauce and cornstarch.', 'Pan-fry or bake tofu until crispy.', 'Cook brown rice.', 'Stir-fry chopped bell peppers and broccoli in sesame oil with minced garlic and ginger.', 'Add chili flakes, rice vinegar, and a bit more soy sauce to the vegetables.', 'Toss crispy tofu with vegetables and sauce. Serve over brown rice.'],
  },
  {
    id: 'meal-4',
    name: 'Gluten-Free Pasta Primavera',
    description: 'Delicious gluten-free penne pasta with a medley of spring vegetables in a light garlic and olive oil sauce.',
    price: 18,
    dietaryTags: ['vegetarian', 'gluten-free', 'dairy-free'],
    imageUrl: 'https://placehold.co/600x400.png',
    calories: 500,
    prepTime: '20 mins',
    ingredients: ['Gluten-Free Penne Pasta', 'Olive Oil', 'Garlic', 'Zucchini', 'Cherry Tomatoes', 'Asparagus', 'Spinach', 'Vegetable Broth', 'Lemon Zest', 'Fresh Basil', 'Salt', 'Pepper'],
    steps: ['Cook gluten-free pasta according to package directions.', 'While pasta cooks, sauté minced garlic in olive oil in a large pan.', 'Add chopped zucchini, halved cherry tomatoes, and trimmed asparagus. Cook until tender-crisp.', 'Stir in spinach until wilted. Add a splash of vegetable broth if needed.', 'Drain pasta and add it to the pan with vegetables. Toss to combine.', 'Stir in lemon zest and fresh basil. Season with salt and pepper.'],
  },
  {
    id: 'meal-5',
    name: 'Salmon with Roasted Asparagus',
    description: 'Flaky baked salmon fillet seasoned with herbs, served alongside tender roasted asparagus and lemon wedges.',
    price: 22,
    dietaryTags: ['gluten-free', 'dairy-free', 'nut-free'],
    imageUrl: 'https://placehold.co/600x400.png',
    calories: 480,
    prepTime: '30 mins',
    ingredients: ['Salmon Fillets', 'Asparagus Spears', 'Olive Oil', 'Dried Dill', 'Garlic Powder', 'Salt', 'Pepper', 'Lemon'],
    steps: ['Preheat oven to 400°F (200°C).', 'Toss asparagus with olive oil, salt, and pepper. Spread on one side of a baking sheet.', 'Season salmon fillets with dill, garlic powder, salt, and pepper. Place on the other side of the baking sheet.', 'Bake for 12-15 minutes, or until salmon is cooked through and asparagus is tender.', 'Serve with lemon wedges.'],
     html: `
      <div>
        <h4 style="color: #64B5F6; font-weight: 600;">Pairing Suggestion:</h4>
        <p>This salmon dish pairs wonderfully with a light quinoa salad or fluffy couscous. For a beverage, a crisp Sauvignon Blanc complements the fish beautifully.</p>
      </div>
    `
  },
  {
    id: 'meal-6',
    name: 'Nut-Free Granola Parfait',
    description: 'Layers of creamy yogurt, mixed berries, and crunchy nut-free granola. A great breakfast or snack.',
    price: 8,
    dietaryTags: ['vegetarian', 'nut-free'],
    imageUrl: 'https://placehold.co/600x400.png',
    calories: 350,
    prepTime: '5 mins',
    ingredients: ['Greek Yogurt (or dairy-free alternative)', 'Mixed Berries (strawberries, blueberries, raspberries)', 'Nut-Free Granola', 'Honey or Maple Syrup (optional)'],
    steps: ['In a glass or bowl, layer Greek yogurt.', 'Add a layer of mixed berries.', 'Sprinkle a generous layer of nut-free granola.', 'Repeat layers if desired.', 'Drizzle with honey or maple syrup if using.'],
  },
  {
    id: 'meal-7',
    name: 'Lentil Soup',
    description: 'A comforting and nutritious lentil soup with vegetables and aromatic spices. Served with a slice of whole-grain bread.',
    price: 9,
    dietaryTags: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free'],
    imageUrl: 'https://placehold.co/600x400.png',
    calories: 400,
    prepTime: '40 mins',
    ingredients: ['Brown or Green Lentils', 'Vegetable Broth', 'Onion', 'Carrots', 'Celery', 'Garlic', 'Diced Tomatoes (canned)', 'Cumin', 'Coriander', 'Turmeric', 'Olive Oil', 'Salt', 'Pepper', 'Fresh Parsley'],
    steps: ['Rinse lentils.', 'Sauté chopped onion, carrots, and celery in olive oil until softened.', 'Add minced garlic, cumin, coriander, and turmeric. Cook for 1 minute until fragrant.', 'Stir in lentils, vegetable broth, and diced tomatoes.', 'Bring to a boil, then reduce heat and simmer for 25-30 minutes, or until lentils are tender.', 'Season with salt and pepper. Stir in fresh parsley before serving.'],
  },
  {
    id: 'meal-8',
    name: 'Beef Tacos',
    description: 'Seasoned ground beef in crispy taco shells with lettuce, tomato, cheese, and sour cream. Fun and flavorful.',
    price: 13,
    dietaryTags: [],
    imageUrl: 'https://placehold.co/600x400.png',
    calories: 520,
    prepTime: '25 mins',
    ingredients: ['Ground Beef', 'Taco Seasoning', 'Water', 'Crispy Taco Shells', 'Shredded Lettuce', 'Diced Tomatoes', 'Shredded Cheddar Cheese', 'Sour Cream'],
    steps: ['Brown ground beef in a skillet; drain excess fat.', 'Stir in taco seasoning and water. Bring to a simmer and cook for 5-7 minutes, or until liquid has reduced.', 'Warm taco shells according to package directions.', 'Fill taco shells with seasoned beef.', 'Top with lettuce, tomatoes, cheese, and a dollop of sour cream.'],
  },
];
