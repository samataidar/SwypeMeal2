import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface OnboardingProps {
  show: boolean;
  onClose: () => void;
}

const steps = [
  {
    emoji: '👆',
    title: 'Свайпай рецепты',
    description: 'Листай карточки влево или вправо — как в Tinder!',
  },
  {
    emoji: '❤️',
    title: 'Нравится — в очередь',
    description: 'Свайп вправо добавляет рецепт в очередь готовки',
  },
  {
    emoji: '🍳',
    title: 'Готовь по плану',
    description: 'Открывай очередь и готовь по порядку — FIFO!',
  },
];

export default function Onboarding({ show, onClose }: OnboardingProps) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative bg-[#1a1a24] rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Как пользоваться</h2>
            <p className="text-gray-500 text-sm">3 простых шага</p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.15 }}
                className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 border border-white/5"
              >
                <div className="text-3xl flex-shrink-0">{step.emoji}</div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-0.5">{step.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
          >
            Понятно, начинаем! 🚀
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
