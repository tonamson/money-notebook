"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Button,
  Tag,
  DatePicker,
  Modal,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Empty,
  Popconfirm,
  message,
  Divider,
  Space,
} from "antd";
import type { FormProps } from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  DeleteOutlined,
  LogoutOutlined,
  EditOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { categoryService, Category } from "../services/categoryService";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string;
  date: string;
}

// Form field type
type TransactionFieldType = {
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  date: Dayjs;
};

interface DashboardProps {
  userCode: string;
  onLogout: () => void;
}

// Demo data
const generateDemoData = (): Transaction[] => {
  const now = dayjs();
  return [
    {
      id: "1",
      type: "income",
      amount: 15000000,
      category: "Lương",
      note: "Lương tháng 12",
      date: now.date(5).hour(9).minute(0).format("YYYY-MM-DD HH:mm"),
    },
    {
      id: "2",
      type: "expense",
      amount: 3500000,
      category: "Hóa đơn",
      note: "Tiền nhà tháng 12",
      date: now.date(1).hour(10).minute(30).format("YYYY-MM-DD HH:mm"),
    },
    {
      id: "3",
      type: "expense",
      amount: 500000,
      category: "Ăn uống",
      note: "Đi ăn với bạn bè",
      date: now.date(3).hour(19).minute(15).format("YYYY-MM-DD HH:mm"),
    },
    {
      id: "4",
      type: "income",
      amount: 2000000,
      category: "Thưởng",
      note: "Thưởng dự án",
      date: now.date(10).hour(14).minute(45).format("YYYY-MM-DD HH:mm"),
    },
    {
      id: "5",
      type: "expense",
      amount: 1200000,
      category: "Mua sắm",
      note: "Mua quần áo",
      date: now.date(15).hour(16).minute(20).format("YYYY-MM-DD HH:mm"),
    },
  ];
};

