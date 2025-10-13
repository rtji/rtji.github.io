import React, { useState } from 'react';
import type { FC } from 'react';
import './SidebarNavbar.css';
import HamburgerMenuIcon from '../assets/hamburgerMenu.svg';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Timer', href: '/timer' },
  // Add more items as needed
];

const SidebarNavbar: FC = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside className={`sidebar-navbar${collapsed ? ' collapsed' : ''}`}> 
      <button
        className="collapse-btn"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <img src={HamburgerMenuIcon.src} />
      </button>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarNavbar;
