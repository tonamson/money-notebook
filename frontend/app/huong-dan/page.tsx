"use client";

import { Button, Divider } from "antd";
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  LoginOutlined,
  PlusCircleOutlined,
  BarChartOutlined,
  FilterOutlined,
  EditOutlined,
  CopyOutlined,
  WalletOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";

export default function HuongDanPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - giống Dashboard */}
      <header className="bg-blue-500 px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletOutlined className="text-xl" />
            <span className="font-semibold">Money Notebook</span>
          </div>
          <Link href="/">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              className="!text-white/80 hover:!text-white"
              size="small"
            />
          </Link>
        </div>
        <p className="mt-1 text-xs text-blue-100">Hướng dẫn sử dụng</p>
      </header>

      {/* Content */}
      <div className="px-4 pb-8 pt-4 space-y-4">
        {/* Intro Card */}
        <div className="rounded-2xl bg-white p-4 shadow-md text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Chào mừng bạn! 💰
          </h2>
          <p className="text-sm text-gray-600">
            Làm theo các bước dưới đây để bắt đầu quản lý thu chi.
          </p>
        </div>

        {/* Step 1 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <UserAddOutlined className="text-lg text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Bước 1: Tạo mã đăng nhập
              </h3>
              <p className="text-xs text-gray-500">
                Nhấn "Tạo mã mới" để bắt đầu
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            <li>• Mã gồm 12 ký tự (chữ và số)</li>
            <li>
              • <strong>Quan trọng:</strong> Lưu lại mã này!
            </li>
            <li>• Không cần email hay mật khẩu</li>
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step1-create-code.png"
              alt="Tạo mã đăng nhập"
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <LoginOutlined className="text-lg text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Bước 2: Đăng nhập</h3>
              <p className="text-xs text-gray-500">
                Nhập mã và nhấn "Truy cập"
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            <li>• Nhập mã 12 ký tự đã lưu</li>
            <li>• Đăng nhập một lần, dùng mãi</li>
            <li>• Dùng cùng mã trên nhiều thiết bị</li>
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step2-login.png"
              alt="Màn hình đăng nhập"
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <PlusCircleOutlined className="text-lg text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Bước 3: Thêm giao dịch
              </h3>
              <p className="text-xs text-gray-500">Nhấn nút "Thêm giao dịch"</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            <li>
              • <strong>Loại:</strong> Thu nhập hoặc Chi tiêu
            </li>
            <li>
              • <strong>Số tiền:</strong> Nhập số VNĐ
            </li>
            <li>
              • <strong>Danh mục:</strong> Chọn hoặc tạo mới
            </li>
            <li>
              • <strong>Ngày:</strong> Chọn ngày giao dịch
            </li>
            <li>
              • <strong>Ghi chú:</strong> Mô tả (tùy chọn)
            </li>
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step3-add-transaction.png"
              alt="Form thêm giao dịch"
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 4 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <BarChartOutlined className="text-lg text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Bước 4: Xem thống kê
              </h3>
              <p className="text-xs text-gray-500">
                Bảng tổng hợp ở đầu màn hình
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            <li>
              • <strong className="text-blue-600">Số dư:</strong> Tổng thu -
              Tổng chi
            </li>
            <li>
              • <strong className="text-green-600">Thu nhập:</strong> Tổng các
              khoản thu
            </li>
            <li>
              • <strong className="text-red-600">Chi tiêu:</strong> Tổng các
              khoản chi
            </li>
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step4-stats.png"
              alt="Bảng thống kê"
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 5 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100">
              <FilterOutlined className="text-lg text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Bước 5: Lọc theo thời gian
              </h3>
              <p className="text-xs text-gray-500">Các nút lọc nhanh</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            <li>
              • <strong>Tháng này/trước:</strong> Xem theo tháng
            </li>
            <li>
              • <strong>7/30 ngày:</strong> Xem gần đây
            </li>
            <li>
              • <strong>Tùy chọn:</strong> Chọn khoảng ngày
            </li>
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step5-filter.png"
              alt="Bộ lọc thời gian"
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 6 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
              <EditOutlined className="text-lg text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Bước 6: Sửa/Xóa giao dịch
              </h3>
              <p className="text-xs text-gray-500">
                Nút thao tác bên phải mỗi giao dịch
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            <li>
              • ✏️ <strong>Sửa:</strong> Chỉnh sửa thông tin
            </li>
            <li>
              • 🗑️ <strong>Xóa:</strong> Xóa giao dịch (có xác nhận)
            </li>
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step6-edit-delete.png"
              alt="Sửa/Xóa giao dịch"
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-2xl bg-blue-50 p-4 shadow-md border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <BulbOutlined className="text-lg text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">💡 Mẹo hay</h3>
          </div>
          <ul className="text-sm text-gray-700 space-y-2 ml-1">
            <li>
              • <strong>Copy mã nhanh:</strong> Nhấn{" "}
              <CopyOutlined className="text-blue-500" /> ở header
            </li>
            <li>
              • <strong>Tạo danh mục:</strong> Gõ tên mới khi thêm giao dịch
            </li>
            <li>
              • <strong>Đồng bộ:</strong> Dùng cùng mã trên nhiều thiết bị
            </li>
            <li>
              • <strong>Ghi ngay:</strong> Đừng quên ghi chép kịp thời!
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <Link href="/">
            <Button
              type="primary"
              size="large"
              className="!rounded-full !px-8 !h-12 !font-semibold !shadow-lg"
            >
              Bắt đầu sử dụng ngay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
