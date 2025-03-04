import { Provider } from 'react-redux';
import { store } from '../store/store';
import { ExamProvider } from '../context/ExamContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ExamProvider>
        <Component {...pageProps} />
      </ExamProvider>
    </Provider>
  );
}

export default MyApp;