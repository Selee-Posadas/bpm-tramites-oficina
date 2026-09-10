import React from 'react';

export interface InternalHeaderProps {
  onMobileToggle: () => void;
}

export interface InternalSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export interface ExternalNavbarProps {
  onMobileToggle?: () => void;
}

export interface ExternalSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

