import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp, ease } from './motion';

const variants = {
  up: fadeInUp,
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8, ease: ease.smooth } } },
  scale: { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: ease.expoOut } } },
  left: { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: ease.expoOut } } },
  right: { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: ease.expoOut } } },
  blur: {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: ease.expoOut } },
  },
};

const Reveal = ({
  children,
  variant = 'up',
  delay = 0,
  duration,
  once = true,
  amount = 0.2,
  className = '',
  as = 'div',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const selected = variants[variant] || variants.up;
  const customTransition = {
    ...selected.visible.transition,
    delay,
    ...(duration ? { duration } : {}),
  };

  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: selected.hidden,
        visible: { ...selected.visible, transition: customTransition },
      }}
      className={className}
    >
      {children}
    </Component>
  );
};

export default Reveal;
