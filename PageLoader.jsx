import { Box, CircularProgress } from '@mui/material';
import { keyframes } from '@mui/system';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const PageLoader = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, #d4a971 0%, #30a17b 50%, #1f4d3a 100%)`,
        backgroundSize: '400% 400%',
        animation: `${gradientAnimation} 8s ease infinite`,
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} sx={{ color: 'white' }} />
    </Box>
  );
};

export default PageLoader;