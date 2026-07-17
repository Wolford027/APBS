import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Table from '@mui/joy/Table';
import { alpha } from '@mui/material/styles';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import theme from '../theme';

const DIVIDER = theme.palette.divider;            // #E2E8F0
const TEXT_PRIMARY = theme.palette.text.primary;  // #0F172A
const TEXT_SECONDARY = theme.palette.text.secondary; // #64748B
const HEAD_BG = '#F8FAFC';
const ROW_BORDER = '#EDF2F7';
const HOVER_BG = alpha(theme.palette.primary.main, 0.045);

/**
 * Premium table shell: rounded bordered card, soft shadow, uppercase
 * letter-spaced header, horizontal-only row separators, hover tint.
 * Keeps the Joy Table `<thead>/<tbody>/<tr>/<td>` markup used across pages.
 */
export default function PremiumTable({ children, minWidth = 640, stickyHeader = false, containerSx, sx, ...tableProps }) {
  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        border: `1px solid ${DIVIDER}`,
        borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        ...containerSx,
      }}
    >
      <Box sx={{ overflowX: 'auto' }}>
        <Table
          hoverRow
          stickyHeader={stickyHeader}
          borderAxis="none"
          sx={{
            minWidth,
            '--TableCell-headBackground': HEAD_BG,
            '--TableRow-hoverBackground': HOVER_BG,
            '--TableCell-paddingX': '16px',
            '--TableCell-paddingY': '12px',
            '& thead th': {
              fontSize: '11.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: TEXT_SECONDARY,
              borderBottom: `1px solid ${DIVIDER}`,
              whiteSpace: 'nowrap',
              verticalAlign: 'middle',
            },
            '& tbody td': {
              fontSize: '14px',
              color: TEXT_PRIMARY,
              borderBottom: `1px solid ${ROW_BORDER}`,
              verticalAlign: 'middle',
            },
            '& tbody tr:last-of-type td': {
              borderBottom: 'none',
            },
            '& tbody tr': {
              transition: 'background-color 120ms ease',
            },
            ...sx,
          }}
          {...tableProps}
        >
          {children}
        </Table>
      </Box>
    </Box>
  );
}

// Per-row width multipliers so shimmer rows read as organic content, not uniform bars.
const ROW_SCALE = [1, 0.82, 0.94, 0.68, 0.88, 0.74, 0.9, 0.64, 0.8, 0.72];

function SkeletonCell({ variant, align, scale }) {
  const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
  const wrap = (node) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: justify }}>{node}</Box>
  );

  switch (variant) {
    case 'id':
      return wrap(<Skeleton variant="text" width={Math.round(44 * scale) + 14} sx={{ fontSize: 14 }} />);
    case 'number':
    case 'time':
      return wrap(<Skeleton variant="text" width={Math.round(48 * scale) + 16} sx={{ fontSize: 14 }} />);
    case 'date':
      return wrap(<Skeleton variant="text" width={Math.round(70 * scale) + 40} sx={{ fontSize: 14 }} />);
    case 'textLong':
      return wrap(<Skeleton variant="text" width={Math.round(190 * scale) + 40} sx={{ fontSize: 14 }} />);
    case 'avatarText':
      return wrap(
        <>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="text" width={Math.round(110 * scale) + 30} sx={{ fontSize: 14 }} />
        </>
      );
    case 'chip':
      return wrap(<Skeleton variant="rounded" width={Math.round(56 * scale) + 20} height={22} sx={{ borderRadius: 999 }} />);
    case 'button':
      return wrap(<Skeleton variant="rounded" width={84} height={30} sx={{ borderRadius: '8px' }} />);
    case 'buttons':
      return wrap(
        <>
          <Skeleton variant="rounded" width={64} height={30} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rounded" width={64} height={30} sx={{ borderRadius: '8px' }} />
        </>
      );
    case 'icon':
      return wrap(<Skeleton variant="circular" width={26} height={26} />);
    case 'text':
    default:
      return wrap(<Skeleton variant="text" width={Math.round(120 * scale) + 30} sx={{ fontSize: 14 }} />);
  }
}

/**
 * Content-aware loading rows. `columns` mirrors the real table's columns:
 * a variant string ('id' | 'text' | 'textLong' | 'avatarText' | 'date' |
 * 'number' | 'time' | 'chip' | 'button' | 'buttons' | 'icon') or
 * `{ variant, align }` to match centered/right-aligned columns.
 */
export function TableSkeleton({ columns, rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`}>
          {columns.map((col, colIndex) => {
            const { variant, align } = typeof col === 'string' ? { variant: col } : col;
            return (
              <td key={colIndex} aria-hidden="true">
                <SkeletonCell
                  variant={variant}
                  align={align}
                  scale={ROW_SCALE[(rowIndex + colIndex) % ROW_SCALE.length]}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

/**
 * Friendly empty state rendered as a full-width table row:
 * soft icon badge, title, and a one-line hint.
 */
export function TableEmptyState({ colSpan, icon: Icon = InboxRoundedIcon, title = 'Nothing here yet', description, action }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ borderBottom: 'none', padding: 0 }}>
        <Box
          sx={{
            py: 7,
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 0.75,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F1F5F9',
              color: '#94A3B8',
              mb: 0.5,
            }}
          >
            <Icon sx={{ fontSize: 26 }} />
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY }}>{title}</Typography>
          {description && (
            <Typography sx={{ fontSize: 13, color: TEXT_SECONDARY, maxWidth: 380 }}>{description}</Typography>
          )}
          {action && <Box sx={{ mt: 1.5 }}>{action}</Box>}
        </Box>
      </td>
    </tr>
  );
}
