import React from 'react';
import { Dialog, DialogContent, DialogActions, Box, Typography, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

/**
 * Shared premium modal shell built on MUI Dialog (inherits the theme
 * transition, 14px radius, scroll handling, and focus management).
 *
 * Header: optional tinted icon badge + title + subtitle + close button.
 * Content: divided, scrollable. Footer: `actions` node when provided.
 */
export default function PremiumModal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconColor = '#2563EB',
  actions,
  children,
  maxWidth = 'sm',
  fullWidth = true,
  contentSx,
  disableBackdropClose = false,
  ...dialogProps
}) {
  const handleClose = (event, reason) => {
    if (disableBackdropClose && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
    if (onClose) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={maxWidth} fullWidth={fullWidth} {...dialogProps}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, px: 3, pt: 2.5, pb: 2 }}>
        {Icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(iconColor, 0.1),
              color: iconColor,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{title}</Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography>
          )}
        </Box>
        {onClose && (
          <IconButton
            aria-label="Close"
            onClick={() => onClose()}
            size="small"
            sx={{ color: 'text.secondary', mt: -0.5, mr: -1 }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <DialogContent dividers sx={{ px: 3, py: 2.5, ...contentSx }}>
        {children}
      </DialogContent>
      {actions && <DialogActions sx={{ px: 3, py: 2 }}>{actions}</DialogActions>}
    </Dialog>
  );
}
