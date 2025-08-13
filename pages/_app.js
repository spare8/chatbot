// pages/_app.js
import * as React from 'react';
import {ThemeProvider} from '@mui/material/styles';
import {darkTheme} from '../lib/theme';
import AppLayout from '../components/AppLayout';
import PropTypes from 'prop-types';
import {ConfigStatusProvider} from '../lib/configStatusContext';

export default function MyApp({Component, pageProps}) {
  const title = Component.title || 'Chatbot';
  return (
    <ThemeProvider theme={darkTheme}>
      <ConfigStatusProvider>
        <AppLayout title={title}>
          <Component {...pageProps} />
        </AppLayout>
      </ConfigStatusProvider>
    </ThemeProvider>
  );
}

MyApp.propTypes = {
  // elementType covers React components; the shape with title satisfies the linter
  Component: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.shape({title: PropTypes.string}),
  ]).isRequired,
  pageProps: PropTypes.object.isRequired,
};
