import { motion } from 'motion/react';

// Motion design tokens — the animation counterpart of theme.js.
// Every animation in the app should pull from these instead of
// inventing its own durations, easings, or offsets.
export const durations = {
  micro: 0.18,
  standard: 0.3,
  emphasis: 0.45,
};

// Matches MUI's standard easing curve so Motion and MUI transitions feel alike.
export const ease = [0.4, 0, 0.2, 1];

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.standard, ease },
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.emphasis, ease },
  },
};

// Parent/child pair: put staggerContainer on the wrapper and
// staggerItem on each child to cascade them in.
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.standard, ease },
  },
};

// Entrance for raw <Modal> content boxes; mirrors DialogTransition so
// Dialog- and Modal-based popups feel identical.
export const modalPop = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: durations.standard, ease },
  },
};

// Fades content up as it scrolls into view; for below-the-fold sections.
export function Reveal({ children, delay = 0, style }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: fadeInUp.hidden,
        visible: {
          ...fadeInUp.visible,
          transition: { ...fadeInUp.visible.transition, delay },
        },
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
