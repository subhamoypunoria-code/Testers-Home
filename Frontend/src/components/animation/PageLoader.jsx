import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

const PageLoader = ({ isLoading = true }) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        key="loader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: '#000000' }}
      >
        <div className="relative flex flex-col items-center gap-6">
          <motion.div
            className="relative w-16 h-16 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: '#ff5c1a', borderRightColor: 'rgba(255,255,255,0.15)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-transparent"
              style={{ borderBottomColor: '#ff5c1a' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
            <Shield size={24} className="text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 font-sora text-lg font-bold tracking-tight"
          >
            <span className="text-white">Testers</span>
            <span className="text-[#ff5c1a]">Home</span>
          </motion.div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default PageLoader;
