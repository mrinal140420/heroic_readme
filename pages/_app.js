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
    if (window.VANTA && !vantaEffect.current) {
      vantaEffect.current = window.VANTA.BIRDS({
        el: '#vanta-background',
    mouseControls: true,
  touchControls: true,
  gyroControls: true  ,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
  backgroundColor:0x81cfe6,
  color1: 0x2e0e7a,
  color2: 0x32a8c3,
  birdSize: 2.10,
  wingSpan: 26.00,
  separation: 45.00
      });
    }
  };

  useEffect(() => {
    const handleStart = () => setIsRouteChanging(true);
    const handleComplete = () => setIsRouteChanging(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

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
      {/* Load Three.js before Vanta.js */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
        strategy="afterInteractive"
        onLoad={setupVanta}
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
