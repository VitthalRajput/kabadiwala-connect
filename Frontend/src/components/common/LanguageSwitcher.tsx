import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, Language, AVAILABLE_LANGUAGES } from '../../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'header' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentOption =
    AVAILABLE_LANGUAGES.find((opt) => opt.code === language) || AVAILABLE_LANGUAGES[0];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const buttonStyles = {
    navbar:
      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 bg-white hover:border-saffron-400 hover:bg-saffron-50/60 text-gray-800 transition-all shadow-xs tap-bounce cursor-pointer',
    header:
      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 bg-white hover:border-saffron-400 hover:bg-saffron-50/60 text-gray-800 transition-all shadow-2xs tap-bounce cursor-pointer',
    compact:
      'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all shadow-xs cursor-pointer',
  }[variant];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonStyles}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Select Language / भाषा चुनें / भाषा निवडा"
      >
        <Globe className="w-3.5 h-3.5 text-saffron-600 shrink-0" />
        <span className="text-sm mr-0.5">{currentOption.flag}</span>
        <span className="font-semibold text-gray-800">
          {variant === 'compact' ? currentOption.code.toUpperCase() : currentOption.nativeName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-gray-100 shadow-xl py-1.5 z-50 animate-scale-in"
        >
          <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Choose Language / भाषा
          </div>

          {AVAILABLE_LANGUAGES.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(opt.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-saffron-50 text-saffron-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{opt.flag}</span>
                  <div>
                    <span className="block leading-none">{opt.nativeName}</span>
                    <span className="text-[10px] text-gray-400 font-normal leading-none">
                      {opt.label}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-saffron-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
