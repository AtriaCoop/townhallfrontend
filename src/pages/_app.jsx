import '@/styles/globals.scss'; // or .css if you're using plain CSS

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
