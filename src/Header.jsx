import React from 'react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from './config';

const headerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '50px',
  color: 'black',
  display: 'flex',
  alignItems: 'center',
  padding: '0 20px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  zIndex: 5,
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  textDecoration: 'none',
  color: 'black',
  fontWeight: 'bold',
  fontSize: '1.2rem',
};

const logoImageStyle = {
  height: '30px',
  width: '30px',
};

const versionStyle = {
  marginLeft: 'auto',
  fontSize: '0.8rem',
  opacity: 0.8,
};

const Header = () => {
  const { t } = useTranslation();

  return (
    <header style={headerStyle}>
      <a href="/" style={logoStyle}>
        <span>LiteOpenERD</span>
      </a>
      <div style={versionStyle}>
        v{APP_VERSION}
      </div>
    </header>
  );
};

export default Header;
