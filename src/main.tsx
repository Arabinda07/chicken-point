import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-stone/theme.css';
import { createRoot } from 'react-dom/client';
import { LayerProvider } from '@astryxdesign/core';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <LayerProvider toast={{ position: 'bottomStart', maxVisible: 2 }}>
    <App />
  </LayerProvider>
);
