import React from 'react';

// TODO: Fetch these from Firestore settings or define properly
const HERO_IMAGE_URL = 'https://via.placeholder.com/800x300.png?text=TOGY+Main+Photo'; // Replace with actual image URL
const VISION_TEXT = '하나되어, 세상으로!'; // Replace with actual vision text

function HeroSection() {
  const heroStyle = {
    backgroundImage: `url(${HERO_IMAGE_URL})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '30vh', // Adjust height as needed
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)', // Add shadow for better readability
    textAlign: 'center',
    padding: '20px'
  };

  const visionStyle = {
    fontSize: '1.8em', // Adjust size as needed
    fontWeight: 'bold'
  };

  return (
    <div style={heroStyle}>
      <h1 style={visionStyle}>{VISION_TEXT}</h1>
    </div>
  );
}

export default HeroSection; 