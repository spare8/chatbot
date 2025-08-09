// components/PageToolbar.js
import * as React from 'react';
import {Box, IconButton, InputBase, Typography} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PropTypes from 'prop-types';

export default function PageToolbar({
  title,
  onBack,
  onCreate,
  search,
  onSearchChange,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2,
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        {onBack && (
          <IconButton color="inherit" onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
        )}
        {onCreate && (
          <IconButton color="inherit" onClick={onCreate}>
            <AddIcon />
          </IconButton>
        )}
        <Box
          sx={{
            ml: 1,
            px: 1,
            bgcolor: 'rgba(255,255,255,0.12)',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <SearchIcon sx={{mr: 1}} />
          <InputBase
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{color: 'inherit', minWidth: 220}}
          />
        </Box>
      </Box>

      <Typography variant="h6" sx={{textAlign: 'center', flex: 1}}>
        {title}
      </Typography>

      {/* Spacer to balance the left icon group */}
      <Box sx={{width: 48}} />
    </Box>
  );
}

PageToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func, // optional
  onCreate: PropTypes.func, // optional
  search: PropTypes.string, // optional
  onSearchChange: PropTypes.func, // optional
};

PageToolbar.defaultProps = {
  onBack: undefined,
  onCreate: undefined,
  search: '',
  onSearchChange: undefined,
};
