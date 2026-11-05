import { Bell, Bookmark, BriefcaseBusiness, Compass, Flag, LayoutDashboard, LogOut, Menu, Settings2, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppShell() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const links = user?.role === 'admin'
    ? [{ to: '/admin', label: 'Overview', icon: LayoutDashboard }, { to: '/admin/opportunities', label: 'Opportunities', icon: Compass }, { to: '/admin/applications', label: 'Applications', icon: BriefcaseBusiness }, { to: '/admin/reports', label: 'Reports', icon: Flag }, { to: '/admin/students', label: 'Students', icon: UserRound }]
    : [{ to: '/dashboard', label: 'Overview', icon: LayoutDashboard }, { to: '/explore', label: 'Explore', icon: Compass }, { to: '/saved', label: 'Saved', icon: Bookmark }, { to: '/applications', label: 'Applications', icon: BriefcaseBusiness }, { to: '/notifications', label: 'Notifications', icon: Bell }];
  const closeMenu = () => setMenuOpen(false);
  const leave = () => { signOut(); navigate('/'); };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-button mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <NavLink to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="brand-lockup" onClick={closeMenu}><span className="brand-mark">o<span>.</span></span><span className="brand-name">opportunityhub</span></NavLink>
        <div className="topbar-right">
          <span className="topbar-date">YOUR NEXT MOVE STARTS HERE</span>
          <NavLink to="/profile" className="profile-chip" title="Edit profile">
            {user?.profileImage ? <img src={user.profileImage} alt="" className="avatar-chip-img" /> : <span>{(user?.name || 'Student').slice(0, 1).toUpperCase()}</span>}
            <strong>{user?.name?.split(' ')[0]}</strong>
            <Settings2 size={15} />
          </NavLink>
          <button className="icon-button" onClick={leave} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button>
        </div>
      </header>
      <div className="app-frame">
        <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
          <p className="sidebar-label">WORKSPACE</p>
          <nav>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></NavLink>)}</nav>
          <div className="sidebar-bottom">
            <div className="profile-mini">
              <div className="avatar-small">
                {user?.profileImage ? <img src={user.profileImage} alt="" className="avatar-small-img" /> : (user?.name || 'Student').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <strong>{user?.name}</strong>
                <span>{user?.role === 'admin' ? 'Administrator' : user?.college || 'Student account'}</span>
              </div>
            </div>
            <button className="signout-link" onClick={leave}><LogOut size={16} />Sign out</button>
          </div>
        </aside>
        <main className="main-content"><Outlet /></main>
      </div>
      {menuOpen && <button className="mobile-scrim" onClick={closeMenu} aria-label="Close navigation" />}
    </div>
  );
}