export default function Dashboard({ userCode, onLogout }: DashboardProps) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(generateDemoData);
  // Mặc định chọn từ đầu tháng đến cuối tháng hiện tại
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Ant Design Form
  const [form] = Form.useForm<TransactionFieldType>();

  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );
  // Categories từ API
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories from API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        categoryService.getCategories("income"),
        categoryService.getCategories("expense"),
      ]);
      if (incomeRes.success && incomeRes.data) {
        setIncomeCategories(incomeRes.data);
      }
      if (expenseRes.success && expenseRes.data) {
        setExpenseCategories(expenseRes.data);
      }
    } catch {
      message.error("Không thể tải danh mục");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Thêm category mới qua API
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const trimmed = newCategoryName.trim();
    const exists = await categoryService.categoryExists(
      trimmed,
      transactionType
    );

    if (exists) {
      message.warning("Danh mục đã tồn tại");
      return;
    }

    const result = await categoryService.createCategory(
      trimmed,
      transactionType
    );

    if (result.success && result.data) {
      if (transactionType === "income") {
        setIncomeCategories([...incomeCategories, result.data]);
      } else {
        setExpenseCategories([...expenseCategories, result.data]);
      }
      setNewCategoryName("");
      form.setFieldValue("category", result.data.name);
      message.success("Đã thêm danh mục mới");
    } else {
      message.error(result.error || "Không thể thêm danh mục");
    }
  };

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = dayjs(t.date);
      return (
        tDate.isAfter(dateRange[0].subtract(1, "day")) &&
        tDate.isBefore(dateRange[1].add(1, "day"))
      );
    });
  }, [transactions, dateRange]);

  // Format date range for display
  const dateRangeLabel = useMemo(() => {
    const start = dateRange[0];
    const end = dateRange[1];
    // Nếu là cùng tháng và từ đầu đến cuối tháng
    if (
      start.date() === 1 &&
      end.date() === end.daysInMonth() &&
      start.month() === end.month() &&
      start.year() === end.year()
    ) {
      return `Tháng ${start.format("MM/YYYY")}`;
    }
    return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
  }, [dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  // Format số tiền đầy đủ, chỉ số không có đơn vị tiền
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionType("expense");
    form.resetFields();
    form.setFieldsValue({
      type: "expense",
      date: dayjs(),
    });
    setIsModalOpen(true);
  };

  const handleEditTransaction = (record: Transaction) => {
    setEditingTransaction(record);
    setTransactionType(record.type);
    form.setFieldsValue({
      type: record.type,
      amount: record.amount,
      category: record.category,
      note: record.note,
      date: dayjs(record.date),
    });
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    message.success("Đã xóa giao dịch");
  };

  // Form handlers
  const onFinish: FormProps<TransactionFieldType>["onFinish"] = (values) => {
    const transaction: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      type: values.type,
      amount: values.amount,
      category: values.category,
      note: values.note || "",
      date: values.date.format("YYYY-MM-DD HH:mm"),
    };

    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTransaction.id ? transaction : t))
      );
      message.success("Đã cập nhật giao dịch");
    } else {
      setTransactions((prev) => [transaction, ...prev]);
      message.success("Đã thêm giao dịch mới");
    }

    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinishFailed: FormProps<TransactionFieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Form validation failed:", errorInfo);
  };

  // Sorted transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    );
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Fixed height, not sticky */}
      <header className="bg-blue-500 px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletOutlined className="text-xl" />
            <span className="font-semibold">Money Notebook</span>
          </div>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={onLogout}
            className="!text-white/80 hover:!text-white"
            size="small"
          />
        </div>
        <p className="mt-1 text-xs text-blue-100">Mã: {userCode}</p>
      </header>

      {/* Main Content with padding for floating button */}
      <div className="px-4 pb-24 pt-4">
        {/* Stats Card */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          {/* Balance */}
          <div className="mb-3 text-center">
            <p className="text-xs text-gray-500">Số dư</p>
            <p
              className={`text-xl font-bold ${
                stats.balance >= 0 ? "text-blue-600" : "text-red-500"
              }`}
            >
              {stats.balance >= 0 ? "+" : ""}
              {formatNumber(stats.balance)}
            </p>
          </div>

          {/* Income & Expense */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                <ArrowUpOutlined className="text-sm text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Thu nhập</p>
                <p className="text-sm font-semibold text-green-600">
                  +{formatNumber(stats.income)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                <ArrowDownOutlined className="text-sm text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Chi tiêu</p>
                <p className="text-sm font-semibold text-red-600">
                  -{formatNumber(stats.expense)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="mt-4 space-y-2">
          {/* Quick filter buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              icon={<CalendarOutlined />}
              onClick={() => {
                setDateRange([
                  dayjs().startOf("month"),
                  dayjs().endOf("month"),
                ]);
              }}
              type={
                dateRange[0].isSame(dayjs().startOf("month"), "day") &&
                dateRange[1].isSame(dayjs().endOf("month"), "day")
                  ? "primary"
                  : "default"
              }
            >
              Tháng này
            </Button>
            <Button
              size="small"
              onClick={() => {
                setDateRange([
                  dayjs().subtract(1, "month").startOf("month"),
                  dayjs().subtract(1, "month").endOf("month"),
                ]);
              }}
              type={
                dateRange[0].isSame(
                  dayjs().subtract(1, "month").startOf("month"),
                  "day"
                )
                  ? "primary"
                  : "default"
              }
            >
              Tháng trước
            </Button>
            <Button
              size="small"
              onClick={() => {
                setDateRange([dayjs().subtract(6, "day"), dayjs()]);
              }}
              type={
                dateRange[0].isSame(dayjs().subtract(6, "day"), "day") &&
                dateRange[1].isSame(dayjs(), "day")
                  ? "primary"
                  : "default"
              }
            >
              7 ngày
            </Button>
            <Button
              size="small"
              onClick={() => {
                setDateRange([dayjs().subtract(29, "day"), dayjs()]);
              }}
              type={
                dateRange[0].isSame(dayjs().subtract(29, "day"), "day") &&
                dateRange[1].isSame(dayjs(), "day")
                  ? "primary"
                  : "default"
              }
            >
              30 ngày
            </Button>
          </div>
          {/* Date range - 2 separate pickers for mobile friendly */}
          <div className="flex items-center gap-2">
            <DatePicker
              value={dateRange[0]}
              onChange={(date) => {
                if (date) {
                  setDateRange([date, dateRange[1]]);
                }
              }}
              format="DD/MM/YYYY"
              allowClear={false}
              size="middle"
              className="flex-1"
              placeholder="Từ ngày"
              inputReadOnly
            />
            <span className="text-gray-400">→</span>
            <DatePicker
              value={dateRange[1]}
              onChange={(date) => {
                if (date) {
                  setDateRange([dateRange[0], date]);
                }
              }}
              format="DD/MM/YYYY"
              allowClear={false}
              size="middle"
              className="flex-1"
              placeholder="Đến ngày"
              inputReadOnly
            />
          </div>
        </div>

        {/* Transaction List */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Giao dịch ({sortedTransactions.length})
            </h2>
            <span className="text-xs text-gray-400">{dateRangeLabel}</span>
          </div>

          {sortedTransactions.length > 0 ? (
            <div className="space-y-2">
              {sortedTransactions.map((t) => (
                <div key={t.id} className="rounded-xl bg-white p-3 shadow-sm">
                  {/* Row 1: Category, Type, Amount */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          t.type === "income" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {t.type === "income" ? (
                          <ArrowUpOutlined className="text-sm text-green-600" />
                        ) : (
                          <ArrowDownOutlined className="text-sm text-red-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {t.category}
                      </span>
                      <Tag
                        color={t.type === "income" ? "green" : "red"}
                        className="!m-0 !text-xs !leading-tight"
                      >
                        {t.type === "income" ? "Thu" : "Chi"}
                      </Tag>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatNumber(t.amount)}
                    </span>
                  </div>

                  {/* Row 2: Date, Note, Actions */}
                  <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">
                        {dayjs(t.date).format("DD/MM/YYYY")} lúc{" "}
                        {dayjs(t.date).format("HH:mm")}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {t.note || "Không có ghi chú"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined className="!text-gray-400" />}
                        onClick={() => handleEditTransaction(t)}
                        className="!h-7 !w-7 !min-w-0 !p-0"
                      />
                      <Popconfirm
                        title="Xóa giao dịch?"
                        onConfirm={() => handleDeleteTransaction(t.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          className="!h-7 !w-7 !min-w-0 !p-0"
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có giao dịch"
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 left-0 right-0 z-10 flex justify-center px-4">
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAddTransaction}
          className="!h-12 !rounded-full !px-6 !font-semibold !shadow-lg"
        >
          Thêm giao dịch
        </Button>
      </div>

      {/* Add/Edit Transaction Modal */}
      <Modal
        title={editingTransaction ? "Sửa giao dịch" : "Thêm giao dịch mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden={false}
        centered
        width="90%"
        style={{ maxWidth: 400 }}
        styles={{ body: { padding: "16px 0" } }}
      >
        <Form<TransactionFieldType>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          initialValues={{
            type: "expense",
            date: dayjs(),
          }}
        >
          <Form.Item<TransactionFieldType> name="type" label="Loại giao dịch">
            <Radio.Group
              onChange={(e) => {
                const newType = e.target.value;
                setTransactionType(newType);
                form.setFieldValue("category", undefined);
              }}
              className="w-full"
            >
              <Radio.Button value="expense" className="w-1/2 text-center">
                Chi tiêu
              </Radio.Button>
              <Radio.Button value="income" className="w-1/2 text-center">
                Thu nhập
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item<TransactionFieldType>
            name="amount"
            label="Số tiền"
            rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
          >
            <InputNumber<number>
              style={{ width: "100%" }}
              size="large"
              min={0}
              step={10000}
              controls={false}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, "") || 0)}
              suffix="₫"
              placeholder="Nhập số tiền"
              className="!text-2xl !font-semibold"
            />
          </Form.Item>

          <Form.Item<TransactionFieldType>
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select
              size="large"
              placeholder="Chọn danh mục"
              loading={loadingCategories}
              options={(transactionType === "income"
                ? incomeCategories
                : expenseCategories
              ).map((cat) => ({ label: cat.name, value: cat.name }))}
              popupRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Space style={{ padding: "0 8px 8px" }}>
                    <Input
                      placeholder="Thêm danh mục mới"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      style={{ width: 180 }}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddCategory}
                    >
                      Thêm
                    </Button>
                  </Space>
                </>
              )}
            />
          </Form.Item>

          <Form.Item<TransactionFieldType>
            name="date"
            label="Ngày giờ"
            rules={[{ required: true, message: "Vui lòng chọn ngày giờ" }]}
          >
            <DatePicker
              className="w-full"
              size="large"
              format="DD/MM/YYYY HH:mm"
              showTime={{ format: "HH:mm" }}
              placeholder="Chọn ngày và giờ"
            />
          </Form.Item>

          <Form.Item<TransactionFieldType> name="note" label="Ghi chú">
            <Input.TextArea
              rows={2}
              placeholder="Nhập ghi chú (tùy chọn)"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item label={null} className="mb-0">
            <div className="flex gap-3">
              <Button block onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" block>
                {editingTransaction ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
