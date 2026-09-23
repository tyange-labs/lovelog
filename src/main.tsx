import { render } from 'solid-js/web';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('#root 엘리먼트를 찾을 수 없습니다.');
}

render(() => <App />, rootElement);
