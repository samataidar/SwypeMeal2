import { motion, AnimatePresence } from 'framer-motion';
import { QueueItem } from '../types';
import { Clock, Trash2, GripVertical, ChefHat, Flame } from 'lucide-react';

interface RecipeQueueProps {
  queue: QueueItem[];
  onRemove: (recipeId: string) => void;
  onCook: (recipeId: string) => void;
  onClear: () => void;
}

export default function RecipeQueue({ queue, onRemove, onCook, onClear }: RecipeQueueProps) {
  const totalCalories = queue.reduce((sum, item) => sum + item.recipe.nutrition.calories, 0);
  const totalTime = queue.reduce((sum, item) => sum + item.recipe.time, 0);
  const totalProtein = queue.reduce((sum, item) => sum + item.recipe.nutrition.protein, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header stats */}
      {queue.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-orange-500/10 rounded-xl p-3 text-center border border-orange-500/20">
              <Flame size={18} className="mx-auto mb-1 text-orange-400" />
              <div className="text-orange-400 font-bold text-sm">{totalCalories}</div>
              <div className="text-gray-500 text-[10px]">ккал всего</div>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/20">
              <Clock size={18} className="mx-auto mb-1 text-blue-400" />
              <div className="text-blue-400 font-bold text-sm">{totalTime}</div>
              <div className="text-gray-500 text-[10px]">мин готовки</div>
            </div>
            <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
              <ChefHat size={18} className="mx-auto mb-1 text-green-400" />
              <div className="text-green-400 font-bold text-sm">{totalProtein}г</div>
              <div className="text-gray-500 text-[10px]">белков</div>
            </div>
          </div>
        </div>
      )}

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <AnimatePresence mode="popLayout">
          {queue.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-16"
            >
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-white mb-2">Очередь пуста</h3>
              <p className="text-gray-500 text-sm max-w-[250px]">
                Свайпайте рецепты вправо, чтобы добавить их в очередь готовки
              </p>
            </motion.div>
          ) : (
            queue.map((item, index) => (
              <motion.div
                key={item.recipe.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mb-3"
              >
                <div className="bg-[#1e1e2e] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Position number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm border border-violet-500/30">
                      {index + 1}
                    </div>

                    {/* Recipe info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.recipe.image}</span>
                        <h4 className="text-white font-semibold text-sm truncate">{item.recipe.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock size={11} /> {item.recipe.time} мин
                        </span>
                        <span className="text-orange-400 text-xs font-medium">
                          {item.recipe.nutrition.calories} ккал
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.recipe.difficulty === 'Легко' ? 'bg-green-500/20 text-green-400' :
                          item.recipe.difficulty === 'Средне' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.recipe.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onCook(item.recipe.id)}
                        className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors"
                        title="Начать готовить"
                      >
                        <ChefHat size={14} />
                      </button>
                      <button
                        onClick={() => onRemove(item.recipe.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Убрать из очереди"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Clear all button */}
      {queue.length > 0 && (
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={onClear}
            className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-medium text-sm border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            Очистить очередь
          </button>
        </div>
      )}
    </div>
  );
}
