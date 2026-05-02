# 📝 Hướng dẫn thiết lập Blockchain cho Developer (Kindlink)

Tài liệu này giúp cấu hình MetaMask và môi trường local để tương thích với hệ thống Smart Contract hiện tại của Kindlink trên mạng **Polygon Amoy**.

---

## 1. Cấu hình Mạng Polygon Amoy trên MetaMask

Mọi giao dịch nạp/rút trong dự án này đều diễn ra trên mạng thử nghiệm **Polygon Amoy**. Nếu chưa có mạng này trong MetaMask, hãy thêm mạng thủ công với các thông số sau:

- **Network Name**: `Polygon Amoy Testnet`
- **New RPC URL**: `https://polygon-amoy-bor-rpc.publicnode.com`
- **Chain ID**: `80002`
- **Currency Symbol**: `POL`
- **Block Explorer URL**: `https://amoy.polygonscan.com`

---

## 2. Nhận POL Test (Faucet)

Để thực hiện giao dịch (quyên góp/giải ngân), ví của bạn cần có phí GAS bằng đồng POL. Hãy sử dụng các vòi (faucet) sau để nhận POL miễn phí:

- [Polygon Faucet](https://faucet.polygon.technology/) (Chọn mạng Amoy)
- [Chainlink Faucet](https://faucets.chain.link/polygon-amoy)

---

## 3. Cấu hình Biến môi trường (.env)

Bản code mới yêu cầu các biến môi trường chính xác để kết nối đúng Smart Contract V2. Hãy đảm bảo file `.env` của bạn có các giá trị sau:

### Tại `apps/web/.env` (Frontend):
```bash
# Địa chỉ Smart Contract V2
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1326eac0d25da1a3a96e2a6ed11cec1e4ff965a1
# Tỷ giá quy đổi (phải khớp với Backend)
NEXT_PUBLIC_POL_PER_VND=0.00001
```

### Tại `apps/api/.env` (Backend):
```bash
# Địa chỉ Smart Contract V2
CONTRACT_ADDRESS=0x1326eac0d25da1a3a96e2a6ed11cec1e4ff965a1
# Tỷ giá quy đổi 1 VND = ? POL (Ví dụ: 10,000 VND = 0.1 POL)
POL_PER_VND=0.00001
```

---

## 4. Lưu ý quan trọng khi Phát triển

1. **Duyệt lại chiến dịch (Approve)**:
   Vì chúng ta đã nâng cấp lên Smart Contract V2, các chiến dịch cũ (được tạo trước ngày 02/05/2026) sẽ không thể quyên góp hoặc giải ngân được nữa. 
   **Giải pháp**: Cần vào trang Admin để Duyệt (Approve) lại các chiến dịch. Thao tác này sẽ khởi tạo chiến dịch trên Contract mới.

2. **Ví Hot Wallet & Owner Wallet**:
   Backend sử dụng 2 ví này để xử lý tự động. Nếu bạn chạy API local, hãy đảm bảo 2 ví này (cấu hình trong `.env` của API) có ít nhất **1.0 POL** để trả phí Gas.

3. **Lỗi `network does not support ENS`**:
   Nếu gặp lỗi này, hãy kiểm tra lại biến `CONTRACT_ADDRESS` trong `.env`. Đảm bảo không có dấu cách thừa và địa chỉ bắt đầu bằng `0x`.

---

## 5. Thông tin Smart Contract (V2)

- **Địa chỉ**: `0x1326eac0d25da1a3a96e2a6ed11cec1e4ff965a1`
- **Mạng**: Polygon Amoy Testnet
- **Tính năng mới**: Hỗ trợ giải ngân từng phần (Partial Withdrawal) ngay cả khi chiến dịch đang trong trạng thái `ACTIVE`.
