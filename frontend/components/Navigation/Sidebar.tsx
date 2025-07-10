"use client";

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { SidebarLinks, ProfileLink } from '@/utils/constants';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  href, 
  isActive = false, 
  onClick 
}) => {
  const baseClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200";
  const activeClasses = isActive 
    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" 
    : "text-gray-700 hover:bg-gray-100";

  const content = (
    <>
      <div className="w-6 h-6 flex items-center justify-center">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        className={`${baseClasses} ${activeClasses}`}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button 
      className={`${baseClasses} ${activeClasses} w-full text-left`}
      onClick={onClick}
    >
      {content}
    </button>
  );
};

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const isActive = (href: string) => {
    // Simple active route detection - you might want to make this more sophisticated
    if (typeof window !== 'undefined') {
      return window.location.pathname === href;
    }
    return false;
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return user.username 
      ? user.username.substring(0, 2).toUpperCase()
      : user.email.substring(0, 2).toUpperCase();
  };

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 ${className}`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Family Social</h1>
      </div>
      
      <nav className="px-4 space-y-2">
        {/* Regular navigation links */}
        {SidebarLinks.map((link, index) => {
          const IconComponent = link.icon;
          return (
            <SidebarItem
              key={index}
              icon={<IconComponent className="w-6 h-6" />}
              label={link.label}
              href={link.href}
              isActive={link.href ? isActive(link.href) : false}
            />
          );
        })}
        
        {/* Profile link with avatar */}
        {user && (
          <SidebarItem
            icon={
              <Avatar className="w-6 h-6">
                <AvatarImage src={user.profilePicture} alt={user.username} />
                <AvatarFallback className="text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            }
            label={ProfileLink.label}
            href={ProfileLink.href}
            isActive={ProfileLink.href ? isActive(ProfileLink.href) : false}
          />
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
export { SidebarItem };
