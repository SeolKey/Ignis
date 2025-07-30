const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const KAKAO_API_KEY = 'KakaoAK YOUR_REST_API_KEY'; //  여기에 실제 키 입력
const CID = 'TC0ONETIME'; // 테스트용 CID

// 결제 준비
app.post('/payment/ready', async (req, res) => {
  const { amount, itemName } = req.body;

  try {
    const params = new URLSearchParams({
      cid: CID,
      partner_order_id: 'order_001',
      partner_user_id: 'user_001',
      item_name: itemName,
      quantity: '1',
      total_amount: amount,
      vat_amount: '0',
      tax_free_amount: '0',
      approval_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/payment/cancel',
      fail_url: 'http://localhost:3000/payment/fail',
    });

    const kakaoRes = await axios.post('https://kapi.kakao.com/v1/payment/ready', params, {
      headers: {
        Authorization: KAKAO_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    res.json({ redirectUrl: kakaoRes.data.next_redirect_pc_url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('카카오페이 결제 준비 실패');
  }
});

// 결제 승인 (프론트 success_url에서 pg_token 받아서 호출)
app.post('/payment/approve', async (req, res) => {
  const { pg_token } = req.body;

  try {
    const params = new URLSearchParams({
      cid: CID,
      tid: req.body.tid, // 카카오페이 결제 준비 시 받은 tid
      partner_order_id: 'order_001',
      partner_user_id: 'user_001',
      pg_token,
    });

    const kakaoRes = await axios.post('https://kapi.kakao.com/v1/payment/approve', params, {
      headers: {
        Authorization: KAKAO_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    res.json(kakaoRes.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('카카오페이 결제 승인 실패');
  }
});

app.listen(4000, () => {
  console.log(' KakaoPay Server running on http://localhost:4000');
});
