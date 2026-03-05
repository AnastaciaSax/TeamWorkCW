import { BrowserRouter as Router, Routes, Route, useLocation, Link as RouterLink } from 'react-router-dom';
import { Container, Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Suspense, lazy } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import { NavigationProvider, useNavigationState } from './context/NavigationContext';

const Home = lazy(() => import('./pages/Home/Home'));
const Owners = lazy(() => import('./pages/Owners/Owners'));
const Pets = lazy(() => import('./pages/Pets/Pets'));
const Passport = lazy(() => import('./pages/Passport/Passport'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const PetDetails = lazy(() => import('./pages/Pets/PetDetails'));

const breadcrumbNameMap = {
  '/owners': 'Owners',
  '/pets': 'Pets',
  '/passport': 'Passport',
  '/reports': 'Reports',
};

function AppContent() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  const { isNavigating } = useNavigationState();

  // Если идёт навигация – показываем прелоадер
  if (isNavigating) {
    return <PageLoader />;
  }

  return (
    <>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Home
        </Link>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          return last ? (
            <Typography color="text.primary" key={to}>
              {breadcrumbNameMap[to] || value}
            </Typography>
          ) : (
            <Link component={RouterLink} to={to} key={to} underline="hover" color="inherit">
              {breadcrumbNameMap[to] || value}
            </Link>
          );
        })}
      </Breadcrumbs>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/pets/:id" element={<PetDetails />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <Router>
      <NavigationProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
            <AppContent />
          </Container>
          <Footer />
        </Box>
      </NavigationProvider>
    </Router>
  );
}

export default App;