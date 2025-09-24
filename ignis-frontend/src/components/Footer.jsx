import React from 'react';
import { FacebookOutlined, InstagramOutlined, TwitterOutlined, YoutubeOutlined } from '@ant-design/icons';
import '../styles/components/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-links">
          <a href="/about">회사 소개</a>
          <a href="/terms">이용 약관</a>
          <a href="/privacy">개인정보 처리방침</a>
          <a href="/contact">고객센터</a>
        </div>
        <div className="footer-socials">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FacebookOutlined /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><InstagramOutlined /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><TwitterOutlined /></a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><YoutubeOutlined /></a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 IGNIS. 기부·봉사·펀딩 사이트입니다.</p>
        <p>주소: 서울특별시 예시구 예시동 123-45 | 연락처: 010-1234-5678 | 이메일: contact@ignis.com</p>
      </div>
    </footer>
  );
};

export default Footer;
