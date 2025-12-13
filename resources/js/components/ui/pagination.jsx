import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links, filters = {} }) {
  // Function to add filters to the URL
  const buildUrl = (url) => {
    if (!url) return null;

    const urlObj = new URL(url);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        urlObj.searchParams.set(key, value);
      }
    });
    return urlObj.toString();
  };

  return (
    <div className="flex justify-center whitespace-nowrap gap-1">
      {links.map((link, key) => {
        const url = buildUrl(link.url);

        return (
          <Link
            key={key}
            href={url || '#'}
            className={`px-4 py-2 border rounded ${
              link.active
                ? ''
                : ''
            } ${!url && 'opacity-50 cursor-not-allowed'}`}
            preserveScroll
            disabled={!url}
          >
            <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
          </Link>
        );
      })}
    </div>
  );
}
