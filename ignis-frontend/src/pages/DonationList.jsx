import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, message, Empty } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/DonationList.css';

const { Title } = Typography;

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        // ✅ 인증 유지 + 승인된 기부만
        const response = await fetch('/api/donations?status=APPROVED', {
          credentials: 'include',
        });

        if (response.status === 401) {
          message.warning('로그인이 필요합니다.');
          navigate('/login');
          return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('응답이 JSON이 아닙니다.');
        }

        const result = await response.json();
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.donationList)
          ? result.donationList
          : [];

        setDonations(list);
      } catch (error) {
        console.error('Error fetching donations:', error);
        message.error('기부 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [navigate]);

  return (
    <Layout>
      <div className="donation-list-content">
        <Title level={2}>기부 목록</Title>

        {(!loading && donations.length === 0) ? (
          <Empty description="승인된 기부가 없습니다." />
        ) : (
          <Row gutter={[16, 16]}>
            {donations.map((donation) => (
              <Col key={donation.donationId} xs={24} sm={12} md={8}>
                <Card
                  title={donation.title}
                  bordered={false}
                  extra={<Link to={`/donation-detail/${donation.donationId}`}>상세보기</Link>}
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
        )}
      </div>
    </Layout>
  );
};

export default DonationList;
