import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, AlertCircle } from 'lucide-react';
import { Recipe, NutritionInfo } from '../types';
import { categories } from '../data/recipes';

interface AddRecipeFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (recipe: Omit<Recipe, 'id' | 'moderationStatus' | 'createdBy'>) => void;
}

export default function AddRecipeForm({ show, onClose, onSubmit }: AddRecipeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category: categories[1],
    time: 30,
    difficulty: 'Легко' as const,
    servings: 2,
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    },
    ingredients: [''],
    tags: [''],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Введите название рецепта';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Введите описание';
    }
    if (!formData.image.trim()) {
      newErrors.image = 'Добавьте эмодзи или символ';
    }
    if (formData.time < 1) {
      newErrors.time = 'Время должно быть больше 0';
    }
    if (formData.servings < 1) {
      newErrors.servings = 'Количество порций должно быть больше 0';
    }
    if (formData.nutrition.calories < 0) {
      newErrors.calories = 'Калории не могут быть отрицательными';
    }
    if (formData.ingredients.filter(i => i.trim()).length === 0) {
      newErrors.ingredients = 'Добавьте хотя бы один ингредиент';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const recipe = {
      ...formData,
      ingredients: formData.ingredients.filter(i => i.trim()),
      tags: formData.tags.filter(t => t.trim()),
    };

    onSubmit(recipe);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      category: categories[1],
      time: 30,
      difficulty: 'Легко',
      servings: 2,
      nutrition: {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
      ingredients: [''],
      tags: [''],
    });
    setErrors({});
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ''],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing),
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ''],
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag),
    }));
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg max-h-[90vh] bg-[#1a1a24] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Добавить рецепт</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-gray-500 text-xs">
              После добавления рецепт будет проверен модераторами
            </p>
          </div>

          {/* Success message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-5 mt-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-2"
              >
                <Check size={18} className="text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  Рецепт отправлен на модерацию!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Basic info */}
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Название *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                  errors.title ? 'border-red-500/50' : 'border-white/10'
                }`}
                placeholder="Например: Паста Карбонара"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Описание *
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none ${
                  errors.description ? 'border-red-500/50' : 'border-white/10'
                }`}
                placeholder="Краткое описание рецепта..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Эмодзи *
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-center text-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.image ? 'border-red-500/50' : 'border-white/10'
                  }`}
                  placeholder="🍝"
                  maxLength={2}
                />
                {errors.image && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.image}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  {categories.filter(c => c !== 'Все').map(cat => (
                    <option key={cat} value={cat} className="bg-[#1a1a24]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Время (мин)
                </label>
                <input
                  type="number"
                  value={formData.time}
                  onChange={e => setFormData(prev => ({ ...prev, time: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.time ? 'border-red-500/50' : 'border-white/10'
                  }`}
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Сложность
                </label>
                <select
                  value={formData.difficulty}
                  onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <option value="Легко" className="bg-[#1a1a24]">Легко</option>
                  <option value="Средне" className="bg-[#1a1a24]">Средне</option>
                  <option value="Сложно" className="bg-[#1a1a24]">Сложно</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Порции
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={e => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.servings ? 'border-red-500/50' : 'border-white/10'
                  }`}
                  min="1"
                />
              </div>
            </div>

            {/* Nutrition */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                КБЖУ (на порцию)
              </label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <input
                    type="number"
                    value={formData.nutrition.calories}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      nutrition: { ...prev.nutrition, calories: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="ккал"
                    min="0"
                  />
                  <p className="text-[10px] text-gray-500 text-center mt-1">Калории</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.nutrition.protein}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      nutrition: { ...prev.nutrition, protein: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="б"
                    min="0"
                  />
                  <p className="text-[10px] text-gray-500 text-center mt-1">Белки</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.nutrition.fat}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      nutrition: { ...prev.nutrition, fat: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="ж"
                    min="0"
                  />
                  <p className="text-[10px] text-gray-500 text-center mt-1">Жиры</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.nutrition.carbs}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      nutrition: { ...prev.nutrition, carbs: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="у"
                    min="0"
                  />
                  <p className="text-[10px] text-gray-500 text-center mt-1">Углеводы</p>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Ингредиенты *
              </label>
              <div className="space-y-2">
                {formData.ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ing}
                      onChange={e => updateIngredient(index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="Например: Спагетти 200г"
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addIngredient}
                className="mt-2 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                Добавить ингредиент
              </button>
              {errors.ingredients && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.ingredients}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Теги
              </label>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={e => updateTag(index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="Например: Итальянская"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTag}
                className="mt-2 w-full py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                Добавить тег
              </button>
            </div>
          </form>

          {/* Submit button */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-white/5">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={showSuccess}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showSuccess ? 'Отправлено!' : 'Отправить на модерацию'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
