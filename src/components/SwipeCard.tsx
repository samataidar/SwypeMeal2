import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Recipe } from '../types';
import { Clock, Users, Flame, Beef, Wheat, Egg } from 'lucide-react';

interface SwipeCardProps {
  recipe: Recipe;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

export default function SwipeCard({ recipe, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
  };

  const difficultyColor = {
    'Легко': 'bg-green-500/20 text-green-400',
    'Средне': 'bg-yellow-500/20 text-yellow-400',
    'Сложно': 'bg-red-500/20 text-red-400',
  };

  const gradientColors = [
    'from-violet-600/30 to-fuchsia-600/30',
    'from-blue-600/30 to-cyan-600/30',
    'from-emerald-600/30 to-teal-600/30',
    'from-orange-600/30 to-amber-600/30',
    'from-rose-600/30 to-pink-600/30',
    'from-indigo-600/30 to-purple-600/30',
  ];

  const gradientIndex = parseInt(recipe.id) % gradientColors.length;

  return (
    <motion.div
      className={`absolute inset-0 ${isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, zIndex: isTop ? 10 : 1 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={isTop ? { scale: 0.95, opacity: 0 } : {}}
      animate={isTop ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.7 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="h-full w-full rounded-3xl overflow-hidden bg-[#1a1a24] border border-white/10 shadow-2xl flex flex-col">
        {/* Header with emoji and gradient */}
        <div className={`relative h-48 bg-gradient-to-br ${gradientColors[gradientIndex]} flex items-center justify-center`}>
          <span className="text-8xl drop-shadow-lg">{recipe.image}</span>
          
          {/* Like/Nope indicators */}
          {isTop && (
            <>
              <motion.div
                className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-lg rotate-12 border-2 border-green-400"
                style={{ opacity: likeOpacity }}
              >
                ВКУСНО! 👍
              </motion.div>
              <motion.div
                className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg -rotate-12 border-2 border-red-400"
                style={{ opacity: nopeOpacity }}
              >
                НЕТ 👎
              </motion.div>
            </>
          )}

          {/* Category badge */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white/90 px-3 py-1 rounded-full text-xs font-medium">
            {recipe.category}
          </div>

          {/* Time badge */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white/90 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock size={12} />
            {recipe.time} мин
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-2">{recipe.title}</h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">{recipe.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.tags.map(tag => (
              <span key={tag} className="bg-white/5 text-gray-300 px-2.5 py-1 rounded-lg text-xs border border-white/5">
                #{tag}
              </span>
            ))}
          </div>

          {/* Nutrition */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-orange-500/10 rounded-xl p-2.5 text-center border border-orange-500/20">
              <Flame size={16} className="mx-auto mb-1 text-orange-400" />
              <div className="text-orange-400 font-bold text-sm">{recipe.nutrition.calories}</div>
              <div className="text-gray-500 text-[10px]">ккал</div>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-2.5 text-center border border-blue-500/20">
              <Egg size={16} className="mx-auto mb-1 text-blue-400" />
              <div className="text-blue-400 font-bold text-sm">{recipe.nutrition.protein}г</div>
              <div className="text-gray-500 text-[10px]">белки</div>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-2.5 text-center border border-yellow-500/20">
              <Beef size={16} className="mx-auto mb-1 text-yellow-400" />
              <div className="text-yellow-400 font-bold text-sm">{recipe.nutrition.fat}г</div>
              <div className="text-gray-500 text-[10px]">жиры</div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-2.5 text-center border border-purple-500/20">
              <Wheat size={16} className="mx-auto mb-1 text-purple-400" />
              <div className="text-purple-400 font-bold text-sm">{recipe.nutrition.carbs}г</div>
              <div className="text-gray-500 text-[10px]">углеводы</div>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-auto">
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Users size={14} />
              <span>{recipe.servings} порц.</span>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${difficultyColor[recipe.difficulty]}`}>
              {recipe.difficulty}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
