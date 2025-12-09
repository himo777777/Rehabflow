/**
 * Skip Link Component
 *
 * Allows keyboard users to skip directly to main content.
 * Required for WCAG 2.1 Level A compliance (Success Criterion 2.4.1).
 */

import React from 'react';

interface SkipLinkProps {
  targetId?: string;
  children?: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  children = 'Hoppa till huvudinnehåll'
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
        focus:px-4 focus:py-2
        focus:bg-primary-600 focus:text-white
        focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
        font-medium text-sm
      "
    >
      {children}
    </a>
  );
};

export default SkipLink;
