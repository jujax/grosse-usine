import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('Script loaded'); // Ajoutez ceci pour vérifier que le script est chargé

const App = () => {
    console.log('App component rendered'); // Ajoutez ceci pour vérifier que le composant est rendu
    return <h1>Hello World</h1>;
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
console.log('ReactDOM.render called'); // Ajoutez ceci pour vérifier que ReactDOM.render est appelé
