"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Spin,
  App,
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
  CopyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { categoryService, Category } from "../services/categoryService";
import {
  transactionService,
  Transaction,
  TransactionStats,
} from "../services/transactionService";

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

export default function Dashboard({ userCode, onLogout }: DashboardProps) {
  const { message } = App.useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Stats
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    startDate: "",
    endDate: "",
  });

  // Copy user code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      message.success("Đã copy mã đăng nhập");
    } catch {
      message.error("Không thể copy");
    }
  };

  // Load categories from API
  const loadCategories = useCallback(async () => {
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
  }, []);

  // Load transactions from API
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await transactionService.getTransactions({
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      });
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch {
      message.error("Không thể tải giao dịch");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load stats from API
  const loadStats = useCallback(async () => {
    try {
      const response = await transactionService.getStats(
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD")
      );
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch {
      console.error("Không thể tải thống kê");
    }
  }, [dateRange]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [loadTransactions, loadStats]);

  // Thêm category mới qua API
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const trimmed = newCategoryName.trim();

    // Check if category exists
    const checkRes = await categoryService.checkExists(
      trimmed,
      transactionType
    );
    if (checkRes.success && checkRes.data?.exists) {
      message.warning("Danh mục đã tồn tại");
      return;
    }

    const result = await categoryService.createCategory({
      name: trimmed,
      type: transactionType,
    });

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
      category: record.categoryName,
      note: record.note,
      date: dayjs(record.transactionDate),
    });
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const response = await transactionService.deleteTransaction(id);
      if (response.success) {
        message.success("Đã xóa giao dịch");
        loadTransactions();
        loadStats();
      } else {
        message.error(response.error || "Không thể xóa giao dịch");
      }
    } catch {
      message.error("Không thể xóa giao dịch");
    }
  };

  // Form handlers
  const onFinish: FormProps<TransactionFieldType>["onFinish"] = async (
    values
  ) => {
    setSubmitting(true);
    try {
      // Find category by name to get categoryId
      const categories =
        values.type === "income" ? incomeCategories : expenseCategories;
      const category = categories.find((c) => c.name === values.category);

      if (!category) {
        message.error("Danh mục không hợp lệ");
        setSubmitting(false);
        return;
      }

      const transactionData = {
        type: values.type,
        amount: values.amount,
        categoryId: category.id,
        note: values.note,
        transactionDate: values.date.format("YYYY-MM-DD"),
      };

      if (editingTransaction) {
        const response = await transactionService.updateTransaction(
          editingTransaction.id,
          transactionData
        );
        if (response.success) {
          message.success("Đã cập nhật giao dịch");
        } else {
          message.error(response.error || "Không thể cập nhật giao dịch");
          setSubmitting(false);
          return;
        }
      } else {
        const response = await transactionService.createTransaction(
          transactionData
        );
        if (response.success) {
          message.success("Đã thêm giao dịch mới");
        } else {
          message.error(response.error || "Không thể thêm giao dịch");
          setSubmitting(false);
          return;
        }
      }

      setIsModalOpen(false);
      form.resetFields();
      loadTransactions();
      loadStats();
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed: FormProps<TransactionFieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Form validation failed:", errorInfo);
  };

  // Sorted transactions
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) =>
        dayjs(b.transactionDate).valueOf() - dayjs(a.transactionDate).valueOf()
    );
  }, [transactions]);

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
        <p className="mt-1 text-xs text-blue-100 flex items-center gap-1">
          Mã: {userCode}
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopyCode}
            className="!text-blue-200 hover:!text-white !p-0 !h-4 !w-4 !min-w-0"
          />
        </p>
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
                <ArrowDownOutlined className="text-sm text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Thu nhập</p>
                <p className="text-sm font-semibold text-green-600">
                  +{formatNumber(stats.totalIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                <ArrowUpOutlined className="text-sm text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Chi tiêu</p>
                <p className="text-sm font-semibold text-red-600">
                  -{formatNumber(stats.totalExpense)}
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

          {loading ? (
            <div className="rounded-xl bg-white p-8 shadow-sm flex justify-center">
              <Spin />
            </div>
          ) : sortedTransactions.length > 0 ? (
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
                          <ArrowDownOutlined className="text-sm text-green-600" />
                        ) : (
                          <ArrowUpOutlined className="text-sm text-red-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {t.categoryName}
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
                        {dayjs(t.transactionDate).format("DD/MM/YYYY")}
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
              controls={false}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, "") || 0)}
              placeholder="Nhập số tiền"
              className="!text-2xl !font-semibold"
              inputMode="numeric"
            />
          </Form.Item>

          <Form.Item<TransactionFieldType>
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select
              size="large"
              placeholder="Tìm hoặc chọn danh mục"
              loading={loadingCategories}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onSearch={setNewCategoryName}
              options={(transactionType === "income"
                ? incomeCategories
                : expenseCategories
              ).map((cat) => ({ label: cat.name, value: cat.name }))}
              notFoundContent={
                newCategoryName.trim() ? (
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={handleAddCategory}
                    className="w-full text-left"
                  >
                    Thêm "{newCategoryName.trim()}"
                  </Button>
                ) : (
                  <span className="text-gray-400">
                    Nhập để tìm hoặc tạo mới
                  </span>
                )
              }
            />
          </Form.Item>

          <Form.Item<TransactionFieldType>
            name="date"
            label="Ngày"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker
              className="w-full"
              size="large"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
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
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
              >
                {editingTransaction ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
