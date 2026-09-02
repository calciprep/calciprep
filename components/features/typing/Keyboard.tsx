"use client";

import React from 'react';
import './Keyboard.css';

interface KeyboardProps {
  highlightedKey: string;
}

const keyboardLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
  ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
  ['space'],
];

const Keyboard: React.FC<KeyboardProps> = ({ highlightedKey }) => {
  const getSpecialKeyClass = (key: string) => {
    switch (key) {
      case 'backspace': return 'key-backspace';
      case 'tab': return 'key-tab';
      case 'caps': return 'key-caps';
      case 'enter': return 'key-enter';
      case 'shift': return 'key-shift';
      case 'space': return 'key-space';
      default: return '';
    }
  };

  return (
    <div className="keyboard">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const isHighlighted = highlightedKey.toLowerCase() === key.toLowerCase() || (key === 'shift' && highlightedKey.match(/[A-Z~!@#$%^&*()_+{}:"<>?|]/));
            const isSpecial = !key.match(/^[a-z0-9`\-=[\]\\;',./]$/i);
            return (
              <div
                key={key}
                className={`
                  key
                  ${isHighlighted ? 'highlight' : ''}
                  ${isSpecial ? 'special' : ''}
                  ${getSpecialKeyClass(key)}
                `}
              >
                {key === 'space' ? '' : key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
