import { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ThemeContext } from '../../utils/themeContext';
import { logout } from '../../utils/auth';

const Header = () => {
  const { mode, toggleColorMode } = useContext(ThemeContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar position="fixed" sx={{ width: '100%', backgroundColor: '#295851' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 2 }, minHeight: { xs: 96, sm: 64 }, justifyContent: { xs: 'center', sm: 'space-between' }, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: { xs: 1, sm: 1 }, flex: { sm: 1 }, justifyContent: { sm: 'flex-start' } }}>
          <Button
            variant="outlined"
            color="inherit"
            component={Link}
            to="/"
            size="medium"
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              borderWidth: '0.5px',
              borderColor: 'rgba(255,255,255,0.7)',
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.5, sm: 1 },
            }}
          >
            Home
          </Button>
        </Box>

        <Typography
          sx={{
            flexGrow: 0,
            flex: { sm: 2 },
            fontSize: { xs: '1.1rem', sm: '1.6rem', md: '2rem' },
            textAlign: { xs: 'center', sm: 'center' },
            width: { xs: '100%', sm: 'auto' },
            order: { xs: 3, sm: 2 },
            mt: { xs: 1, sm: 0 },
            mx: { sm: 2 },
          }}
        >
          Course Evaluation Data Visualization
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: { xs: 2, sm: 3 }, flex: { sm: 1 }, justifyContent: { sm: 'flex-end' } }}>
          <Button
            color="inherit"
            onClick={toggleColorMode}
            size="medium"
            sx={{
              textTransform: 'none',
              px: { xs: 1.5, sm: 3 },
              py: { xs: 0.5, sm: 1 },
              fontSize: { xs: '0.85rem', sm: '1rem' },
              minWidth: { xs: 'auto', sm: '120px' },
              display: 'flex',
              alignItems: 'center',
            }}
            startIcon={
              mode === 'dark' ? (
                <Brightness7Icon sx={{ fontSize: '1.2rem' }} />
              ) : (
                <Brightness4Icon sx={{ fontSize: '1.2rem' }} />
              )
            }
          >
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            onClick={handleLogout}
            size="medium"
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              borderWidth: '0.5px',
              borderColor: 'rgba(255,255,255,0.7)',
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.5, sm: 1 },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
