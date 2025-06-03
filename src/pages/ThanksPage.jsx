import React from 'react';

const ThanksPage = () => {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 space-y-4"
      style={{
        backgroundColor: isDarkMode ? '#121212' : '#f9f9f9',
        color: isDarkMode ? '#fff' : '#000',
        fontFamily: "'Great Vibes', cursive",
      }}
    >
      <div className="text-7xl md:text-8xl">Terima</div>
      <div className="text-5xl md:text-7xl">Kasih 🎉</div>
    </div>
  );
}; 

export default ThanksPage;
