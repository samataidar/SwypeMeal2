import { motion, AnimatePresence } from 'framer-motion';
import { HistoryItem } from '../types';
import { Clock, Heart, ThumbsDown, RotateCcw } from 'lucide-react';

interface HistoryProps {
  history: HistoryItem[];
  onUndo: (recipeId: string) => void;
  onClear: () => void;
}

export default function History({ history, onUndo, onClear }: HistoryProps) {
  const likedCount = history.filter(h => h.action === 'like').length;
  const dislikedCount = history.filter(h => h.action === 'dislike').length;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Stats */}
      <div className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
            <Heart size={18} className="mx-auto mb-1 text-green-400" />
            <div className="text-green-400 font-bold text-lg">{likedCount}</div>
            <div className="text-gray-500 text-xs">Понравились</div>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
            <ThumbsDown size={18} className="mx-auto mb-1 text-red-400" />
            <div className="text-red-400 font-bold text-lg">{dislikedCount}</div>
            <div className="text-gray-500 text-xs">Не понравились</div>
          </div>
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-16"
            >
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-white mb-2">История пуста</h3>
              <p className="text-gray-500 text-sm max-w-[250px]">
                Здесь будут отображаться все рецепты, которые вы просмотрели
              </p>
            </motion.div>
          ) : (
            history.map((item) => (
              <motion.div
                key={`${item.recipe.id}-${item.timestamp}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mb-3"
              >
                <div className={`rounded-2xl p-4 border ${
                  item.action === 'like' 
                    ? 'bg-green-500/5 border-green-500/20' 
                    : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.recipe.image}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm truncate">{item.recipe.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock size={11} /> {item.recipe.time} мин
                        </span>
                        <span className="text-orange-400 text-xs">
                          {item.recipe.nutrition.calories} ккал
                        </span>
                        <span className="text-gray-600 text-xs">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.action === 'like' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {item.action === 'like' ? (
                          <Heart size={14} className="text-green-400" fill="currentColor" />
                        ) : (
                          <ThumbsDown size={14} className="text-red-400" />
                        )}
                      </div>
                      {item.action === 'dislike' && (
                        <button
                          onClick={() => onUndo(item.recipe.id)}
                          className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 hover:bg-violet-500/30 transition-colors"
                          title="Вернуть рецепт"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Clear button */}
      {history.length > 0 && (
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={onClear}
            className="w-full py-3 rounded-xl bg-white/5 text-gray-400 font-medium text-sm border border-white/10 hover:bg-white/10 transition-colors"
          >
            Очистить историю
          </button>
        </div>
      )}
    </div>
  );
}
