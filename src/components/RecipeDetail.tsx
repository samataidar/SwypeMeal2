import { motion, AnimatePresence } from 'framer-motion';
import { Recipe } from '../types';
import { X, Clock, Users, Flame, Beef, Wheat, Egg, ChefHat, Heart } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe | null;
  onClose: () => void;
  onAddToQueue: () => void;
  isInQueue: boolean;
}

export default function RecipeDetail({ recipe, onClose, onAddToQueue, isInQueue }: RecipeDetailProps) {
  if (!recipe) return null;

  const difficultyColor = {
    'Легко': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Средне': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Сложно': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const gradientColors = [
    'from-violet-600/40 to-fuchsia-600/40',
    'from-blue-600/40 to-cyan-600/40',
    'from-emerald-600/40 to-teal-600/40',
    'from-orange-600/40 to-amber-600/40',
    'from-rose-600/40 to-pink-600/40',
    'from-indigo-600/40 to-purple-600/40',
  ];

  const gradientIndex = parseInt(recipe.id) % gradientColors.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg max-h-[85vh] bg-[#1a1a24] rounded-t-3xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header gradient */}
          <div className={`relative h-40 bg-gradient-to-br ${gradientColors[gradientIndex]} flex items-center justify-center`}>
            <span className="text-7xl">{recipe.image}</span>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Category */}
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm text-white/90 px-3 py-1 rounded-full text-xs font-medium">
              {recipe.category}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto max-h-[calc(85vh-160px)]">
            <h2 className="text-2xl font-bold text-white mb-1">{recipe.title}</h2>
            <p className="text-gray-400 text-sm mb-4">{recipe.description}</p>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                <Clock size={14} />
                <span>{recipe.time} мин</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                <Users size={14} />
                <span>{recipe.servings} порц.</span>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${difficultyColor[recipe.difficulty]}`}>
                {recipe.difficulty}
              </div>
            </div>

            {/* Nutrition */}
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              Пищевая ценность (на порцию)
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-5">
              <div className="bg-orange-500/10 rounded-xl p-3 text-center border border-orange-500/20">
                <Flame size={18} className="mx-auto mb-1 text-orange-400" />
                <div className="text-orange-400 font-bold">{recipe.nutrition.calories}</div>
                <div className="text-gray-500 text-[10px]">ккал</div>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/20">
                <Egg size={18} className="mx-auto mb-1 text-blue-400" />
                <div className="text-blue-400 font-bold">{recipe.nutrition.protein}г</div>
                <div className="text-gray-500 text-[10px]">белки</div>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-3 text-center border border-yellow-500/20">
                <Beef size={18} className="mx-auto mb-1 text-yellow-400" />
                <div className="text-yellow-400 font-bold">{recipe.nutrition.fat}г</div>
                <div className="text-gray-500 text-[10px]">жиры</div>
              </div>
              <div className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/20">
                <Wheat size={18} className="mx-auto mb-1 text-purple-400" />
                <div className="text-purple-400 font-bold">{recipe.nutrition.carbs}г</div>
                <div className="text-gray-500 text-[10px]">углеводы</div>
              </div>
            </div>

            {/* Ingredients */}
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              🧾 Ингредиенты
            </h3>
            <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/5">
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.tags.map(tag => (
                <span key={tag} className="bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg text-xs border border-white/5">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Add to queue button */}
            <button
              onClick={onAddToQueue}
              disabled={isInQueue}
              className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                isInQueue
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
              }`}
            >
              {isInQueue ? (
                <>
                  <ChefHat size={18} />
                  Уже в очереди
                </>
              ) : (
                <>
                  <Heart size={18} />
                  Добавить в очередь готовки
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
