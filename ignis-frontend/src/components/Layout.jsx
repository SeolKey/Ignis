import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Container from './Container';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Container Layout={children}/>
      <Footer />
    </>
  );
};

export default Layout;
