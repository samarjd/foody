import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer>
      <p>©{currentYear} all rights reserved by <strong>Foody</strong></p>
    </footer>
  );
}