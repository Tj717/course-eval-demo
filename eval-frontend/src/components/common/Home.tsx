import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import trendLogo from '../../assets/trend.png';
import uploadLogo from '../../assets/upload.png';

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      key: 'trend',
      label: 'View Trends',
      src: trendLogo,
      onClick: () => navigate('/trend'),
    },
    {
      key: 'upload',
      label: 'Upload Data',
      src: uploadLogo,
      onClick: () => navigate('/upload'),
    },
  ];

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        justifyContent: 'space-evenly',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: { xs: 4, sm: 6 },
        px: 4,
        mt: {
          xs: 3,
          sm: 6,
          md: 9,
        }
      }}
    >
      {cards.map(({ key, label, src, onClick }) => (
        <Box
          key={key}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            component="img"
            src={src}
            alt={`${label} logo`}
            sx={{
              objectFit: 'contain',
              width: {
                xs: 160,
                sm: 140,
                md: 300,
              },
              height: {
                xs: 160,
                sm: 140,
                md: 300,
              },
              mb: {
                xs: 2,
                sm: 3,
                md: 4,
              },
            }}
          />

          <Button
            variant="contained"
            size="large"
            onClick={onClick}
            sx={{
              textTransform: 'none',
              fontSize: {
                xs: '1rem',    
                sm: '1.125rem',
                md: '1.25rem', 
              },
              px: {
                xs: 3, 
                sm: 5, 
                md: 6, 
              },
              py: {
                xs: 1, 
                sm: 1.5,
                md: 2, 
              },
            }}
          >
            {label}
          </Button>
        </Box>
      ))}
    </Box>
  );
}
