import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, message, Empty, Skeleton } from 'antd';
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
        // ✅ 새 API 경로 (프록시에 /donation 이미 있음)
        const res = await fetch('/donation/api/list?status=APPROVED&page=0&size=12', {
          credentials: 'include',
        });

        if (res.status === 401) {
          message.warning('로그인이 필요합니다.');
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const list = Array.isArray(data) ? data : (
          Array.isArray(data.data) ? data.data :
          Array.isArray(data.donationList) ? data.donationList : []
        );
        setDonations(list);
      } catch (e) {
        console.error(e);
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

        {loading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Col key={i} xs={24} sm={12} md={8}>
                <Card>
                  <Skeleton active />
                </Card>
              </Col>
            ))}
          </Row>
        ) : donations.length === 0 ? (
          <Empty description="승인된 기부가 없습니다." />
        ) : (
          <Row gutter={[16, 16]}>
            {donations.map((donation) => (
              <Col key={donation.donationId} xs={24} sm={12} md={8}>
                <Card
                  title={donation.title}
                  bordered={false}
                  extra={<Link to={`/donation-detail/${donation.donationId}`}>상세보기</Link>}
                  cover={
                    donation.imagePath ? (
                      <img
                        alt="기부 이미지"
                        src={donation.imagePath}
                        style={{ height: 160, objectFit: 'cover' }}
                      />
                    ) : null
                  }
                >
                  <p style={{ minHeight: 48 }}>{donation.description || '설명이 없습니다.'}</p>
                  <p>목표 금액: {Number(donation.maxPrice || 0).toLocaleString()}원</p>
                  <Button type="primary" block onClick={() => navigate(`/donation-detail/${donation.donationId}`)}>
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
