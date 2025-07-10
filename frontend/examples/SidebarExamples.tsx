// Example: How to use the fixed sidebar constants

import React from 'react';
import { SidebarLinks, ProfileLink } from '@/utils/constants';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Example 1: Simple icon rendering
export const SimpleIconExample = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Navigation Icons</h3>
      {SidebarLinks.map((link, index) => {
        const IconComponent = link.icon;
        return (
          <div key={index} className="flex items-center space-x-3">
            <IconComponent className="w-6 h-6 text-gray-600" />
            <span>{link.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// Example 2: Navigation list with links
export const NavigationList = () => {
  return (
    <nav className="space-y-2">
      {SidebarLinks.map((link, index) => {
        const IconComponent = link.icon;
        return (
          <a
            key={index}
            href={link.href}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IconComponent className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">{link.label}</span>
          </a>
        );
      })}
    </nav>
  );
};

// Example 3: Horizontal navigation bar
export const HorizontalNav = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <nav className="flex items-center space-x-6 p-4 bg-white border-b">
      {SidebarLinks.map((link, index) => {
        const IconComponent = link.icon;
        return (
          <a
            key={index}
            href={link.href}
            className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <IconComponent className="w-6 h-6" />
            <span className="text-xs">{link.label}</span>
          </a>
        );
      })}
      
      {/* Profile link */}
      {user && (
        <a
          href={ProfileLink.href}
          className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-xs">{ProfileLink.label}</span>
        </a>
      )}
    </nav>
  );
};

// Example 4: Mobile bottom navigation
export const MobileBottomNav = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
      <div className="flex justify-around">
        {SidebarLinks.slice(0, 4).map((link, index) => {
          const IconComponent = link.icon;
          return (
            <a
              key={index}
              href={link.href}
              className="flex flex-col items-center space-y-1 py-2"
            >
              <IconComponent className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-600">{link.label}</span>
            </a>
          );
        })}
        
        {/* Profile icon */}
        {user && (
          <a
            href={ProfileLink.href}
            className="flex flex-col items-center space-y-1 py-2"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-xs text-gray-600">{ProfileLink.label}</span>
          </a>
        )}
      </div>
    </nav>
  );
};

// Example 5: Sidebar with active states
export const SidebarWithActiveStates = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold">Family Social</h1>
      </div>
      
      <nav className="px-4 space-y-1">
        {SidebarLinks.map((link, index) => {
          const IconComponent = link.icon;
          const isActive = activeIndex === index;
          
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <IconComponent className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className="font-medium">{link.label}</span>
            </button>
          );
        })}
        
        {/* Profile link */}
        {user && (
          <button
            onClick={() => setActiveIndex(SidebarLinks.length)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeIndex === SidebarLinks.length
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="font-medium">{ProfileLink.label}</span>
          </button>
        )}
      </nav>
    </aside>
  );
};

const SidebarExamples = {
  SimpleIconExample,
  NavigationList,
  HorizontalNav,
  MobileBottomNav,
  SidebarWithActiveStates,
};

export default SidebarExamples;
