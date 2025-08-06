import '../styles/globals.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import Script from 'next/script';

import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';

const VantaBackground = () => (
  <div
    id="vanta-background"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
    }}
  />
);

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const vantaEffect = useRef(null);

  const setupVanta = () => {
    if (typeof window !== 'undefined' && window.VANTA && !vantaEffect.current) {
      vantaEffect.current = window.VANTA.BIRDS({
        el: '#vanta-background',
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        backgroundColor: 0x81cfe6,
        color1: 0x2e0e7a,
        color2: 0x32a8c3,
        birdSize: 2.1,
        wingSpan: 26.0,
        separation: 45.0,
      });
    }
  };

  // 💡 Reinitialize Vanta on every route change
  useEffect(() => {
    const handleStart = () => setIsRouteChanging(true);
    const handleComplete = () => {
      setIsRouteChanging(false);
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
      // Delay a bit to ensure DOM is rendered
      setTimeout(setupVanta, 100); 
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    // Initial load
    if (typeof window !== 'undefined') {
      setTimeout(setupVanta, 100);
    }

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [router]);

  return (
    <>
      {/* Required libraries */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
        strategy="afterInteractive"
        onLoad={() => setTimeout(setupVanta, 100)}
      />

      <VantaBackground />

      <Layout>
        {isRouteChanging && (
          <div className="fixed top-0 left-0 w-full z-50">
            <LoadingSpinner />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={router.asPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </Layout>
    </>
  );
}
