import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/DonationList.css';

const { Title } = Typography;

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  
  useEffect(() => {
    // 기부 리스트 데이터를 서버에서 받아오기
    const fetchDonations = async () => {
      try {
        const response = await fetch('http://localhost/donations');
        const result = await response.json();
        
        if (response.ok) {
          setDonations(result); // 기부 프로젝트 목록을 상태로 저장
        } else {
          message.error('기부 목록을 불러오는 데 실패했습니다.');
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        message.error('기부 목록을 불러오는 데 실패했습니다.');
      }
    };

    fetchDonations();
  }, []);

  return (
    <Layout>
      <div className="donation-list-content">
        <Title level={2}>기부 목록</Title>
        
        <Row gutter={[16, 16]}>
          {donations.map((donation) => (
            <Col key={donation.donation_id} xs={24} sm={12} md={8}>
              <Card
                title={donation.title}
                bordered={false}
                extra={<Link to={`/funding/${donation.donation_id}`}>상세보기</Link>}
              >
                <p>{donation.description}</p>
                <p>목표 금액: {donation.maxPrice}원</p>
                <Button type="primary" block>
                  기부하기
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Layout>
  );
};

export default DonationList;
