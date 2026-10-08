import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { recipes } from './data/recipes';
import { Recipe, QueueItem, HistoryItem, TabType } from './types';
import SwipeCard from './components/SwipeCard';
import RecipeQueue from './components/RecipeQueue';
import History from './components/History';
import RecipeDetail from './components/RecipeDetail';
import Onboarding from './components/Onboarding';
import { Heart, X, List, History as HistoryIcon, RotateCcw, Sparkles, Info } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('swipe');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [lastSwipedRecipe, setLastSwipedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  // Shuffle recipes on first load
  const shuffledRecipes = useMemo(() => {
    const shuffled = [...recipes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const currentRecipe = shuffledRecipes[currentIndex % shuffledRecipes.length];
  const nextRecipe = shuffledRecipes[(currentIndex + 1) % shuffledRecipes.length];

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const recipe = currentRecipe;
    
    setSwipeDirection(direction);
    setLastSwipedRecipe(recipe);
    setShowUndo(true);

    // Add to history
    setHistory(prev => [{
      recipe,
      action: direction === 'right' ? 'like' : 'dislike',
      timestamp: Date.now()
    }, ...prev]);

    // If liked, add to queue
    if (direction === 'right') {
      setQueue(prev => {
        if (prev.find(q => q.recipe.id === recipe.id)) return prev;
        return [...prev, {
          recipe,
          addedAt: Date.now(),
          position: prev.length
        }];
      });
    }

    // Move to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);

    // Hide undo after 5 seconds
    setTimeout(() => {
      setShowUndo(false);
      setLastSwipedRecipe(null);
    }, 5000);
  }, [currentRecipe]);

  const handleUndo = useCallback(() => {
    if (lastSwipedRecipe) {
      // Remove from history
      setHistory(prev => prev.slice(1));
      // If it was liked, remove from queue
      setQueue(prev => prev.filter(q => q.recipe.id !== lastSwipedRecipe.id));
      // Go back
      setCurrentIndex(prev => prev - 1);
      setShowUndo(false);
      setLastSwipedRecipe(null);
    }
  }, [lastSwipedRecipe]);

  const handleRemoveFromQueue = useCallback((recipeId: string) => {
    setQueue(prev => prev.filter(item => item.recipe.id !== recipeId));
  }, []);

  const handleCook = useCallback((recipeId: string) => {
    const item = queue.find(i => i.recipe.id === recipeId);
    if (item) {
      alert(`🍳 Начинаем готовить: ${item.recipe.title}!\n\n⏱ Время: ${item.recipe.time} мин\n🔥 Калории: ${item.recipe.nutrition.calories} ккал\n🥩 Белки: ${item.recipe.nutrition.protein}г`);
    }
  }, [queue]);

  const handleClearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const handleHistoryUndo = useCallback((recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
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
  }, []);

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
          
          {/* Undo button */}
          <AnimatePresence>
            {showUndo && currentTab === 'swipe' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleUndo}
                className="flex items-center gap-1.5 bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-full text-xs font-medium border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
              >
                <RotateCcw size={12} />
                Отменить
              </motion.button>
            )}
          </AnimatePresence>
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
                {/* Background card (next) */}
                <div className="absolute inset-0 scale-95 opacity-50 pointer-events-none">
                  <SwipeCard
                    recipe={nextRecipe}
                    onSwipe={() => {}}
                    isTop={false}
                  />
                </div>
                
                {/* Swipe animation overlay */}
                <AnimatePresence>
                  {swipeDirection && (
                    <motion.div
                      className="absolute inset-0 z-20"
                      initial={{ opacity: 1 }}
                      animate={{
                        x: swipeDirection === 'right' ? 300 : -300,
                        rotate: swipeDirection === 'right' ? 20 : -20,
                        opacity: 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <SwipeCard
                        recipe={currentRecipe}
                        onSwipe={() => {}}
                        isTop={false}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Top card */}
                <div className="absolute inset-0">
                  <SwipeCard
                    key={currentIndex}
                    recipe={currentRecipe}
                    onSwipe={handleSwipe}
                    isTop={true}
                  />
                </div>

                {/* Info button overlay */}
                <button
                  onClick={() => setSelectedRecipe(currentRecipe)}
                  className="absolute bottom-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10"
                >
                  <Info size={18} />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe('left')}
                  className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors shadow-lg shadow-red-500/10"
                >
                  <X size={28} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe('right')}
                  className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors shadow-lg shadow-green-500/10"
                >
                  <Heart size={28} />
                </motion.button>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-center mt-3 gap-1">
                <span className="text-gray-500 text-xs">
                  {currentIndex + 1} / {shuffledRecipes.length} рецептов
                </span>
              </div>
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
    </div>
  );
}

export default App;
