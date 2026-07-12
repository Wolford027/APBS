import React from 'react';
import { motion } from 'motion/react';
import { durations, ease } from '../animations';

// Motion-powered replacement for MUI's default dialog transition.
// Registered once as MuiDialog's default TransitionComponent in theme.js,
// so every Dialog in the app (including @toolpad/core dialogs) animates
// the same way without per-file changes.
//
// MUI's Modal drives mount/unmount through the react-transition-group
// contract: `in` toggles the state, `onEnter` must fire when the enter
// animation starts (so Modal knows it is no longer exited) and `onExited`
// must fire when the exit animation finishes (so Modal can unmount).
const DialogTransition = React.forwardRef(function DialogTransition(props, ref) {
  const {
    in: open,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExiting,
    onExited,
    appear,
    timeout,
    easing: muiEasing,
    style,
    children,
    ...other
  } = props;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={open ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: durations.standard, ease }}
      onAnimationStart={() => {
        if (open && onEnter) onEnter(null, true);
      }}
      onAnimationComplete={() => {
        if (open && onEntered) onEntered(null, true);
        if (!open && onExited) onExited(null);
      }}
      // The wrapped MuiDialog-container uses height: 100%, which needs a
      // full-height parent to center the paper correctly.
      style={{ ...style, height: '100%' }}
      {...other}
    >
      {children}
    </motion.div>
  );
});

export default DialogTransition;
