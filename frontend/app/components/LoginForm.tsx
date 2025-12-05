"use client";

import { useState } from "react";
import { Input, Button, App } from "antd";
import {
  WalletOutlined,
  KeyOutlined,
  PlusOutlined,
  BookOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { authService } from "../services/authService";

interface LoginFormProps {
  onLogin: (code: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const { message } = App.useApp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    try {
      const response = await authService.generateCode();
      if (response.success && response.data) {
        setCode(response.data.code);
        message.success("Đã tạo mã mới! Hãy lưu lại mã này.");
      } else {
        message.error(response.error || "Không thể tạo mã");
      }
    } catch {
      // Fallback to local generation if API fails
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setCode(result);
      message.success("Đã tạo mã mới! Hãy lưu lại mã này.");
    }
  };

  const handleSubmit = async () => {
    if (code.length !== 12) {
      message.error("Mã truy cập phải có đúng 12 ký tự");
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(code)) {
      message.error("Mã truy cập chỉ chứa chữ cái và số");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(code.toUpperCase());
      if (response.success) {
        message.success("Đăng nhập thành công!");
        onLogin(code.toUpperCase());
      } else {
        message.error(response.error || "Đăng nhập thất bại");
      }
    } catch {
      message.error("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-500 to-blue-600 px-6 pt-20 pb-10">
      {/* Logo & Title */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <WalletOutlined className="text-4xl text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Money Notebook</h1>
        <p className="mt-1 text-blue-100">Quản lý thu chi cá nhân</p>
      </div>

      {/* Form Card */}
      <div className="flex-1">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Mã truy cập
            </label>
            <Input
              size="large"
              prefix={<KeyOutlined className="text-gray-400" />}
              placeholder="Nhập 12 ký tự"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().slice(0, 12))
              }
              onPressEnter={handleSubmit}
              maxLength={12}
              className="!h-14 !rounded-xl font-mono !text-xl tracking-[0.2em]"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>{code.length}/12 ký tự</span>
              <span>Chữ và số</span>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleSubmit}
            className="!h-14 !rounded-xl !text-lg !font-semibold"
          >
            Truy cập
          </Button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-sm text-gray-400">hoặc</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <Button
            size="large"
            block
            icon={<PlusOutlined />}
            onClick={generateCode}
            className="!h-14 !rounded-xl !text-base"
          >
            Tạo mã mới
          </Button>

          {/* Guide Button - Nổi bật */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href="/huong-dan">
              <Button
                type="default"
                size="large"
                block
                className="!h-12 !rounded-xl !border-blue-400 !text-blue-600 hover:!bg-blue-50"
              >
                📖 Hướng dẫn sử dụng
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-blue-100">
          Mỗi mã tương ứng với một sổ ghi chép riêng.
          <br />
          Hãy ghi nhớ mã của bạn!
        </p>
      </div>
    </div>
  );
}
