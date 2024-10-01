// pages/_app.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../app/globals.css'


function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
