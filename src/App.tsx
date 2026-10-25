import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { recipes as initialRecipes, categories } from './data/recipes';
import { Recipe, QueueItem, HistoryItem, TabType } from './types';
import SwipeCard from './components/SwipeCard';
import RecipeQueue from './components/RecipeQueue';
import History from './components/History';
import RecipeDetail from './components/RecipeDetail';
import Onboarding from './components/Onboarding';
import AddRecipeForm from './components/AddRecipeForm';
import { Heart, X, List, History as HistoryIcon, RotateCcw, Sparkles, Info, Plus, SkipForward } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('swipe');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [swipedRecipes, setSwipedRecipes] = useState<Set<string>>(new Set()); // Требование 5
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]); // Пользовательские рецепты

  // Объединяем базовые рецепты с пользовательскими (только одобренные)
  const allRecipes = useMemo(() => {
    const approvedUserRecipes = userRecipes.filter(r => r.moderationStatus === 'approved');
    return [...initialRecipes, ...approvedUserRecipes];
  }, [userRecipes]);

  // Фильтруем рецепты для свайпа (требования 4 и 5)
  const availableRecipes = useMemo(() => {
    const queueRecipeIds = new Set(queue.map(q => q.recipe.id));
    return allRecipes.filter(recipe => 
      !queueRecipeIds.has(recipe.id) && 
      !swipedRecipes.has(recipe.id)
    );
  }, [allRecipes, queue, swipedRecipes]);

  // Перемешиваем доступные рецепты
  const shuffledRecipes = useMemo(() => {
    const shuffled = [...availableRecipes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [availableRecipes]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Сбрасываем индекс если текущий рецепт больше недоступен
  useEffect(() => {
    if (currentIndex >= shuffledRecipes.length && shuffledRecipes.length > 0) {
      setCurrentIndex(0);
    }
  }, [shuffledRecipes.length, currentIndex]);

  const currentRecipe = shuffledRecipes[currentIndex];
  const nextRecipe = shuffledRecipes[currentIndex + 1];

  // Splash screen & onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('swypemeal_onboarding_seen');
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('swypemeal_onboarding_seen', 'true');
  }, []);

  // Обработка свайпа (требования 4, 5, 8)
  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up') => {
    if (!currentRecipe) return;

    // Добавляем в историю просмотренных (требование 5)
    setSwipedRecipes(prev => new Set(prev).add(currentRecipe.id));

    // Добавляем в историю
    setHistory(prev => [{
      recipe: currentRecipe,
      action: direction === 'right' ? 'like' : 'dislike',
      timestamp: Date.now()
    }, ...prev]);

    // Если лайк, добавляем в очередь (требование 3 - дубликаты запрещены)
    if (direction === 'right') {
      setQueue(prev => {
        // Проверяем, нет ли уже в очереди
        if (prev.find(q => q.recipe.id === currentRecipe.id)) {
          return prev;
        }
        // Добавляем в конец (FIFO - требование 1)
        return [...prev, {
          recipe: currentRecipe,
          addedAt: Date.now(),
          position: prev.length
        }];
      });
    }

    // Переходим к следующему рецепту
    setCurrentIndex(prev => prev + 1);
  }, [currentRecipe]);

  // Перемещение вверх в очереди (требование 2)
  const handleMoveUp = useCallback((recipeId: string) => {
    setQueue(prev => {
      const index = prev.findIndex(q => q.recipe.id === recipeId);
      if (index <= 0) return prev;
      
      const newQueue = [...prev];
      [newQueue[index - 1], newQueue[index]] = [newQueue[index], newQueue[index - 1]];
      
      // Пересчитываем позиции (требование 6)
      return newQueue.map((item, i) => ({ ...item, position: i }));
    });
  }, []);

  // Перемещение вниз в очереди (требование 2)
  const handleMoveDown = useCallback((recipeId: string) => {
    setQueue(prev => {
      const index = prev.findIndex(q => q.recipe.id === recipeId);
      if (index === -1 || index >= prev.length - 1) return prev;
      
      const newQueue = [...prev];
      [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]];
      
      // Пересчитываем позиции (требование 6)
      return newQueue.map((item, i) => ({ ...item, position: i }));
    });
  }, []);

  // Удаление из очереди (требование 6)
  const handleRemoveFromQueue = useCallback((recipeId: string) => {
    setQueue(prev => {
      const newQueue = prev.filter(item => item.recipe.id !== recipeId);
      // Пересчитываем позиции
      return newQueue.map((item, i) => ({ ...item, position: i }));
    });
  }, []);

  // Готовка = удаление из очереди + добавление в историю (требование 7)
  const handleCook = useCallback((recipeId: string) => {
    setQueue(prev => {
      const item = prev.find(q => q.recipe.id === recipeId);
      if (!item) return prev;

      // Добавляем в историю готовки
      setHistory(historyPrev => [{
        recipe: item.recipe,
        action: 'like', // Готовка считается положительным действием
        timestamp: Date.now()
      }, ...historyPrev]);

      alert(`🍳 Начинаем готовить: ${item.recipe.title}!\n\n⏱ Время: ${item.recipe.time} мин\n🔥 Калории: ${item.recipe.nutrition.calories} ккал\n🥩 Белки: ${item.recipe.nutrition.protein}г`);

      // Удаляем из очереди и пересчитываем позиции (требование 6, 7)
      const newQueue = prev.filter(q => q.recipe.id !== recipeId);
      return newQueue.map((q, i) => ({ ...q, position: i }));
    });
  }, []);

  const handleClearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const handleHistoryUndo = useCallback((recipeId: string) => {
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (recipe) {
      setHistory(prev => prev.filter(h => h.recipe.id !== recipeId));
      setQueue(prev => {
        if (prev.find(q => q.recipe.id === recipeId)) return prev;
        return [...prev, {
          recipe,
          addedAt: Date.now(),
          position: prev.length
        }];
      });
    }
  }, [allRecipes]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleAddToQueueFromDetail = useCallback(() => {
    if (selectedRecipe) {
      setQueue(prev => {
        if (prev.find(q => q.recipe.id === selectedRecipe.id)) return prev;
        return [...prev, {
          recipe: selectedRecipe,
          addedAt: Date.now(),
          position: prev.length
        }];
      });
    }
  }, [selectedRecipe]);

  // Добавление нового рецепта (требование 10)
  const handleAddRecipe = useCallback((recipeData: Omit<Recipe, 'id' | 'moderationStatus' | 'createdBy'>) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: `user_${Date.now()}`,
      moderationStatus: 'pending',
      createdBy: 'guest',
    };
    
    setUserRecipes(prev => [...prev, newRecipe]);
    
    // В реальном приложении здесь был бы API запрос
    console.log('New recipe submitted for moderation:', newRecipe);
  }, []);

  const isInQueue = selectedRecipe ? queue.some(q => q.recipe.id === selectedRecipe.id) : false;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'swipe', label: 'Свайп', icon: <Sparkles size={20} /> },
    { id: 'queue', label: 'Очередь', icon: <List size={20} />, count: queue.length },
    { id: 'history', label: 'История', icon: <HistoryIcon size={20} />, count: history.length },
  ];

  // Splash screen
  if (showSplash) {
    return (
      <motion.div
        className="h-full w-full bg-[#0f0f14] flex flex-col items-center justify-center relative overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Animated background circles */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-fuchsia-500/10 blur-3xl"
            animate={{ scale: [1.3, 1, 1.3], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -5, 0] }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-7xl mb-4"
          >
            🍽️
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Swype<span className="text-violet-400">Meal</span>
          </h1>
          <p className="text-gray-500 text-sm">Планируй питание за минуту</p>
          <motion.div
            className="mt-6 w-32 h-1 bg-violet-500/30 rounded-full mx-auto overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="h-full w-full bg-[#0f0f14] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-white">
              Swype<span className="text-violet-400">Meal</span>
            </h1>
          </div>
          
          {/* Add recipe button */}
          <button
            onClick={() => setShowAddRecipe(true)}
            className="flex items-center gap-1.5 bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-full text-xs font-medium border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
          >
            <Plus size={12} />
            Добавить
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentTab === 'swipe' && (
            <motion.div
              key="swipe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full px-4 pb-2"
            >
              {/* Card stack */}
              <div className="relative h-full max-h-[calc(100vh-200px)]">
                {shuffledRecipes.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-white mb-2">Все рецепты просмотрены!</h3>
                    <p className="text-gray-500 text-sm max-w-[250px] mb-4">
                      Вы просмотрели все доступные рецепты. Добавьте новые или очистите историю.
                    </p>
                    <button
                      onClick={() => setSwipedRecipes(new Set())}
                      className="px-6 py-3 rounded-xl bg-violet-500/20 text-violet-400 font-medium text-sm border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
                    >
                      Начать заново
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Background card (next) */}
                    {nextRecipe && (
                      <div className="absolute inset-0 scale-95 opacity-50 pointer-events-none">
                        <SwipeCard
                          recipe={nextRecipe}
                          onSwipe={() => {}}
                          isTop={false}
                        />
                      </div>
                    )}

                    {/* Top card */}
                    {currentRecipe && (
                      <div className="absolute inset-0">
                        <SwipeCard
                          key={currentRecipe.id}
                          recipe={currentRecipe}
                          onSwipe={handleSwipe}
                          isTop={true}
                        />
                      </div>
                    )}

                    {/* Info button overlay */}
                    {currentRecipe && (
                      <button
                        onClick={() => setSelectedRecipe(currentRecipe)}
                        className="absolute bottom-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10"
                      >
                        <Info size={18} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Action buttons */}
              {shuffledRecipes.length > 0 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('left')}
                    className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors shadow-lg shadow-red-500/10"
                  >
                    <X size={24} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('up')}
                    className="w-12 h-12 rounded-full bg-gray-500/20 border-2 border-gray-500/40 flex items-center justify-center text-gray-400 hover:bg-gray-500/30 transition-colors shadow-lg shadow-gray-500/10"
                    title="Пропустить"
                  >
                    <SkipForward size={20} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('right')}
                    className="w-14 h-14 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors shadow-lg shadow-green-500/10"
                  >
                    <Heart size={24} />
                  </motion.button>
                </div>
              )}

              {/* Progress indicator */}
              {shuffledRecipes.length > 0 && (
                <div className="flex items-center justify-center mt-3 gap-1">
                  <span className="text-gray-500 text-xs">
                    {currentIndex + 1} / {shuffledRecipes.length} рецептов
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {currentTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <RecipeQueue
                queue={queue}
                onRemove={handleRemoveFromQueue}
                onCook={handleCook}
                onClear={handleClearQueue}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            </motion.div>
          )}

          {currentTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <History
                history={history}
                onUndo={handleHistoryUndo}
                onClear={handleClearHistory}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <nav className="flex-shrink-0 bg-[#1a1a24]/90 backdrop-blur-xl border-t border-white/5 px-4 py-2 pb-4">
        <div className="flex items-center justify-around">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                currentTab === tab.id
                  ? 'text-violet-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {currentTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-violet-500/10 rounded-xl border border-violet-500/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10 text-xs font-medium">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center z-10">
                  {tab.count > 9 ? '9+' : tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Recipe Detail Modal */}
      <RecipeDetail
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onAddToQueue={handleAddToQueueFromDetail}
        isInQueue={isInQueue}
      />

      {/* Onboarding */}
      <Onboarding
        show={showOnboarding}
        onClose={handleCloseOnboarding}
      />

      {/* Add Recipe Form */}
      <AddRecipeForm
        show={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        onSubmit={handleAddRecipe}
      />
    </div>
  );
}

export default App;
